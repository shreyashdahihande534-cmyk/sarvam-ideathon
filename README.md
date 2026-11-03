# Sarkari Sahayak (सरकारी सहायक) 🇮🇳
**Voice-First Citizen Welfare Eligibility & Guided Application Agent**
Powered by **Sarvam AI APIs** (Saaras v4, Sarvam-105B, Sarvam Vision, Bulbul v3)

---

## 🚀 Overview
Sarkari Sahayak empowers Indian citizens to discover welfare schemes they qualify for through natural voice conversation in their regional language, verifies eligibility against official clauses, scans identification documents without compromising privacy, and guides them step-by-step through application forms.

---

## 🛠️ Stack & Sarvam AI Integration
- **Speech-to-Text (STT)**: `saaras:v4` (22+ Indic languages + Indian English)
- **Conversational Explanation & RAG**: `sarvam-105b-conversations`
- **Document Intelligence (OCR)**: Sarvam Vision / DocAI with confidence calibration & low-confidence voice confirmation
- **Text-to-Speech (TTS)**: `bulbul:v3` (Indic regional voices: Ritu, Aditya, Shubh)
- **Backend**: FastAPI + Python 3.10
- **Frontend**: Responsive, mobile-first Web UI with live audio waveform and 8 test personas

---

## 🔒 Privacy & Compliance
- **Zero Permanent PII Storage**: All Aadhaar numbers and raw document buffers exist purely in-memory during the active session.
- **Strict Masking**: Aadhaar is always sanitized as `XXXX-XXXX-1234` in UI, network responses, and logs.
- **Deterministic Guardrails**: LLMs never make eligibility decisions alone; deterministic JSON rules enforce statutory clauses.

---

## ⚙️ Setup & Running

### 1. Requirements
- Python 3.10+
- Sarvam AI API Key

### 2. Environment Variables
Create a `.env` file in the project root:
```bash
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Application Server
```bash
cd backend
python main.py
```
Open **`http://127.0.0.1:8000`** in your browser.

---

## 🧪 Running Persona Benchmark Tests
Verify the 8 test personas against statutory criteria:
```bash
cd backend
python test_personas_runner.py
```
*Expected: All 8 personas match 100% expected eligibility outcomes across all 5 schemes.*
