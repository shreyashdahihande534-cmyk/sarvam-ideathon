from typing import Dict, Any, List

def evaluate_scheme_eligibility(profile: Dict[str, Any], scheme_id: str) -> Dict[str, Any]:
    """
    Deterministic rule engine for 5 target welfare schemes.
    Statuses: 'Eligible', 'Likely', 'Not eligible', 'Need more info'
    """
    age = profile.get("age", 0)
    gender = profile.get("gender", "male").lower()
    occupation = profile.get("occupation", "").lower()
    income = profile.get("annual_income", 0)
    state = profile.get("state", "").strip()
    land = profile.get("landholding_hectares", 0.0)
    has_lpg = profile.get("has_lpg_connection", True)
    is_tax_payer = profile.get("is_income_tax_payer", False)
    category = profile.get("category", "General").upper()

    # --- 1. PM-KISAN ---
    if scheme_id == "pm_kisan":
        clause = "PM-KISAN Guidelines 2019, Section 2.1 & Exclusion Clause 3.1"
        if is_tax_payer:
            return {
                "status": "Not eligible",
                "reason": "Income tax payers and institutional landholders are excluded under Section 3.1.",
                "reason_hi": "आयकर दाता होने के कारण आप धारा 3.1 के तहत अपात्र हैं।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if land > 0 and land <= 2.0 and ("farmer" in occupation or "kisan" in occupation or land > 0):
            return {
                "status": "Eligible",
                "reason": f"You hold {land} hectares of cultivable land (under the 2-hectare ceiling) and are not an income tax payee.",
                "reason_hi": f"आपके पास {land} हेक्टेयर कृषि भूमि है (2 हेक्टेयर की सीमा के भीतर) और आप आयकर दाता नहीं हैं।",
                "clause_cited": clause,
                "missing_documents": ["Land Record (Khatauni / RoR)", "Aadhaar Linked Bank Account"]
            }
        elif land > 2.0:
            return {
                "status": "Not eligible",
                "reason": f"Cultivable landholding ({land} ha) exceeds the 2.0 hectare limit for small & marginal farmers.",
                "reason_hi": f"आपकी भूमि ({land} हेक्टेयर) 2.0 हेक्टेयर की सीमा से अधिक है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        else:
            return {
                "status": "Not eligible",
                "reason": "PM-KISAN requires ownership of cultivable agricultural land in the applicant's name.",
                "reason_hi": "पीएम-किसान के लिए आवेदक के नाम पर कृषि योग्य भूमि होना अनिवार्य है।",
                "clause_cited": clause,
                "missing_documents": []
            }

    # --- 2. AYUSHMAN BHARAT (PM-JAY) ---
    elif scheme_id == "ayushman_bharat":
        clause = "PM-JAY National Health Agency Guidelines 2018 (SECC Deprivation D1-D7 Criteria)"
        if is_tax_payer or income > 250000:
            return {
                "status": "Not eligible",
                "reason": "Household income exceeds low-income/deprivation threshold or member pays income tax.",
                "reason_hi": "पारिवारिक आय सीमा से अधिक है या परिवार में आयकर दाता है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if (income <= 100000 and (category in ["SC", "ST"] or "laborer" in occupation or "farmer" in occupation or "homemaker" in occupation)):
            return {
                "status": "Eligible",
                "reason": "Household falls under vulnerable/deprivation economic criteria (annual income under ₹1,00,000 or marginalized category).",
                "reason_hi": "आपका परिवार सामाजिक-आर्थिक मानदंड (वार्षिक आय ₹1,00,000 से कम अथवा वंचित वर्ग) के अंतर्गत पात्र है।",
                "clause_cited": clause,
                "missing_documents": ["Ration Card (BPL/NFSA/Antyodaya)", "Family Aadhaar Cards"]
            }
        elif income <= 120000:
            return {
                "status": "Likely",
                "reason": "Household income is within the borderline bracket; eligibility depends on local SECC/Ration Card category inclusion.",
                "reason_hi": "आपकी आय सीमांत श्रेणी में है; पात्रता राशन कार्ड या एसईसीसी सूची में नाम पर निर्भर करेगी।",
                "clause_cited": clause,
                "missing_documents": ["Valid State Ration Card"]
            }
        else:
            return {
                "status": "Need more info",
                "reason": "Requires verification against SECC database or active NFSA priority ration card list.",
                "reason_hi": "राशन कार्ड या एसईसीसी डेटाबेस से सत्यापन की आवश्यकता है।",
                "clause_cited": clause,
                "missing_documents": ["State NFSA Ration Card"]
            }

    # --- 3. PM UJJWALA YOJANA 2.0 ---
    elif scheme_id == "pm_ujjwala":
        clause = "Pradhan Mantri Ujjwala Yojana 2.0 Guidelines (MoPNG 2021, Clause 3)"
        if has_lpg:
            return {
                "status": "Not eligible",
                "reason": "Household already has an active LPG connection in any member's name.",
                "reason_hi": "घर में पहले से एलपीजी गैस कनेक्शन मौजूद है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if gender != "female" or age < 18:
            return {
                "status": "Not eligible",
                "reason": "Ujjwala connections are issued solely in the name of an adult woman (age 18+) of the household.",
                "reason_hi": "उज्ज्वला योजना के तहत कनेक्शन केवल परिवार की वयस्क महिला (18+ वर्ष) के नाम पर जारी किया जाता है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if income <= 120000 or category in ["SC", "ST", "BPL"]:
            return {
                "status": "Eligible",
                "reason": "Adult woman from an eligible poor household without existing LPG connection.",
                "reason_hi": "बिना गैस कनेक्शन वाले गरीब परिवार की वयस्क महिला होने के कारण आप पात्र हैं।",
                "clause_cited": clause,
                "missing_documents": ["BPL Ration Card or 14-point Annexure I declaration", "Bank Passbook"]
            }
        else:
            return {
                "status": "Need more info",
                "reason": "Requires proof of BPL/PMAY status or inclusion in the 14-point declaration categories.",
                "reason_hi": "बीपीएल/पीएमएवाई प्रमाण पत्र या 14-सूत्रीय घोषणा पत्र की आवश्यकता है।",
                "clause_cited": clause,
                "missing_documents": ["Income Certificate or BPL Card"]
            }

    # --- 4. ATAL PENSION YOJANA (APY) ---
    elif scheme_id == "atal_pension":
        clause = "PFRDA (Atal Pension Yojana) Regulations 2015, Regulation 3 (Entry Age 18-40 Years)"
        if is_tax_payer:
            return {
                "status": "Not eligible",
                "reason": "Government notification bars income tax payers from enrolling in APY after Oct 1, 2022.",
                "reason_hi": "1 अक्टूबर 2022 के सरकारी नियम के अनुसार आयकर दाता APY में शामिल नहीं हो सकते।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if age < 18:
            return {
                "status": "Not eligible",
                "reason": f"Current age ({age}) is below minimum entry age of 18 years.",
                "reason_hi": f"आपकी आयु ({age} वर्ष) न्यूनतम 18 वर्ष से कम है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if age > 40:
            return {
                "status": "Not eligible",
                "reason": f"Current age ({age}) exceeds maximum entry limit of 40 years.",
                "reason_hi": f"आपकी आयु ({age} वर्ष) अधिकतम प्रवेश सीमा 40 वर्ष से अधिक है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        return {
            "status": "Eligible",
            "reason": f"Applicant is {age} years old (within 18-40 window), not an income tax payer, and eligible for guaranteed monthly pension.",
            "reason_hi": f"आपकी आयु {age} वर्ष है (18-40 वर्ष के बीच) और आप आयकर दाता नहीं हैं। आप गारंटीड पेंशन के पात्र हैं।",
            "clause_cited": clause,
            "missing_documents": ["Bank Savings Account Passbook / Auto-debit Mandate"]
        }

    # --- 5. STATE SCHEME: UP KISAN DURGHATNA BIMA ---
    elif scheme_id == "up_kisan_durghatna":
        clause = "UP Revenue Dept Order No. 451/2020 (Mukhyamantri Kisan Evam Sarvhit Durghatna Kalyan Yojana)"
        if state.lower() not in ["uttar pradesh", "up"]:
            return {
                "status": "Not eligible",
                "reason": "Applicable exclusively to bona fide residents of Uttar Pradesh.",
                "reason_hi": "यह योजना केवल उत्तर प्रदेश के मूल निवासियों के लिए लागू है।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if is_tax_payer or "salaried" in occupation or "professional" in occupation:
            return {
                "status": "Not eligible",
                "reason": "Salaried professionals and income tax payees are excluded from state welfare bima.",
                "reason_hi": "वेतनभोगी पेशेवर और आयकर दाता राज्य कल्याण बीमा से अपात्र हैं।",
                "clause_cited": clause,
                "missing_documents": []
            }
        if ("farmer" in occupation or "laborer" in occupation or "kisan" in occupation) or (land > 0 and land <= 2.5):
            return {
                "status": "Eligible",
                "reason": "Resident of UP engaged in agriculture or agricultural labor; covered up to ₹5 Lakh insurance benefit.",
                "reason_hi": "उत्तर प्रदेश के किसान/कृषि श्रमिक होने के नाते आप ₹5 लाख तक की दुर्घटना बीमा सुरक्षा के पात्र हैं।",
                "clause_cited": clause,
                "missing_documents": ["UP Domicile Certificate", "Khatauni or Shramik Card"]
            }
        return {
            "status": "Not eligible",
            "reason": "Requires engagement in farming, sharecropping, or agricultural labor in Uttar Pradesh.",
            "reason_hi": "उत्तर प्रदेश में खेती, बटाईदारी अथवा कृषि मजदूरी में संलग्न होना आवश्यक है।",
            "clause_cited": clause,
            "missing_documents": []
        }

    return {
        "status": "Need more info",
        "reason": "Scheme rules need additional parameters.",
        "reason_hi": "अतिरिक्त जानकारी की आवश्यकता है।",
        "clause_cited": "General Scheme Verification",
        "missing_documents": []
    }
