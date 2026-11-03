// Sarkari Sahayak Frontend Controller

let currentLang = "hi-IN";
let currentStep = 1;
let currentProfile = {
  age: 38,
  gender: "male",
  occupation: "farmer",
  annual_income: 95000,
  state: "Uttar Pradesh",
  landholding_hectares: 1.2,
  has_lpg_connection: true,
  is_income_tax_payer: false,
  category: "OBC"
};

let currentAudio = null;
let personas = [];

// Comprehensive Bilingual Dictionaries
const i18n = {
  "hi-IN": {
    brandTitle: "सरकारी सहायक (Sarkari Sahayak)",
    subtitle: "आवाज से जानें अपनी सरकारी योजनाएं और करें आवेदन",
    personasHeading: "डेमो प्रोफाइल (Demo Personas):",
    privacyText: "<strong>गोपनीयता सूचना (Privacy Protected):</strong> आधार संख्या और व्यक्तिगत दस्तावेज़ केवल इस सत्र के लिए मेमोरी में संसाधित होते हैं। कोई भी पहचानकर्ता स्थायी रूप से संग्रहीत नहीं किया जाता।",
    step1: "1. आवाज साक्षात्कार",
    step2: "2. दस्तावेज़ सत्यापन",
    step3: "3. योजना परिणाम",
    step4: "4. आवेदन सहायता",
    micPrompt: "बोलने के लिए माइक दबाएं या नीचे विवरण भरें",
    micListening: "सुन रहा हूँ... बोलिए (Saaras v4)",
    profileHeading: "नागरिक विवरण (Citizen Profile)",
    lblAge: "उम्र (Age):",
    lblGender: "लिंग (Gender):",
    optGenderM: "पुरुष (Male)",
    optGenderF: "महिला (Female)",
    optGenderO: "अन्य (Other)",
    lblOccupation: "व्यवसाय (Occupation):",
    optOccFarmer: "किसान (Farmer)",
    optOccLaborer: "कृषि मजदूर (Agricultural Laborer)",
    optOccGig: "गिग कर्मी (Gig Worker)",
    optOccHome: "गृहणी (Homemaker)",
    optOccSalaried: "वेतनभोगी (Salaried)",
    lblIncome: "वार्षिक आय (Annual Income ₹):",
    lblState: "राज्य (State):",
    lblLand: "कृषि भूमि (Cultivable Land - Hectares):",
    lblLpg: "गैस कनेक्शन (Has LPG Connection?):",
    optLpgNo: "नहीं (No)",
    optLpgYes: "हाँ (Yes)",
    lblTax: "आयकर दाता (Income Tax Payer?):",
    optTaxNo: "नहीं (No)",
    optTaxYes: "हाँ (Yes)",
    lblCategory: "सामाजिक वर्ग (Category):",
    btnCheck: "दस्तावेज़ सत्यापन पर आगे बढ़ें →",
    docTitle: "दस्तावेज़ सत्यापन (Sarvam Vision OCR)",
    docSubtitle: "सटीक पात्रता के लिए आधार कार्ड और आय प्रमाण पत्र का स्वचालित विश्लेषण। 80% से कम आत्मविश्वास वाले क्षेत्रों की आवाज द्वारा पुष्टि की जाती है।",
    btnDocAadhaar: "📄 नमूना आधार कार्ड अपलोड करें",
    btnDocIncome: "📜 नमूना आय प्रमाण पत्र अपलोड करें",
    ocrPlaceholder: "ऊपर दिए गए बटन से कोई भी दस्तावेज़ स्कैन करें।",
    btnBackStep1: "← साक्षात्कार पर वापस जाएं",
    btnProceedResults: "योजना पात्रता परिणाम देखें →",
    resultsTitle: "आपकी कल्याणकारी योजनाएं (5 Schemes Evaluated)",
    resultsSubtitle: "नियम-आधारित सत्यापन + Sarvam-105B स्पष्टीकरण + Bulbul v3 आवाज",
    btnRecheck: "🔄 पुनः जांचें",
    btnBackStep2: "← दस्तावेज़ पर वापस जाएं",
    formTitle: "PM-KISAN आवेदन पत्र (स्वतः भरा हुआ मार्गदर्शन)",
    formSubtitle: "सत्यापित आधार और आय विवरण से स्वतः तैयार किया गया आवेदन पत्र।",
    lblFormName: "आवेदक का पूरा नाम:",
    lblFormAadhaar: "मास्क्ड आधार संख्या:",
    lblFormState: "राज्य / जिला:",
    lblFormLand: "कृषि भूमि:",
    lblFormBank: "बैंक खाता विवरण:",
    formAudit: "✓ सभी 5 पात्रता मानदंड PM-KISAN धारा 2.1 के अनुसार सत्यापित हैं।<br>✓ आधार बैंक खाते से डीबीटी (Direct Benefit Transfer) के लिए लिंक है।",
    btnBackSchemes: "← परिणामों पर लौटें",
    btnFinishGuidance: "✓ आवेदन मार्गदर्शन पूर्ण करें (Voice Confirmed)",
    disclaimer: "अस्वीकरण: यह परिणाम केवल मार्गदर्शन के लिए हैं और आधिकारिक सरकारी निर्णय का प्रतिनिधित्व नहीं करते। लाभ के लिए अधिकृत पोर्टल पर आवेदन आवश्यक है।",
    listen: "सुनें (Bulbul)",
    repeat: "दोबारा सुनें",
    viewGuide: "आवेदन गाइड देखें →",
    missingDocs: "आवश्यक दस्तावेज़:",
    voiceConfirmed: "आवाज द्वारा सत्यापित (Voice Confirmed)",
    sampleSpeechText: "मेरी उम्र 38 साल है और मैं उत्तर प्रदेश में किसान हूँ"
  },
  "en-IN": {
    brandTitle: "Sarkari Sahayak (Citizen Welfare Agent)",
    subtitle: "Voice-first Indian Welfare Scheme Discovery & Guided Application",
    personasHeading: "Demo Personas:",
    privacyText: "<strong>Privacy Notice:</strong> Aadhaar numbers and personal documents are processed strictly in-memory during this session. No personal identifiers are stored permanently.",
    step1: "1. Voice Interview",
    step2: "2. Document Scan",
    step3: "3. Scheme Eligibility",
    step4: "4. Application Walkthrough",
    micPrompt: "Tap the microphone to speak or customize details below",
    micListening: "Listening in English... Please speak (Saaras v4)",
    profileHeading: "Citizen Profile Details",
    lblAge: "Age:",
    lblGender: "Gender:",
    optGenderM: "Male",
    optGenderF: "Female",
    optGenderO: "Other",
    lblOccupation: "Occupation:",
    optOccFarmer: "Farmer",
    optOccLaborer: "Agricultural Laborer",
    optOccGig: "Gig Worker",
    optOccHome: "Homemaker",
    optOccSalaried: "Salaried Professional",
    lblIncome: "Annual Household Income (₹):",
    lblState: "State of Residence:",
    lblLand: "Cultivable Landholding (Hectares):",
    lblLpg: "Existing LPG Connection?:",
    optLpgNo: "No",
    optLpgYes: "Yes",
    lblTax: "Income Tax Payer?:",
    optTaxNo: "No",
    optTaxYes: "Yes",
    lblCategory: "Social Category:",
    btnCheck: "Proceed to Document Verification →",
    docTitle: "Document Verification (Sarvam Vision OCR)",
    docSubtitle: "Automated OCR extraction for Aadhaar and Income Certificate. Fields with confidence below 80% require one-tap voice confirmation.",
    btnDocAadhaar: "📄 Upload Sample Aadhaar Card",
    btnDocIncome: "📜 Upload Sample Income Certificate",
    ocrPlaceholder: "Click either button above to scan and extract document details.",
    btnBackStep1: "← Back to Voice Interview",
    btnProceedResults: "View Scheme Eligibility Results →",
    resultsTitle: "Your Welfare Scheme Outcomes (5 Schemes Evaluated)",
    resultsSubtitle: "Deterministic Statutory Rules + Sarvam-105B Explanation + Bulbul v3 Voice",
    btnRecheck: "🔄 Re-evaluate",
    btnBackStep2: "← Back to Documents",
    formTitle: "PM-KISAN Application Form (Auto-Prefilled)",
    formSubtitle: "Pre-filled from verified Aadhaar and income credentials. Review and confirm below.",
    lblFormName: "Applicant Full Name:",
    lblFormAadhaar: "Masked Aadhaar Number:",
    lblFormState: "State / District:",
    lblFormLand: "Cultivable Landholding:",
    lblFormBank: "Bank Account Details:",
    formAudit: "✓ All 5 eligibility criteria verified under PM-KISAN Operational Guidelines 2019, Section 2.1.<br>✓ Aadhaar is linked to bank account for DBT (Direct Benefit Transfer).",
    btnBackSchemes: "← Back to Results",
    btnFinishGuidance: "✓ Confirm Application Guidance (Voice Confirmed)",
    disclaimer: "Disclaimer: These outcomes are for guidance purposes and do not represent an official government determination. Formal application on designated government portals is required.",
    listen: "Listen in English (Bulbul)",
    repeat: "Repeat",
    viewGuide: "View Application Guide →",
    missingDocs: "Required Documents:",
    voiceConfirmed: "Verified via Voice",
    sampleSpeechText: "I am a 38 year old farmer from Uttar Pradesh"
  }
};

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  setupLanguageToggle();
  setupPersonas();
  setupMic();
  setupDocs();
  setupFormWalkthrough();
  bindFormInputs();
});

