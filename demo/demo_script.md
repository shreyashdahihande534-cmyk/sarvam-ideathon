# Sarkari Sahayak: 2-Minute Demo Script & Fallback Plan

## ⏱️ 2-Minute Demo Script

| Timestamp | Screen / Flow | Action & Spoken Script | Tech Behind the Scenes |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:25** | **Header & Language** | "Namaste! This is Sarkari Sahayak, a voice-first agent built with Sarvam AI for 1 billion Indian citizens. Let's switch to Hindi and pick Ramesh, a small farmer from Uttar Pradesh." | Language state switch (`hi-IN`) |
| **0:25 - 0:50** | **Voice Interview** | Click Mic button or select Persona. "मेरी उम्र 38 साल है और मैं उत्तर प्रदेश में किसान हूँ।" Show live waveform and transcription. | **Saaras v4** automatic speech recognition |
| **0:50 - 1:15** | **Document Verification** | Click "नमूना आधार कार्ड अपलोड करें". Show extracted name, age, masked ID (`XXXX-XXXX-9842`), and 74% confidence alert on State. Click "🎙️ पुष्टि करें" to confirm by voice. | **Sarvam Vision / DocAI** + low-confidence voice confirmation |
| **1:15 - 1:40** | **Deterministic Eligibility** | Click "योजना पात्रता परिणाम देखें". Show PM-KISAN & Ayushman Bharat (Eligible), PM Ujjwala (Not Eligible - has LPG). Click "🔊 सुनें" next to PM-KISAN. | **Deterministic Rule Engine** + **Sarvam-105B** conversational explainer + **Bulbul v3** natural TTS audio |
| **1:40 - 2:00** | **Form Walkthrough** | Click "आवेदन गाइड देखें". Show auto-prefilled PM-KISAN application with masked Aadhaar, verified land (1.2 ha), and one-click voice confirmation. | Auto-prefill engine + audit trail |

---

## 🛡️ Fallback Plan (Zero-Fail Guarantee)
1. **Network Timeout / Mic Permission Denied**:
   - The UI includes quick-select persona pills across the top ribbon and manual profile dropdowns.
   - If browser microphone access is blocked or uncalibrated, the UI automatically engages mock audio stream simulation.
2. **Sarvam API Rate Limit or Connectivity Interruption**:
   - The backend `explainer.py` catches API exceptions and serves statutory verified explanations citing official clauses.
   - `tts_service.py` falls back gracefully to cached audio or browser speech synthesis without blocking application flow.
