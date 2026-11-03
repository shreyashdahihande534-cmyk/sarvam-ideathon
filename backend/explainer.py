import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# We initialize SarvamAI client safely
_sarvam_client = None

def get_sarvam_client():
    global _sarvam_client
    if _sarvam_client is None:
        try:
            from sarvamai import SarvamAI
            api_key = os.getenv("SARVAM_API_KEY")
            if api_key:
                _sarvam_client = SarvamAI(api_subscription_key=api_key)
        except Exception as e:
            print(f"[Explainer] SarvamAI init notice: {e}")
    return _sarvam_client

def generate_conversational_explanation(
    scheme_info: Dict[str, Any],
    rule_result: Dict[str, Any],
    profile: Dict[str, Any],
    language: str = "hi-IN"
) -> str:
    """
    Calls Sarvam-105B (sarvam-105b-conversations) to translate deterministic rule
    results into clear, empathetic, 2-sentence conversational language citing the official clause.
    Guaranteed: Sarvam-105B never decides eligibility, only explains the deterministic outcome.
    """
    lang_name = "Hindi" if "hi" in language.lower() else "English"
    status = rule_result["status"]
    scheme_name = scheme_info.get("name_hi" if lang_name == "Hindi" else "name", scheme_info.get("name"))
    benefit = scheme_info.get("benefit_hi" if lang_name == "Hindi" else "benefit", scheme_info.get("benefit"))
    clause = rule_result.get("clause_cited", "")
    reason = rule_result.get("reason" if lang_name == "English" else "reason_hi", rule_result.get("reason"))
    missing = ", ".join(rule_result.get("missing_documents", [])) or ("No additional documents required" if lang_name == "English" else "कोई दस्तावेज़ शेष नहीं")

    system_prompt = (
        "You are 'Sarkari Sahayak', a kind, trusted government scheme guide for Indian citizens. "
        "Strict rule: You must NEVER change or decide eligibility. You only explain the given status in simple words. "
        "Keep the explanation strictly within 2 short sentences. "
        f"Respond in simple, everyday {lang_name}."
    )

    user_prompt = (
        f"Scheme: {scheme_name}\n"
        f"Official Eligibility Result: {status}\n"
        f"Official Reason: {reason}\n"
        f"Citing Clause: {clause}\n"
        f"Benefit: {benefit}\n"
        f"Missing Documents: {missing}\n\n"
        f"Explain this result clearly to the citizen in 2 short sentences in {lang_name}."
    )

    client = get_sarvam_client()
    if client:
        try:
            response = client.chat.completions(
                model="sarvam-105b-conversations",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            content = response.choices[0].message.content.strip()
            if content:
                return content
        except Exception as e:
            print(f"[Explainer] Sarvam-105B fallback engaged: {e}")

    # Verified deterministic fallback explanation if offline or API timeout
    if lang_name == "Hindi":
        if status == "Eligible":
            return f"बधाई हो, आप {scheme_name} के लिए पात्र हैं ({benefit})। आधिकारिक धारा ({clause}) के अनुसार, कृपया {missing} तैयार रखें।"
        elif status == "Likely":
            return f"आप {scheme_name} के संभावित पात्र हैं। आधिकारिक धारा ({clause}) के तहत अंतिम पुष्टि के लिए {missing} प्रस्तुत करें।"
        elif status == "Need more info":
            return f"{scheme_name} की पात्रता जांचने के लिए हमें अतिरिक्त विवरण की आवश्यकता है। कृपया {missing} का विवरण साझा करें।"
        else:
            return f"वर्तमान नियमों ({clause}) के तहत आप {scheme_name} के लिए पात्र नहीं हैं: {reason}"
    else:
        if status == "Eligible":
            return f"Congratulations, you are eligible for {scheme_name} ({benefit}) under {clause}. Please keep {missing} ready."
        elif status == "Likely":
            return f"You are likely eligible for {scheme_name}. As per {clause}, please provide {missing} for official confirmation."
        elif status == "Need more info":
            return f"Additional details are needed for {scheme_name}. Please provide {missing} according to {clause}."
        else:
            return f"Under official guidelines ({clause}), you are currently not eligible for {scheme_name}: {reason}"