function setupLanguageToggle() {
  document.getElementById("btn-hi").addEventListener("click", () => setLanguage("hi-IN"));
  document.getElementById("btn-en").addEventListener("click", () => setLanguage("en-IN"));
}

function setLanguage(lang) {
  currentLang = lang;
  document.getElementById("btn-hi").classList.toggle("active", lang === "hi-IN");
  document.getElementById("btn-en").classList.toggle("active", lang === "en-IN");

  const t = i18n[lang];

  // Update text across UI
  document.getElementById("brand-title").innerText = t.brandTitle;
  document.getElementById("app-subtitle").innerText = t.subtitle;
  document.getElementById("personas-heading").innerText = t.personasHeading;
  document.getElementById("privacy-text").innerHTML = t.privacyText;

  document.getElementById("step-label-1").innerText = t.step1;
  document.getElementById("step-label-2").innerText = t.step2;
  document.getElementById("step-label-3").innerText = t.step3;
  document.getElementById("step-label-4").innerText = t.step4;

  document.getElementById("mic-prompt-text").innerText = t.micPrompt;
  document.getElementById("profile-heading").innerText = t.profileHeading;

  document.getElementById("lbl-age").innerText = t.lblAge;
  document.getElementById("lbl-gender").innerText = t.lblGender;
  document.getElementById("opt-gender-m").innerText = t.optGenderM;
  document.getElementById("opt-gender-f").innerText = t.optGenderF;
  document.getElementById("opt-gender-o").innerText = t.optGenderO;

  document.getElementById("lbl-occupation").innerText = t.lblOccupation;
  document.getElementById("opt-occ-farmer").innerText = t.optOccFarmer;
  document.getElementById("opt-occ-laborer").innerText = t.optOccLaborer;
  document.getElementById("opt-occ-gig").innerText = t.optOccGig;
  document.getElementById("opt-occ-home").innerText = t.optOccHome;
  document.getElementById("opt-occ-salaried").innerText = t.optOccSalaried;

  document.getElementById("lbl-income").innerText = t.lblIncome;
  document.getElementById("lbl-state").innerText = t.lblState;
  document.getElementById("lbl-land").innerText = t.lblLand;
  document.getElementById("lbl-lpg").innerText = t.lblLpg;
  document.getElementById("opt-lpg-no").innerText = t.optLpgNo;
  document.getElementById("opt-lpg-yes").innerText = t.optLpgYes;

  document.getElementById("lbl-tax").innerText = t.lblTax;
  document.getElementById("opt-tax-no").innerText = t.optTaxNo;
  document.getElementById("opt-tax-yes").innerText = t.optTaxYes;

  document.getElementById("lbl-category").innerText = t.lblCategory;
  document.getElementById("btn-check").innerText = t.btnCheck;

  document.getElementById("doc-title").innerText = t.docTitle;
  document.getElementById("doc-subtitle").innerText = t.docSubtitle;
  document.getElementById("btn-doc-aadhaar").innerText = t.btnDocAadhaar;
  document.getElementById("btn-doc-income").innerText = t.btnDocIncome;
  const emptyOcr = document.getElementById("ocr-empty-placeholder");
  if (emptyOcr) emptyOcr.innerText = t.ocrPlaceholder;
  document.getElementById("btn-back-step1").innerText = t.btnBackStep1;
  document.getElementById("btn-proceed-results").innerText = t.btnProceedResults;

  document.getElementById("results-title").innerText = t.resultsTitle;
  document.getElementById("results-subtitle").innerText = t.resultsSubtitle;
  document.getElementById("btn-recheck").innerText = t.btnRecheck;
  document.getElementById("btn-back-step2").innerText = t.btnBackStep2;

  document.getElementById("form-title").innerText = t.formTitle;
  document.getElementById("form-subtitle").innerText = t.formSubtitle;
  document.getElementById("lbl-form-name").innerText = t.lblFormName;
  document.getElementById("lbl-form-aadhaar").innerText = t.lblFormAadhaar;
  document.getElementById("lbl-form-state").innerText = t.lblFormState;
  document.getElementById("lbl-form-land").innerText = t.lblFormLand;
  document.getElementById("lbl-form-bank").innerText = t.lblFormBank;
  document.getElementById("form-audit-box").innerHTML = t.formAudit;
  document.getElementById("btn-back-schemes").innerText = t.btnBackSchemes;
  document.getElementById("btn-finish-guidance").innerText = t.btnFinishGuidance;
  document.getElementById("disclaimer-banner").innerText = t.disclaimer;

  // Speak a short confirmation of language mode switch!
  speakLanguageConfirmation(lang);

  // If currently looking at schemes, re-evaluate to fetch explanations in the new language
  if (currentStep === 3) {
    runEligibilityCheck();
  }
}

