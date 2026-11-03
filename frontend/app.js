// Sarkari Sahayak Frontend Controller

// Inline icon set (lucide shapes, one stroke, one size)
const ICON_VOL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon-volume" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICON_RUPEE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon-rupee" aria-hidden="true"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.67 0 6.67-10 0-10"/></svg>';
const ICON_CLAUSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon-doc" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>';
const ICON_MIC_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon-mic-sm" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>';
const CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

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
let selectedPersona = null;
let lastOcrData = null;
let lastSchemes = [];
let schemeSort = "rank";
let lastReceiptData = null;
let sessionRef = null;
let lastWalkthroughScheme = "pm_kisan";

// Localized data labels for names that come from the backend
const LABEL_HI = {
  occupations: {
    farmer: "किसान",
    agricultural_laborer: "कृषि मजदूर",
    gig_worker: "गिग कर्मी",
    homemaker: "गृहणी",
    salaried_professional: "वेतनभोगी",
    retired_laborer: "सेवानिवृत्त मजदूर",
    student_freelancer: "छात्र/फ्रीलांसर"
  },
  states: {
    "Uttar Pradesh": "उत्तर प्रदेश",
    "Bihar": "बिहार",
    "Madhya Pradesh": "मध्य प्रदेश",
    "Delhi": "दिल्ली",
    "Rajasthan": "राजस्थान",
    "Haryana": "हरियाणा"
  }
};

function localizedPersonaMeta(p) {
  if (currentLang !== "hi-IN") {
    return `${p.occupation.replace(/_/g, " ")}, ${p.state}`;
  }
  const occ = LABEL_HI.occupations[p.occupation] || p.occupation.replace(/_/g, " ");
  const state = LABEL_HI.states[p.state] || p.state;
  return `${occ}, ${state}`;
}

