import os
import io
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def transcribe_audio_saaras(audio_bytes: bytes, filename: str = "audio.wav", language_code: str = "hi-IN") -> Dict[str, Any]:
    """
    Transcribes Indic voice input using Sarvam Saaras v4.
    """
    api_key = os.getenv("SARVAM_API_KEY")
    lang = "hi-IN" if "hi" in language_code.lower() else "en-IN"

    if not api_key or not audio_bytes:
        return {"transcript": "", "language_code": lang, "confidence": 0.0}

    try:
        from sarvamai import SarvamAI
        client = SarvamAI(api_subscription_key=api_key)
        
        file_obj = (filename, io.BytesIO(audio_bytes), "audio/wav")
        response = client.speech_to_text.transcribe(
            file=file_obj,
            model="saaras:v4",
            mode="transcribe",
            language_code=lang
        )
        return {
            "transcript": response.transcript,
            "language_code": response.language_code or lang,
            "confidence": getattr(response, "language_probability", 0.95)
        }
    except Exception as e:
        print(f"[STT] Saaras transcription note: {e}")
        return {"transcript": "", "language_code": lang, "error": str(e)}