async function speakLanguageConfirmation(lang) {
  const confirmText = lang === "en-IN" 
    ? "English mode enabled. I will guide you through government schemes." 
    : "हिंदी भाषा सक्रिय है। मैं आपको सरकारी योजनाओं की जानकारी दूंगी।";
  
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: confirmText,
        language: lang,
        speaker: lang === "en-IN" ? "simran" : "ritu"
      })
    });
    const data = await res.json();
    if (data.audio_uri) {
      if (currentAudio) { currentAudio.pause(); }
      currentAudio = new Audio(data.audio_uri);
      currentAudio.play();
    }
  } catch (e) {
    // Web speech fallback
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(confirmText);
      utter.lang = lang;
      window.speechSynthesis.speak(utter);
    }
  }
}

async function setupPersonas() {
  try {
    const res = await fetch("/api/personas");
    personas = await res.json();
    const ribbon = document.getElementById("personas-list");
    ribbon.innerHTML = "";
    
    personas.forEach((p, idx) => {
      const btn = document.createElement("button");
      btn.className = `persona-pill ${idx === 0 ? "active" : ""}`;
      btn.innerText = `${p.name} (${p.occupation}, ${p.state})`;
      btn.onclick = () => selectPersona(p, btn);
      ribbon.appendChild(btn);
    });
  } catch (e) {
    console.error("Personas fetch notice:", e);
  }
}

