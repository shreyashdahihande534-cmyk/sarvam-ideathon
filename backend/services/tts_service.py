import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

def generate_bulbul_speech(text: str, language_code: str = "hi-IN", speaker: Optional[str] = None) -> Optional[str]:
    """
    Generates high quality Indic voice audio using Sarvam Bulbul v3.
    Returns base64 audio data URI: data:audio/wav;base64,...
    """
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key or not text:
        return None

    try:
        from sarvamai import SarvamAI
        client = SarvamAI(api_subscription_key=api_key)
        
        lang = "hi-IN" if "hi" in language_code.lower() else "en-IN"
        
        if not speaker or speaker == "default":
            voice_speaker = "ritu" if lang == "hi-IN" else "simran"
        else:
            voice_speaker = speaker

        response = client.text_to_speech.convert(
            text=text[:500], # safe limit for sentence reading
            language_code=lang,
            speaker=voice_speaker,
            model="bulbul:v3"
        )
        if response.audios and len(response.audios) > 0:
            return f"data:audio/wav;base64,{response.audios[0]}"
    except Exception as e:
        print(f"[TTS] Bulbul conversion error: {e}")
    return None