// Comprehensive Bilingual Dictionaries
const i18n = {
  "hi-IN": {
    brandTitle: "सरकारी सहायक (Sarkari Sahayak)",
    subtitle: "आवाज से जानें अपनी सरकारी योजनाएं और करें आवेदन",
    personasHeading: "डेमो प्रोफाइल (Demo Personas):",
    privacyText: "<strong>गोपनीयता सूचना (Privacy Protected):</strong> आधार संख्या और व्यक्तिगत दस्तावेज़ केवल इस सत्र के लिए मेमोरी में संसाधित होते हैं। कोई भी पहचानकर्ता स्थायी रूप से संग्रहीत नहीं किया जाता।",
    step1: "आवाज साक्षात्कार",
    step2: "दस्तावेज़ सत्यापन",
    step3: "योजना परिणाम",
    step4: "आवेदन सहायता",
    micPrompt: "बोलने के लिए माइक दबाएं या नीचे विवरण भरें",
    micTitle: "बोलने के लिए दबाएं",
    micListening: "सुन रहा हूँ... रोकने के लिए माइक दोबारा दबाएं",
    micDenied: "माइक उपलब्ध नहीं — डेमो मोड चल रहा है",
    recProcessing: "आपकी आवाज Saaras v4 से ट्रांसक्राइब हो रही है...",
    demoPrefix: "डेमो इनपुट:",
    transcriptPrefix: "आवाज से प्राप्त (Saaras v4):",
    personaLoaded: "प्रोफ़ाइल लोड हुई:",
    sumEligible: "पात्र",
    sumLikely: "संभावित रूप से पात्र",
    sumNot: "अपात्र",
    sumInfo: "अधिक जानकारी चाहिए",
    sortAll: "सभी (पात्र पहले)",
    sortEligible: "पात्र",
    sortNot: "बाकी सारी योजनाएं",
    sortEmpty: "इस विकल्प में कोई योजना नहीं।",
    personasLock: "प्रोफाइल केवल होम पेज पर बदली जा सकती हैं",
    walkTitle: "स्वतः भरा हुआ आवेदन पत्र",
    formAuditLine2: "आधार बैंक खाते से डीबीटी (Direct Benefit Transfer) के लिए लिंक है।",
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
    btnCheck: "दस्तावेज़ सत्यापन पर आगे बढ़ें",
    docTitle: "दस्तावेज़ सत्यापन (Sarvam Vision OCR)",
    docSubtitle: "सटीक पात्रता के लिए आधार कार्ड और आय प्रमाण पत्र का स्वचालित विश्लेषण। 80% से कम आत्मविश्वास वाले क्षेत्रों की आवाज द्वारा पुष्टि की जाती है।",
    btnDocAadhaar: "नमूना आधार कार्ड अपलोड करें",
    btnDocIncome: "नमूना आय प्रमाण पत्र अपलोड करें",
    ocrPlaceholder: "ऊपर दिए गए बटन से कोई भी दस्तावेज़ स्कैन करें।",
    btnBackStep1: "साक्षात्कार पर वापस जाएं",
    btnProceedResults: "योजना पात्रता परिणाम देखें",
    resultsTitle: "आपकी कल्याणकारी योजनाएं (5 योजनाओं का मूल्यांकन)",
    resultsSubtitle: "नियम-आधारित सत्यापन + Sarvam-105B स्पष्टीकरण + Bulbul v3 आवाज",
    btnRecheck: "पुनः जांचें",
    btnBackStep2: "दस्तावेज़ पर वापस जाएं",
    formTitle: "PM-KISAN आवेदन पत्र (स्वतः भरा हुआ मार्गदर्शन)",
    formSubtitle: "सत्यापित आधार और आय विवरण से स्वतः तैयार किया गया आवेदन पत्र।",
    lblFormName: "आवेदक का पूरा नाम:",
    lblFormAadhaar: "मास्क्ड आधार संख्या:",
    lblFormState: "राज्य / जिला:",
    lblFormLand: "कृषि भूमि:",
    lblFormBank: "बैंक खाता विवरण:",
    formAudit: "सभी 5 पात्रता मानदंड PM-KISAN धारा 2.1 के अनुसार सत्यापित हैं।<br>आधार बैंक खाते से डीबीटी (Direct Benefit Transfer) के लिए लिंक है।",
    bankText: "भारतीय स्टेट बैंक (आधार लिंक, DBT सक्रिय)",
    landUnit: "हेक्टेयर",
    finishMsg: "आवेदन विवरण नागरिक द्वारा सत्यापित किया गया है। आधिकारिक पोर्टल (pmkisan.gov.in) पर जमा करने हेतु मार्गदर्शन पूर्ण हुआ।",
    finishHead: "आवेदन मार्गदर्शन पूर्ण",
    finishStamp: "आवाज़ से सत्यापित",
    rCitizen: "नागरिक",
    rScheme: "योजना",
    rAadhaar: "आधार संख्या",
    rLand: "कृषि भूमि",
    rBank: "बैंक खाता",
    rClause: "सत्यापन प्राधिकरण",
    rDate: "दिनांक व समय",
    rRef: "संदर्भ आईडी",
    rVerified: "सत्यापित",
    rPrint: "पर्चा प्रिंट करें",
    rCopy: "पर्चा कॉपी करें",
    rCopied: "कॉपी हो गया ✓",
    rFoot: "यह पर्चा सत्र में दिए मार्गदर्शन का प्रमाण है। औपचारिक आवेदन केवल आधिकारिक पोर्टल पर करें।",
    btnFinishDone: "पर्चा तैयार ✓",
    themeDark: "डार्क मोड",
    themeLight: "लाइट मोड",
    btnBackSchemes: "परिणामों पर लौटें",
    btnFinishGuidance: "आवेदन मार्गदर्शन पूर्ण करें (Voice Confirmed)",
    disclaimer: "अस्वीकरण: यह परिणाम केवल मार्गदर्शन के लिए हैं और आधिकारिक सरकारी निर्णय का प्रतिनिधित्व नहीं करते। लाभ के लिए अधिकृत पोर्टल पर आवेदन आवश्यक है।",
    listen: "सुनें",
    repeat: "दोबारा सुनें",
    viewGuide: "आवेदन गाइड देखें",
    missingDocs: "आवश्यक दस्तावेज़:",
    voiceConfirmed: "आवाज द्वारा सत्यापित (Voice Confirmed)",
    sampleSpeechText: "मेरी उम्र 38 साल है और मैं उत्तर प्रदेश में किसान हूँ"
  },
  "en-IN": {
    brandTitle: "Sarkari Sahayak (Citizen Welfare Agent)",
    subtitle: "Voice-first Indian Welfare Scheme Discovery & Guided Application",
    personasHeading: "Demo Personas:",
    privacyText: "<strong>Privacy Notice:</strong> Aadhaar numbers and personal documents are processed strictly in-memory during this session. No personal identifiers are stored permanently.",
    step1: "Voice Interview",
    step2: "Document Scan",
    step3: "Scheme Eligibility",
    step4: "Application Walkthrough",
    micPrompt: "Tap the microphone to speak or customize details below",
    micTitle: "Tap to speak",
    micListening: "Listening... tap the microphone again to stop",
    micDenied: "Microphone unavailable — running in demo mode",
    recProcessing: "Transcribing your voice with Saaras v4...",
    demoPrefix: "Demo input:",
    transcriptPrefix: "Recognized via voice (Saaras v4):",
    personaLoaded: "Persona Loaded:",
    sumEligible: "Eligible",
    sumLikely: "Likely eligible",
    sumNot: "Not eligible",
    sumInfo: "Need more info",
    sortAll: "All (eligible first)",
    sortEligible: "Eligible",
    sortNot: "The rest",
    sortEmpty: "No schemes in this view.",
    personasLock: "Profiles can be switched only on the home page",
    walkTitle: "Auto-prefilled application form",
    formAuditLine2: "Aadhaar is linked to bank account for DBT (Direct Benefit Transfer).",
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
    btnCheck: "Proceed to document verification",
    docTitle: "Document Verification (Sarvam Vision OCR)",
    docSubtitle: "Automated OCR extraction for Aadhaar and Income Certificate. Fields with confidence below 80% require one-tap voice confirmation.",
    btnDocAadhaar: "Upload sample Aadhaar card",
    btnDocIncome: "Upload sample income certificate",
    ocrPlaceholder: "Click either button above to scan and extract document details.",
    btnBackStep1: "Back to voice interview",
    btnProceedResults: "View scheme eligibility results",
    resultsTitle: "Your Welfare Scheme Outcomes (5 Schemes Evaluated)",
    resultsSubtitle: "Deterministic Statutory Rules + Sarvam-105B Explanation + Bulbul v3 Voice",
    btnRecheck: "Re-evaluate",
    btnBackStep2: "Back to documents",
    formTitle: "PM-KISAN Application Form (Auto-Prefilled)",
    formSubtitle: "Pre-filled from verified Aadhaar and income credentials. Review and confirm below.",
    lblFormName: "Applicant Full Name:",
    lblFormAadhaar: "Masked Aadhaar Number:",
    lblFormState: "State / District:",
    lblFormLand: "Cultivable Landholding:",
    lblFormBank: "Bank Account Details:",
    formAudit: "All 5 eligibility criteria verified under PM-KISAN Operational Guidelines 2019, Section 2.1.<br>Aadhaar is linked to bank account for DBT (Direct Benefit Transfer).",
    bankText: "State Bank of India (Aadhaar seeded, DBT enabled)",
    landUnit: "Hectares",
    finishMsg: "Application credentials confirmed by citizen. Guidance record prepared for formal submission on the PM-KISAN portal (pmkisan.gov.in).",
    finishHead: "Application guidance complete",
    finishStamp: "Voice verified",
    rCitizen: "Citizen",
    rScheme: "Scheme",
    rAadhaar: "Aadhaar number",
    rLand: "Cultivable land",
    rBank: "Bank details",
    rClause: "Verification basis",
    rDate: "Date & time",
    rRef: "Reference ID",
    rVerified: "Verified",
    rPrint: "Print receipt",
    rCopy: "Copy receipt",
    rCopied: "Copied ✓",
    rFoot: "This receipt is proof of in-session guidance. Submit the formal application only on the official portal.",
    btnFinishDone: "Receipt ready ✓",
    themeDark: "Dark mode",
    themeLight: "Light mode",
    btnBackSchemes: "Back to results",
    btnFinishGuidance: "Finish application guidance (voice confirmed)",
    disclaimer: "Disclaimer: These outcomes are for guidance purposes and do not represent an official government determination. Formal application on designated government portals is required.",
    listen: "Listen",
    repeat: "Repeat",
    viewGuide: "View application guide",
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
  setupThemeToggle();
}

let theme = "light";
const ICON_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

function renderThemeButton() {
  const btn = document.getElementById("btn-theme");
  const icon = document.getElementById("theme-icon");
  icon.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
  const t = i18n[currentLang];
  const label = theme === "dark" ? t.themeLight : t.themeDark;
  btn.title = label;
  btn.setAttribute("aria-label", label);
  btn.setAttribute("aria-pressed", theme === "dark");
}

function setupThemeToggle() {
  try {
    const saved = localStorage.getItem("ss-theme");
    if (saved === "dark" || saved === "light") theme = saved;
  } catch (e) {}
  applyTheme(theme, false);
  document.getElementById("btn-theme").addEventListener("click", () => {
    applyTheme(theme === "dark" ? "light" : "dark", true);
  });
}

function applyTheme(next, persist) {
  theme = next;
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try { localStorage.setItem("ss-theme", theme); } catch (e) {}
  }
  renderThemeButton();
}