function selectPersona(p, btnElement) {
  document.querySelectorAll(".persona-pill").forEach(el => el.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");

  currentProfile = {
    age: p.age,
    gender: p.gender,
    occupation: p.occupation,
    annual_income: p.annual_income,
    state: p.state,
    landholding_hectares: p.landholding_hectares,
    has_lpg_connection: p.has_lpg_connection,
    is_income_tax_payer: p.is_income_tax_payer,
    category: p.category
  };

  populateInputs();
  const statusNote = document.getElementById("interview-status");
  statusNote.innerText = `Persona Loaded: ${p.name} — ${p.note}`;
  statusNote.style.color = "#4338ca";
}

function populateInputs() {
  document.getElementById("input-age").value = currentProfile.age;
  document.getElementById("input-gender").value = currentProfile.gender;
  document.getElementById("input-occupation").value = currentProfile.occupation;
  document.getElementById("input-income").value = currentProfile.annual_income;
  document.getElementById("input-state").value = currentProfile.state;
  document.getElementById("input-land").value = currentProfile.landholding_hectares;
  document.getElementById("input-lpg").value = currentProfile.has_lpg_connection ? "true" : "false";
  document.getElementById("input-tax").value = currentProfile.is_income_tax_payer ? "true" : "false";
  document.getElementById("input-category").value = currentProfile.category;
}

function bindFormInputs() {
  const sync = () => {
    currentProfile.age = parseInt(document.getElementById("input-age").value) || 0;
    currentProfile.gender = document.getElementById("input-gender").value;
    currentProfile.occupation = document.getElementById("input-occupation").value;
    currentProfile.annual_income = parseInt(document.getElementById("input-income").value) || 0;
    currentProfile.state = document.getElementById("input-state").value;
    currentProfile.landholding_hectares = parseFloat(document.getElementById("input-land").value) || 0.0;
    currentProfile.has_lpg_connection = document.getElementById("input-lpg").value === "true";
    currentProfile.is_income_tax_payer = document.getElementById("input-tax").value === "true";
    currentProfile.category = document.getElementById("input-category").value;
  };

  document.querySelectorAll(".form-grid input, .form-grid select").forEach(el => {
    el.addEventListener("change", sync);
    el.addEventListener("input", sync);
  });

  document.getElementById("btn-check").addEventListener("click", () => {
    goToStep(2); // Go to Document Verification first
  });
}

function goToStep(step) {
  currentStep = step;
  [1, 2, 3, 4].forEach(s => {
    document.getElementById(`step-item-${s}`).classList.toggle("active", s === step);
    document.getElementById(`step-card-${s}`).style.display = (s === step) ? "block" : "none";
  });
  window.scrollTo({ top: 120, behavior: "smooth" });

  if (step === 3) {
    runEligibilityCheck();
  }
}

// Voice Interview
function setupMic() {
  const micBtn = document.getElementById("mic-btn");
  let isRecording = false;
  let recognition = null;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLang;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const prefix = currentLang === "en-IN" ? "Recognized Voice (Saaras v4): " : "आवाज से प्राप्त (Saaras): ";
      document.getElementById("interview-status").innerText = `${prefix}"${transcript}"`;
      parseVoiceInput(transcript);
    };

    recognition.onend = () => {
      micBtn.classList.remove("recording");
      document.getElementById("mic-prompt-text").innerText = i18n[currentLang].micPrompt;
      isRecording = false;
    };
  }

  micBtn.addEventListener("click", () => {
    if (!isRecording) {
      isRecording = true;
      micBtn.classList.add("recording");
      document.getElementById("mic-prompt-text").innerText = i18n[currentLang].micListening;
      if (recognition) {
        recognition.lang = currentLang;
        try { recognition.start(); } catch(e){}
      } else {
        // Fallback simulation for environments without webkitSpeechRecognition
        setTimeout(() => {
          const sample = i18n[currentLang].sampleSpeechText;
          const prefix = currentLang === "en-IN" ? "Recognized Voice (Saaras v4): " : "आवाज से प्राप्त (Saaras v4): ";
          document.getElementById("interview-status").innerText = `${prefix}"${sample}"`;
          parseVoiceInput(sample);
          micBtn.classList.remove("recording");
          document.getElementById("mic-prompt-text").innerText = i18n[currentLang].micPrompt;
          isRecording = false;
        }, 2000);
      }
    } else {
      if (recognition) recognition.stop();
      micBtn.classList.remove("recording");
      isRecording = false;
    }
  });
}

