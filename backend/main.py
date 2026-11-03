import os
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
        explanation = generate_conversational_explanation(
            scheme_info=s,
            rule_result=rule_res,
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
            "clause_cited": rule_res["clause_cited"],
            "missing_documents": rule_res["missing_documents"],
            "audio_uri": audio_uri
        })

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
