import os
import base64
import shutil
import subprocess
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from rules import evaluate_scheme_eligibility
from explainer import generate_conversational_explanation
from services.tts_service import generate_bulbul_speech
from services.stt_service import transcribe_audio_saaras
from services.vision_service import parse_document_fields

load_dotenv()

app = FastAPI(title="Sarkari Sahayak API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMES_FILE = os.path.join(BASE_DIR, "..", "data", "schemes.json")
PERSONAS_FILE = os.path.join(BASE_DIR, "..", "data", "test_personas.json")
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

def load_schemes_data():
    with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)["schemes"]

def load_personas_data():
    with open(PERSONAS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Result field localization (rules engine emits English; UI needs Hindi too) ---
STATUS_HI = {
    "Eligible": "पात्र",
    "Likely": "संभावित रूप से पात्र",
    "Not eligible": "अपात्र",
    "Need more info": "अधिक जानकारी आवश्यक",
}

DOCS_HI = {
    "Land Record (Khatauni / RoR)": "भूमि अभिलेख (खतौनी / RoR)",
    "Aadhaar Linked Bank Account": "आधार से लिंक्ड बैंक खाता",
    "Ration Card (BPL/NFSA/Antyodaya)": "राशन कार्ड (BPL/NFSA/Antyodaya)",
    "Family Aadhaar Cards": "परिवार के सदस्यों के आधार कार्ड",
    "Valid State Ration Card": "राज्य का वैध राशन कार्ड",
    "State NFSA Ration Card": "राज्य NFSA राशन कार्ड",
    "UP Domicile Certificate": "यूपी निवास प्रमाण पत्र",
    "Khatauni or Shramik Card": "खतौनी या श्रमिक कार्ड",
    "Bank Savings Account Passbook / Auto-debit Mandate": "बचत बैंक खाता पासबुक / ऑटो-डेबिट अनुमंदन",
    "Bank Savings Account Passbook": "बचत बैंक खाता पासबुक",
    "BPL Ration Card or 14-point Annexure I declaration": "BPL राशन कार्ड या 14-सूत्रीय अनुलग्नक-I घोषणा",
    "Bank Passbook": "बैंक पासबुक",
    "Income Certificate or BPL Card": "आय प्रमाण पत्र या BPL कार्ड",
}

CLAUSE_HI = {
    "PM-KISAN Guidelines 2019, Section 2.1 & Exclusion Clause 3.1": "PM-KISAN दिशानिर्देश 2019, धारा 2.1 एवं वर्जन खंड 3.1",
    "PM-JAY National Health Agency Guidelines 2018 (SECC Deprivation D1-D7 Criteria)": "PM-JAY राष्ट्रीय स्वास्थ्य एजेंसी दिशानिर्देश 2018 (SECC वंचन D1-D7 मानदंड)",
    "Pradhan Mantri Ujjwala Yojana 2.0 Guidelines (MoPNG 2021, Clause 3)": "प्रधानमंत्री उज्ज्वला योजना 2.0 दिशानिर्देश (MoPNG 2021, खंड 3)",
    "PFRDA (Atal Pension Yojana) Regulations 2015, Regulation 3 (Entry Age 18-40 Years)": "PFRDA (अटल पेंशन योजना) विनियम 2015, विनियम 3 (प्रवेश आयु 18-40 वर्ष)",
    "UP Revenue Dept Order No. 451/2020 (Mukhyamantri Kisan Evam Sarvhit Durghatna Kalyan Yojana)": "यूपी राजस्व विभाग आदेश सं. 451/2020 (मुख्यमंत्री किसान एवं सर्वहित दुर्घटना कल्याण योजना)",
}

def localize_result_fields(entry: Dict[str, Any], language: str) -> Dict[str, Any]:
    status = entry.get("status", "")
    if "hi" in language:
        entry["status_label"] = STATUS_HI.get(status, status)
    else:
        entry["status_label"] = status
    return entry

class ProfilePayload(BaseModel):
    age: int
    gender: Optional[str] = "male"
    occupation: Optional[str] = "farmer"
    annual_income: int
    state: Optional[str] = "Uttar Pradesh"
    landholding_hectares: Optional[float] = 0.0
    has_lpg_connection: Optional[bool] = False
    is_income_tax_payer: Optional[bool] = False
    category: Optional[str] = "General"
    language: Optional[str] = "hi-IN"

class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "hi-IN"
    speaker: Optional[str] = None

@app.get("/api/health")
def health():
    has_key = bool(os.getenv("SARVAM_API_KEY"))
    return {"status": "ok", "sarvam_api_key_configured": has_key}

@app.get("/api/schemes")
def get_schemes():
    return load_schemes_data()

@app.get("/api/personas")
def get_personas():
    return load_personas_data()

@app.post("/api/eligibility/check")
def check_eligibility(payload: ProfilePayload):
    schemes = load_schemes_data()
    profile_dict = payload.dict()
    language = payload.language or "hi-IN"
    results = []

    for s in schemes:
        rule_res = evaluate_scheme_eligibility(profile_dict, s["id"])

        # Localize the rule result before the explainer composes with it
        rule_res_local = dict(rule_res)
        if "hi" in language:
            rule_res_local["clause_cited"] = CLAUSE_HI.get(
                rule_res_local.get("clause_cited", ""), rule_res_local.get("clause_cited", ""))
            rule_res_local["missing_documents"] = [
                DOCS_HI.get(d, d) for d in rule_res_local.get("missing_documents", [])
            ]

        explanation = generate_conversational_explanation(
            scheme_info=s,
            rule_result=rule_res_local,
            profile=profile_dict,
            language=language
        )
        
        # We also generate initial Bulbul audio for eligible/likely schemes
        audio_uri = None
        if rule_res["status"] in ["Eligible", "Likely"]:
            try:
                audio_uri = generate_bulbul_speech(
                    text=explanation,
                    language_code=language,
                    speaker="ritu" if "hi" in language else "simran"
                )
            except Exception as e:
                print(f"[API] TTS generation note: {e}")

        results.append({
            "id": s["id"],
            "name": s["name_hi"] if "hi" in language else s["name"],
            "name_en": s["name"],
            "benefit": s["benefit_hi"] if "hi" in language else s["benefit"],
            "status": rule_res["status"],
            "reason": rule_res["reason_hi"] if "hi" in language else rule_res["reason"],
            "explanation": explanation,
            "clause_cited": rule_res_local["clause_cited"],
            "missing_documents": rule_res_local["missing_documents"],
            "audio_uri": audio_uri
        })

        localize_result_fields(results[-1], language)

    return {
        "profile": profile_dict,
        "results": results,
        "disclaimer": "यह परिणाम केवल मार्गदर्शन के लिए है, आधिकारिक निर्धारण नहीं। (Results are guidance, not an official determination.)"
    }

@app.post("/api/tts")
def tts_endpoint(req: TTSRequest):
    audio_uri = generate_bulbul_speech(
        text=req.text,
        language_code=req.language or "hi-IN",
        speaker=req.speaker or "ritu"
    )
    if not audio_uri:
        raise HTTPException(status_code=500, detail="Failed to synthesize speech")
    return {"audio_uri": audio_uri}


@app.post("/api/tts/local")
def tts_local_endpoint(req: TTSRequest):
    """Guaranteed offline voice via espeak-ng (no API key needed). New endpoint; existing contracts untouched."""
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    exe = shutil.which("espeak-ng") or shutil.which("espeak")
    if not exe:
        raise HTTPException(status_code=501, detail="Local TTS engine (espeak-ng) not installed")
    lang = "hi-IN" if "hi" in (req.language or "").lower() else "en"
    voice = "hi" if lang == "hi-IN" else "en"
    try:
        out = subprocess.run(
            [exe, "-v", voice, "-s", "145", "--stdout", text[:400]],
            capture_output=True, timeout=25, check=True
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Local TTS synthesis failed")
    return {"audio_uri": "data:audio/wav;base64," + base64.b64encode(out.stdout).decode("ascii")}

@app.post("/api/documents/parse")
async def parse_doc(file: UploadFile = File(...), doc_type: str = Form(...)):
    content = await file.read()
    result = parse_document_fields(doc_type=doc_type, file_bytes=content, filename=file.filename)
    return result

@app.post("/api/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...), language: str = Form("hi-IN")):
    content = await file.read()
    res = transcribe_audio_saaras(audio_bytes=content, filename=file.filename, language_code=language)
    return res

# Mount static frontend
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