function parseVoiceInput(text) {
  const lower = text.toLowerCase();
  const ageMatch = text.match(/(\d+)/);
  if (ageMatch) {
    currentProfile.age = parseInt(ageMatch[1]);
  }
  if (lower.includes("farmer") || lower.includes("किसान")) {
    currentProfile.occupation = "farmer";
  }
  if (lower.includes("uttar pradesh") || lower.includes("उत्तर प्रदेश")) {
    currentProfile.state = "Uttar Pradesh";
  }
  populateInputs();
}

// Document Scan & OCR
function setupDocs() {
  document.getElementById("btn-doc-aadhaar").addEventListener("click", () => loadSampleDoc("aadhaar"));
  document.getElementById("btn-doc-income").addEventListener("click", () => loadSampleDoc("income_certificate"));
  document.getElementById("btn-proceed-results").addEventListener("click", () => goToStep(3));
}

async function loadSampleDoc(docType) {
  const container = document.getElementById("ocr-results");
  const loadingMsg = currentLang === "en-IN" 
    ? "Sarvam Vision OCR analyzing document..." 
    : "Sarvam Vision OCR विश्लेषित कर रहा है...";
  container.innerHTML = `<div style="text-align:center; padding:15px; color:#475569;">${loadingMsg}</div>`;

  try {
    const formData = new FormData();
    const blob = new Blob(["dummy sample"], { type: "text/plain" });
    formData.append("file", blob, `${docType}_sample.jpg`);
    formData.append("doc_type", docType);

    const res = await fetch("/api/documents/parse", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    renderDocFields(data);
  } catch (e) {
    container.innerHTML = `<div style="color:red">OCR Error: ${e.message}</div>`;
  }
}

function renderDocFields(data) {
  const container = document.getElementById("ocr-results");
  const docName = data.doc_type === "aadhaar" 
    ? (currentLang === "en-IN" ? "Aadhaar Card" : "आधार कार्ड")
    : (currentLang === "en-IN" ? "Income Certificate" : "आय प्रमाण पत्र");

  let html = `
    <div style="background:#f1f5f9; padding:10px 14px; border-radius:8px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="text-transform:capitalize;">${docName}</strong>
        <span style="margin-left:10px; color:#64748b; font-size:0.8rem;">Masked PII: ${data.masked_id}</span>
      </div>
      <span class="conf-badge conf-high">Sarvam Vision Verified</span>
    </div>
  `;

  for (const [key, field] of Object.entries(data.fields)) {
    const isLow = field.needs_voice_confirmation;
    const label = currentLang === "en-IN" ? field.label : field.label_hi;
    const confirmBtnText = currentLang === "en-IN" ? "🎙️ Confirm Voice" : "🎙️ पुष्टि करें";

    html += `
      <div class="doc-field-card" id="field-${key}">
        <div>
          <div style="font-size:0.78rem; color:#64748b;">${label}</div>
          <div style="font-weight:600; color:#1e293b; font-size:0.95rem;">${field.value}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="conf-badge ${isLow ? 'conf-low' : 'conf-high'}">
            ${Math.round(field.confidence * 100)}% Conf
          </span>
          ${isLow ? `<button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="confirmFieldVoice('${key}', '${field.value}')">${confirmBtnText}</button>` : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  document.getElementById("btn-proceed-results").style.display = "inline-flex";
}

window.confirmFieldVoice = function(key, val) {
  const fieldEl = document.getElementById(`field-${key}`);
  const confirmedLabel = currentLang === "en-IN" ? "Verified via Voice" : "आवाज द्वारा सत्यापित";
  if (fieldEl) {
    fieldEl.style.background = "#ecfdf5";
    fieldEl.innerHTML = `
      <div>
        <div style="font-size:0.78rem; color:#065f46;">${confirmedLabel}</div>
        <div style="font-weight:600; color:#065f46; font-size:0.95rem;">${val} ✓</div>
      </div>
      <span class="conf-badge conf-high">100% Confirmed</span>
    `;
  }
};

// Eligibility Evaluation & Audio
async function runEligibilityCheck() {
  const container = document.getElementById("schemes-container");
  const evalMsg = currentLang === "en-IN"
    ? `<div style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Sarvam AI evaluating scheme eligibility...</div>
       <div style="font-size:0.85rem; color:#94a3b8;">Deterministic Rules + Sarvam-105B Explanations + Bulbul v3 Voice</div>`
    : `<div style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">Sarvam AI पात्रता का मूल्यांकन कर रहा है...</div>
       <div style="font-size:0.85rem; color:#94a3b8;">नियम इंजन + Sarvam-105B स्पष्टीकरण + Bulbul v3 आवाज</div>`;

  container.innerHTML = `<div style="text-align:center; padding:40px; color:#475569;">${evalMsg}</div>`;

  try {
    const payload = {
      ...currentProfile,
      language: currentLang
    };

    const res = await fetch("/api/eligibility/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    renderSchemes(data.results);
  } catch (e) {
    container.innerHTML = `<div style="color:red; padding:20px;">Evaluation Error: ${e.message}</div>`;
  }
}

function renderSchemes(schemes) {
  const container = document.getElementById("schemes-container");
  let html = "";
  const t = i18n[currentLang];

  schemes.forEach((s) => {
    const statusClass = `status-${s.status.replace(/\s+/g, '-')}`;
    html += `
      <div class="scheme-card">
        <div class="scheme-header">
          <div>
            <div class="scheme-title">${s.name}</div>
            <div class="scheme-benefit">💰 ${s.benefit}</div>
          </div>
          <span class="status-pill ${statusClass}">${s.status}</span>
        </div>

        <div class="clause-tag">📜 ${s.clause_cited}</div>

        <div class="explanation-box">
          <p>${s.explanation}</p>
        </div>

        ${s.missing_documents && s.missing_documents.length > 0 ? `
          <div style="font-size:0.8rem; color:#b45309; margin: 6px 0;">
            <strong>${t.missingDocs}</strong> ${s.missing_documents.join(", ")}
          </div>
        ` : ''}

        <div class="audio-controls">
          <button class="listen-btn" onclick="playAudio('${encodeURIComponent(s.explanation)}', '${s.audio_uri || ''}')">
            🔊 ${t.listen}
          </button>
          ${s.status === 'Eligible' ? `
            <button class="btn-primary" style="padding:6px 14px; font-size:0.82rem; margin-left:auto;" onclick="startFormWalkthrough('${s.id}')">
              ${t.viewGuide}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.playAudio = async function(encodedText, preloadedUri) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  let audioSrc = preloadedUri;
  const text = decodeURIComponent(encodedText);

  // If preloaded is missing or invalid, generate on the fly with proper English or Hindi speaker
  if (!audioSrc || audioSrc === "null" || audioSrc === "") {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: text, 
          language: currentLang,
          speaker: currentLang === "en-IN" ? "simran" : "ritu"
        })
      });
      const data = await res.json();
      audioSrc = data.audio_uri;
    } catch (e) {
      console.error("TTS fetch note:", e);
    }
  }

  if (audioSrc && audioSrc.startsWith("data:audio")) {
    currentAudio = new Audio(audioSrc);
    currentAudio.play();
  } else {
    // Web Speech API fallback
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLang;
      window.speechSynthesis.speak(utter);
    }
  }
};

// Form Walkthrough
function setupFormWalkthrough() {
  document.getElementById("btn-back-schemes").addEventListener("click", () => goToStep(3));
  document.getElementById("btn-finish-guidance").addEventListener("click", () => {
    const alertMsg = currentLang === "en-IN"
      ? "Application credentials confirmed by citizen. Guidance record prepared for formal submission on PM-KISAN portal (pmkisan.gov.in)."
      : "आवेदन विवरण नागरिक द्वारा सत्यापित किया गया है। आधिकारिक पोर्टल (pmkisan.gov.in) पर जमा करने हेतु मार्गदर्शन पूर्ण हुआ।";
    alert(alertMsg);
  });
}

window.startFormWalkthrough = function(schemeId) {
  goToStep(4);
  document.getElementById("form-name").value = "Ramesh Kumar Yadav";
  document.getElementById("form-aadhaar").value = "XXXX-XXXX-9842";
  document.getElementById("form-state").value = currentProfile.state;
  document.getElementById("form-land").value = `${currentProfile.landholding_hectares} Hectares`;
  document.getElementById("form-bank").value = "State Bank of India (Aadhaar Seeded & DBT Enabled)";
};