function setLanguage(lang) {
  currentLang = lang;
  renderThemeButton();
  document.getElementById("btn-hi").classList.toggle("active", lang === "hi-IN");
  document.getElementById("btn-en").classList.toggle("active", lang === "en-IN");

  const t = i18n[lang];

  // Update text across UI
  schemeSort = "rank";
  document.getElementById("brand-title").innerText = t.brandTitle;
  document.getElementById("app-subtitle").innerText = t.subtitle;
  document.getElementById("personas-heading").innerText = t.personasHeading;
  const pbarLang = document.querySelector(".personas-bar");
  if (pbarLang) pbarLang.title = currentStep !== 1 ? t.personasLock : "";
  document.getElementById("privacy-text").innerHTML = t.privacyText;

  document.getElementById("step-label-1").innerText = t.step1;
  document.getElementById("step-label-2").innerText = t.step2;
  document.getElementById("step-label-3").innerText = t.step3;
  document.getElementById("step-label-4").innerText = t.step4;

  document.getElementById("mic-prompt-text").innerText = t.micPrompt;
  document.getElementById("mic-btn").title = t.micTitle;
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

  // Buttons that carry an SVG icon: update only their label span
  document.getElementById("span-doc-aadhaar").innerText = t.btnDocAadhaar;
  document.getElementById("span-doc-income").innerText = t.btnDocIncome;
  document.getElementById("span-recheck").innerText = t.btnRecheck;
  document.getElementById("btn-doc-aadhaar").title = t.btnDocAadhaar;
  document.getElementById("btn-doc-income").title = t.btnDocIncome;
  document.getElementById("doc-title").innerText = t.docTitle;
  document.getElementById("doc-subtitle").innerText = t.docSubtitle;
  const emptyOcr = document.getElementById("ocr-empty-placeholder");
  if (emptyOcr) emptyOcr.innerText = t.ocrPlaceholder;
  document.getElementById("btn-back-step1").innerText = t.btnBackStep1;
  document.getElementById("btn-proceed-results").innerText = t.btnProceedResults;

  document.getElementById("results-title").innerText = t.resultsTitle;
  document.getElementById("results-subtitle").innerText = t.resultsSubtitle;
  document.getElementById("btn-back-step2").innerText = t.btnBackStep2;

  document.getElementById("form-title").innerText = t.formTitle;
  document.getElementById("form-subtitle").innerText = t.formSubtitle;
  document.getElementById("lbl-form-name").innerText = t.lblFormName;
  document.getElementById("lbl-form-aadhaar").innerText = t.lblFormAadhaar;
  document.getElementById("lbl-form-state").innerText = t.lblFormState;
  document.getElementById("lbl-form-land").innerText = t.lblFormLand;
  document.getElementById("lbl-form-bank").innerText = t.lblFormBank;
  document.getElementById("form-audit-box").innerHTML = t.formAudit;  document.getElementById("btn-back-schemes").innerText = t.btnBackSchemes;
  document.getElementById("btn-finish-guidance").innerText = t.btnFinishGuidance;
  document.getElementById("disclaimer-banner").innerText = t.disclaimer;

  // Re-render everything that was rendered by JS in the previous language
  if (personas.length > 0) {
    renderPersonaPills();
  }
  if (selectedPersona) {
    const statusNote = document.getElementById("interview-status");
    const noteTranslated = lang === "hi-IN" && selectedPersona.note_hi ? selectedPersona.note_hi : selectedPersona.note;
    statusNote.innerText = `${t.personaLoaded} ${selectedPersona.name} — ${noteTranslated}`;
    statusNote.classList.add("ack");
  }
  if (lastOcrData && currentStep === 2) {
    renderDocFields(lastOcrData);
  }
  if (currentStep === 4) {
    const wasReceiptActive = lastReceiptData !== null;
    const preservedReceipt = lastReceiptData;
    fillFormWalkthrough();
    const finishBtn = document.getElementById("btn-finish-guidance");
    if (wasReceiptActive && preservedReceipt) {
      renderFinishReceipt(preservedReceipt);
      finishBtn.disabled = true;
      finishBtn.classList.add("done");
      finishBtn.innerText = t.btnFinishDone;
    }
  }

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

function renderPersonaPills() {
  const ribbon = document.getElementById("personas-list");
  ribbon.innerHTML = "";

  personas.forEach((p, idx) => {
    const btn = document.createElement("button");
    const isActive = selectedPersona ? selectedPersona.id === p.id : idx === 0;
    btn.className = `persona-pill ${isActive ? "active" : ""}`;
    btn.innerText = `${p.name} (${localizedPersonaMeta(p)})`;
    btn.onclick = () => {
      if (currentStep !== 1) return;
      selectPersona(p, btn);
    };
    ribbon.appendChild(btn);
  });
}

async function setupPersonas() {
  try {
    const res = await fetch("/api/personas");
    personas = await res.json();
    selectedPersona = personas[0] || null;
    renderPersonaPills();
    if (selectedPersona) {
      applyPersona(selectedPersona, null);
      const statusNote = document.getElementById("interview-status");
      statusNote.innerText = `${i18n[currentLang].personaLoaded} ${selectedPersona.name} — ${currentLang === "hi-IN" && selectedPersona.note_hi ? selectedPersona.note_hi : selectedPersona.note}`;
      statusNote.classList.add("ack");
    }
  } catch (e) {
    console.error("Personas fetch notice:", e);
  }
}

function applyPersona(p, btnElement) {
  if (btnElement) {
    document.querySelectorAll(".persona-pill").forEach(el => el.classList.remove("active"));
    btnElement.classList.add("active");
  }

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
}

function selectPersona(p, btnElement) {
  selectedPersona = p;
  applyPersona(p, btnElement);

  const statusNote = document.getElementById("interview-status");
  const noteTranslated = currentLang === "hi-IN" && p.note_hi ? p.note_hi : p.note;
  statusNote.innerText = `${i18n[currentLang].personaLoaded} ${p.name} — ${noteTranslated}`;
  statusNote.classList.add("ack");
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
  const pbar = document.querySelector(".personas-bar");
  pbar.classList.toggle("locked", step !== 1);
  pbar.title = step !== 1 ? i18n[currentLang].personasLock : "";
  [1, 2, 3, 4].forEach(s => {
    const item = document.getElementById(`step-item-${s}`);
    item.classList.toggle("active", s === step);
    item.classList.toggle("done", s < step);
    document.getElementById(`step-card-${s}`).style.display = (s === step) ? "block" : "none";
  });
  window.scrollTo({ top: 120, behavior: "smooth" });

  if (step === 3) {
    runEligibilityCheck();
  }
}

// Voice Interview — real mic capture, transcribed by Saaras v4 via /api/voice/transcribe
function encodeWav(pcmChunks, sampleRate) {
  const total = pcmChunks.reduce((a, c) => a + c.length, 0);
  const buffer = new ArrayBuffer(44 + total * 2);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0, "RIFF"); view.setUint32(4, 36 + total * 2, true); writeStr(8, "WAVE");
  writeStr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeStr(36, "data"); view.setUint32(40, total * 2, true);
  let offset = 44;
  for (const chunk of pcmChunks) {
    for (let i = 0; i < chunk.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, chunk[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function setupMic() {
  const micBtn = document.getElementById("mic-btn");
  const promptEl = document.getElementById("mic-prompt-text");
  const statusEl = document.getElementById("interview-status");
  const timerEl = document.getElementById("record-timer");
  const t = () => i18n[currentLang];

  let recording = false;
  let stream = null;
  let audioCtx = null;
  let processor = null;
  let analyser = null;
  let freqData = null;
  let rafId = null;
  let pcm = [];
  let captureRate = 16000;
  let timerInt = null;
  let seconds = 0;

  setStatus("", false);

  function setStatus(text, ack) {
    statusEl.innerText = text;
    statusEl.classList.toggle("ack", !!ack);
  }

  // Live microphone visualizer under the mic button
  const visBars = Array.from(document.querySelectorAll("#waveviz .wave-bar"));
  const DC_BINS = 6;
  function drawVisualizer() {
    if (!recording) return;
    rafId = requestAnimationFrame(drawVisualizer);
    if (!analyser) return;
    analyser.getByteFrequencyData(freqData);
    const step = Math.max(1, Math.floor((freqData.length - DC_BINS) / visBars.length));
    visBars.forEach((bar, i) => {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += freqData[DC_BINS + i * step + j] || 0;
      const level = sum / step / 255;
      bar.style.height = `${(4 + Math.sqrt(level) * 24).toFixed(1)}px`;
    });
  }

  function resetVisualizer() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    visBars.forEach(bar => { bar.style.height = ""; });
  }

  function teardownCapture() {
    if (processor) { try { processor.disconnect(); } catch (e) {} processor = null; }
    if (analyser) { try { analyser.disconnect(); } catch (e) {} analyser = null; }
    if (stream) { try { stream.getTracks().forEach(tr => tr.stop()); } catch (e) {} stream = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
  }

  function cleanup() {
    recording = false;
    clearInterval(timerInt);
    resetVisualizer();
    micBtn.classList.remove("recording");
    timerEl.hidden = true;
    promptEl.innerText = t().micPrompt;
  }

  // Honest demo fallback when no mic / no Saaras API key
  function simulatedRecognize() {
    const sample = t().sampleSpeechText;
    setStatus(`${t().demoPrefix} "${sample}"`, true);
    parseVoiceInput(sample);
  }

  async function finishRecording() {
    if (!recording) return;
    recording = false;
    clearInterval(timerInt);

    const chunks = pcm;
    pcm = [];
    const rate = captureRate;
    teardownCapture();
    cleanup();

    if (chunks.length === 0) {
      simulatedRecognize();
      return;
    }

    setStatus(t().recProcessing, false);
    try {
      const fd = new FormData();
      fd.append("file", encodeWav(chunks, rate), "voice.wav");
      fd.append("language", currentLang);
      const res = await fetch("/api/voice/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      const transcript = ((data && data.transcript) || "").trim();
      if (transcript) {
        setStatus(`${t().transcriptPrefix} "${transcript}"`, true);
        parseVoiceInput(transcript);
      } else {
        simulatedRecognize();
      }
    } catch (e) {
      simulatedRecognize();
    }
  }

  micBtn.addEventListener("click", async () => {
    if (recording) {
      finishRecording();
      return;
    }
    // Start recording — state stays on until the user taps again or 15s cap
    recording = true;
    seconds = 0;
    pcm = [];
    captureRate = 16000;
    micBtn.classList.add("recording");
    timerEl.hidden = false;
    timerEl.innerText = "00:00";
    promptEl.innerText = t().micListening;
    setStatus("", false);

    timerInt = setInterval(() => {
      seconds++;
      timerEl.innerText = `00:${String(Math.min(seconds, 59)).padStart(2, "0")}`;
      if (seconds >= 15) finishRecording();
    }, 1000);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: captureRate });
        const source = audioCtx.createMediaStreamSource(stream);
        processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          const data = e.inputBuffer.getChannelData(0);
          pcm.push(new Float32Array(data));
        };
        const sink = audioCtx.createGain();
        sink.gain.value = 0;
        source.connect(processor);
        processor.connect(sink);
        sink.connect(audioCtx.destination);

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        freqData = new Uint8Array(analyser.frequencyBinCount);
        drawVisualizer();
      } catch (e) {
        teardownCapture();
        setStatus(t().micDenied, false);
      }
    } else {
      setStatus(t().micDenied, false);
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
  container.innerHTML = `<div class="note-loading">${loadingMsg}</div>`;

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
    lastOcrData = data;
    renderDocFields(data);
  } catch (e) {
    container.innerHTML = `<div class="note-error">OCR Error: ${e.message}</div>`;
    lastOcrData = null;
  }
}

function renderDocFields(data) {
  const container = document.getElementById("ocr-results");
  const docName = data.doc_type === "aadhaar" 
    ? (currentLang === "en-IN" ? "Aadhaar Card" : "आधार कार्ड")
    : (currentLang === "en-IN" ? "Income Certificate" : "आय प्रमाण पत्र");

  let html = `
    <div class="ocr-doc-summary">
      <div>
        <strong>${docName}</strong>
        <span class="meta">Masked PII: ${data.masked_id}</span>
      </div>
      <span class="conf-badge conf-high">Sarvam Vision verified</span>
    </div>
  `;

  for (const [key, field] of Object.entries(data.fields)) {
    const isLow = field.needs_voice_confirmation;
    const label = currentLang === "en-IN" ? field.label : field.label_hi;
    const confirmBtnText = currentLang === "en-IN" ? "Confirm by voice" : "पुष्टि करें";

    html += `
      <div class="doc-field-card" id="field-${key}">
        <div>
          <div class="field-label">${label}</div>
          <div class="field-value">${field.value}</div>
        </div>
        <div class="field-side">
          <span class="conf-badge ${isLow ? 'conf-low' : 'conf-high'}">
            ${Math.round(field.confidence * 100)}%
          </span>
          ${isLow ? `<button class="btn-secondary confirm-voice-btn" onclick="confirmFieldVoice('${key}', '${field.value}')">${ICON_MIC_SM} ${confirmBtnText}</button>` : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  document.getElementById("btn-proceed-results").style.display = "inline-flex";
}

window.confirmFieldVoice = function(key, val) {
  const fieldEl = document.getElementById(`field-${key}`);
  const confirmedLabel = currentLang === "en-IN" ? "Verified via voice" : "आवाज द्वारा सत्यापित";
  if (fieldEl) {
    fieldEl.classList.add("confirmed");
    fieldEl.innerHTML = `
      <div>
        <div class="field-label">${confirmedLabel}</div>
        <div class="field-value">${val}</div>
      </div>
      <span class="conf-badge conf-high">Confirmed</span>
    `;
  }
};

// Eligibility Evaluation & Audio
async function runEligibilityCheck() {
  const container = document.getElementById("schemes-container");
  const evalMsg = currentLang === "en-IN"
    ? `<div class="note-loading"><div class="note-title">Sarvam AI evaluating scheme eligibility...</div>
       <div>Deterministic rules + Sarvam-105B explanations + Bulbul v3 voice</div></div>`
    : `<div class="note-loading"><div class="note-title">Sarvam AI पात्रता का मूल्यांकन कर रहा है...</div>
       <div>नियम इंजन + Sarvam-105B स्पष्टीकरण + Bulbul v3 आवाज</div></div>`;

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
    container.innerHTML = `<div class="note-error">Evaluation Error: ${e.message}</div>`;
  }
}

function renderSchemes(schemes) {
  lastSchemes = schemes;
  const container = document.getElementById("schemes-container");
  const t = i18n[currentLang];

  // Summary strip — counts per status for a glanceable dashboard header
  const counts = { "Eligible": 0, "Likely": 0, "Not eligible": 0, "Need more info": 0 };
  schemes.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
  const sumMeta = [
    ["Eligible", counts["Eligible"], t.sumEligible, "dot-Eligible"],
    ["Likely", counts["Likely"], t.sumLikely, "dot-Likely"],
    ["Not eligible", counts["Not eligible"], t.sumNot, "dot-Not-eligible"],
    ["Need more info", counts["Need more info"], t.sumInfo, "dot-Need-more-info"]
  ];
  const summary = `
    <div class="scheme-summary">
      ${sumMeta.filter(m => m[1] > 0).map(([key, n, label, dot]) =>
        `<span class="sum-chip"><span class="sum-dot ${dot}"></span>${n} ${label}</span>`
      ).join("")}
      <div class="scheme-sorter" role="group" aria-label="Sort schemes">
        <button class="sort-btn ${schemeSort === "rank" ? "active" : ""}" onclick="setSchemeSort('rank')">${t.sortAll}</button>
        <button class="sort-btn ${schemeSort === "eligible" ? "active" : ""}" onclick="setSchemeSort('eligible')">${t.sortEligible} (${counts["Eligible"]})</button>
        <button class="sort-btn ${schemeSort === "not" ? "active" : ""}" onclick="setSchemeSort('not')">${t.sortNot} (${schemes.length - counts["Eligible"]})</button>
      </div>
    </div>`;

  const statusRank = { "Eligible": 0, "Likely": 1, "Need more info": 2, "Not eligible": 3 };
  const visible = schemes
    .filter(s =>
      schemeSort === "eligible" ? s.status === "Eligible" :
      schemeSort === "not" ? s.status !== "Eligible" : true)
    .sort((a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9));

  let html = summary;

  if (visible.length === 0) {
    html += `<div class="note-loading"><div class="note-title">${t.sortEmpty}</div></div>`;
  }

  visible.forEach((s) => {
    const statusClass = `status-${s.status.replace(/\s+/g, '-')}`;
    const cardClass = `scheme-card st-${s.status.replace(/\s+/g, '-')}`;
    html += `
      <div class="${cardClass}">
        <div class="scheme-header">
          <div>
            <div class="scheme-title">${s.name}</div>
            <div class="scheme-benefit">${ICON_RUPEE} ${s.benefit}</div>
          </div>
          <span class="status-pill ${statusClass}">${s.status_label || s.status}</span>
        </div>

        <div class="clause-tag">${ICON_CLAUSE} ${s.clause_cited}</div>

        <div class="explanation-box">
          <p>${s.explanation}</p>
        </div>

        ${s.missing_documents && s.missing_documents.length > 0 ? `
          <div class="missing-docs">
            <strong>${t.missingDocs}</strong> ${s.missing_documents.join(", ")}
          </div>
        ` : ''}

        <div class="audio-controls">
          <button class="listen-btn" onclick="playAudio('${encodeURIComponent(s.explanation)}', '${s.audio_uri || ''}')">
            ${ICON_VOL} ${t.listen}
          </button>
          ${s.status === 'Eligible' ? `
            <button class="btn-primary btn-apply" onclick="startFormWalkthrough('${s.id}')">
              ${t.viewGuide}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.setSchemeSort = function(sortKey) {
  schemeSort = sortKey;
  if (lastSchemes.length > 0) renderSchemes(lastSchemes);
};

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
    renderFinishReceipt(makeReceiptData());
    const btn = document.getElementById("btn-finish-guidance");
    btn.disabled = true;
    btn.classList.add("done");
    btn.innerText = i18n[currentLang].btnFinishDone;
  });
}

function makeReceiptData() {
  if (!sessionRef) {
    sessionRef = `SS-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`;
  }
  const scheme = lastSchemes.find(s => s.id === lastWalkthroughScheme) || null;
  const locale = currentLang === "hi-IN" ? "hi-IN" : "en-IN";
  return {
    name: selectedPersona ? selectedPersona.name : "Ramesh Kumar Yadav",
    scheme: scheme ? scheme.name : i18n[currentLang].formTitle,
    aadhaar: document.getElementById("form-aadhaar").value || "XXXX-XXXX-9842",
    land: document.getElementById("form-land").value,
    bank: document.getElementById("form-bank").value,
    clause: scheme ? scheme.clause_cited : "",
    stamp: `${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date())} IST`,
    ref: sessionRef
  };
}

function renderFinishReceipt(r) {
  lastReceiptData = r;
  const t = i18n[currentLang];
  const status = document.getElementById("finish-status");
  const vtag = `<span class="receipt-verified">${CHECK_SVG} ${t.rVerified}</span>`;
  status.innerHTML = `
    <div id="finish-receipt" class="finish-receipt">
      <div class="receipt-head">
        <span class="receipt-check">${CHECK_SVG}</span>
        <div>
          <div class="receipt-title">${t.finishHead}</div>
          <div class="receipt-ref">${r.ref}</div>
        </div>
        <span class="receipt-stamp">${t.finishStamp}</span>
      </div>
      <dl class="receipt-rows">
        <dt>${t.rCitizen}</dt><dd>${r.name}</dd>
        <dt>${t.rScheme}</dt><dd>${r.scheme}</dd>
        <dt>${t.rAadhaar}</dt><dd>${r.aadhaar}</dd>
        <dt>${t.rLand}</dt><dd>${r.land} ${r.land ? vtag : ""}</dd>
        <dt>${t.rBank}</dt><dd>${r.bank} ${r.bank ? vtag : ""}</dd>
        <dt>${t.rClause}</dt><dd>${r.clause}</dd>
        <dt>${t.rDate}</dt><dd>${r.stamp}</dd>
      </dl>
      <div class="receipt-note">${t.rFoot}</div>
      <div class="receipt-actions no-print">
        <button class="btn-secondary" onclick="window.print()">${t.rPrint}</button>
        <button class="btn-secondary" id="btn-copy-receipt" onclick="copyReceipt(this)">${t.rCopy}</button>
      </div>
    </div>`;
  status.classList.add("active", "plain");
}

window.copyReceipt = function(btn) {
  if (!lastReceiptData) return;
  const t = i18n[currentLang];
  const r = lastReceiptData;
  const text = [
    `${t.finishHead} — ${r.ref}`,
    `${t.rCitizen}: ${r.name}`,
    `${t.rScheme}: ${r.scheme}`,
    `${t.rAadhaar}: ${r.aadhaar}`,
    `${t.rLand}: ${r.land}`,
    `${t.rBank}: ${r.bank}`,
    `${t.rClause}: ${r.clause}`,
    `${t.rDate}: ${r.stamp}`,
    t.rFoot
  ].join("\n");
  navigator.clipboard.writeText(text).then(() => {
    btn.innerText = t.rCopied;
    setTimeout(() => { btn.innerText = t.rCopy; }, 1600);
  }).catch(() => {});
};

function fillFormWalkthrough() {
  const t = i18n[currentLang];
  const scheme = lastSchemes.find(s => s.id === lastWalkthroughScheme) || null;

  // Fresh walkthrough — clear previous receipt and restore the finish button
  lastReceiptData = null;
  const finishStatus = document.getElementById("finish-status");
  finishStatus.classList.remove("active", "plain");
  finishStatus.innerHTML = "";
  const finishBtn = document.getElementById("btn-finish-guidance");
  finishBtn.disabled = false;
  finishBtn.classList.remove("done");
  finishBtn.innerText = t.btnFinishGuidance;

  // Print the actual selected scheme — name, benefit and cited clause
  document.getElementById("form-title").innerText = scheme
    ? `${scheme.name} — ${t.walkTitle}`
    : t.formTitle;
  document.getElementById("form-subtitle").innerText = scheme
    ? scheme.benefit
    : t.formSubtitle;
  document.getElementById("form-audit-box").innerHTML = scheme
    ? `<strong>${scheme.clause_cited}</strong> — ${t.formAuditLine2}`
    : t.formAudit;

  document.getElementById("form-name").value = selectedPersona
    ? selectedPersona.name
    : "Ramesh Kumar Yadav";
  document.getElementById("form-aadhaar").value = "XXXX-XXXX-9842";
  document.getElementById("form-state").value = currentProfile.state;
  document.getElementById("form-land").value = `${currentProfile.landholding_hectares} ${t.landUnit}`;
  document.getElementById("form-bank").value = t.bankText;
}

window.startFormWalkthrough = function(schemeId) {
  lastWalkthroughScheme = schemeId;
  goToStep(4);
  fillFormWalkthrough();
};
