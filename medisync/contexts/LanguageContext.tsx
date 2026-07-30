'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'en' | 'hi'

type TranslationKey =
  | 'back'
  | 'loading'
  | 'summarization'
  | 'noReportLoaded'
  | 'uploadReportToStart'
  | 'uploadReportDescription'
  | 'uploadReport'
  | 'output'
  | 'summary'
  | 'noSummaryYet'
  | 'quickSummary'
  | 'detailed'
  | 'extractReadings'
  | 'addToProfile'
  | 'working'
  | 'askQuestion'
  | 'explainThisAnswer'
  | 'explaining'
  | 'verifyExtractedReadings'
  | 'verifyExtractedReadingsDescription'
  | 'noReadingsFound'
  | 'readingsLookNormal'
  | 'readingsLookNormalText'
  | 'warningValuesDetected'
  | 'warningValuesDetectedText'
  | 'criticalValuesDetected'
  | 'criticalValuesDetectedText'
  | 'severityDetails'
  | 'source'
  | 'remove'
  | 'cancel'
  | 'saveToHealthRecords'
  | 'saving'
  | 'addToMyProfile'
  | 'profileUpdated'
  | 'readingsSaved'
  | 'youMustBeLoggedIn'
  | 'goodMorning'
  | 'menu'
  | 'myProfile'
  | 'healthTrends'
  | 'compareReports'
  | 'medicalQrCode'
  | 'settings'
  | 'logout'
  | 'healthCompanionTagline'
  | 'saveProfile'
  | 'yourName'
  | 'addPhoto'
  | 'uploading'
  | 'changePhoto'
  | 'personalDetails'
  | 'fullName'
  | 'fullNamePlaceholder'
  | 'phoneNumber'
  | 'phoneNumberPlaceholder'
  | 'dateOfBirth'
  | 'ageAutoCalculated'
  | 'autoCalculated'
  | 'gender'
  | 'selectGender'
  | 'female'
  | 'male'
  | 'other'
  | 'preferNotToSay'
  | 'address'
  | 'addressPlaceholder'
  | 'medicalInformation'
  | 'bloodType'
  | 'bloodTypePlaceholder'
  | 'organDonorStatus'
  | 'yes'
  | 'no'
  | 'allergies'
  | 'allergiesPlaceholder'
  | 'currentMedications'
  | 'currentMedicationsPlaceholder'
  | 'medicalConditions'
  | 'medicalConditionsPlaceholder'
  | 'emergencyContacts'
  | 'primaryContactName'
  | 'primaryContactNamePlaceholder'
  | 'primaryEmergencyContact'
  | 'secondaryContactName'
  | 'secondaryContactNamePlaceholder'
  | 'secondaryEmergencyContact'
  | 'phoneNumberLower'
  | 'myEmailReadonly'
  | 'authenticatedPrimaryAccount'
  | 'profilePhotoUpdated'
  | 'mustLoginView'
  | 'mustLoginSave'
  | 'profileSaved'
  | 'errorUploadingPhoto'
  | 'photoUploadedFailedSave'
  | 'errorSaving'
  | 'years'
  | 'welcomeBack'
  | 'loginSubtitle'
  | 'emailAddress'
  | 'emailPlaceholder'
  | 'password'
  | 'rememberMe'
  | 'forgotPassword'
  | 'loggingIn'
  | 'login'
  | 'createAccount'
  | 'loginTerms'
  | 'browserNoVideo'
  | 'errorPrefix'
  | "suggestedProfileUpdates"

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    back: 'Back',
    loading: 'Loading...',
    summarization: 'Summarization',
    noReportLoaded: 'No report loaded',
    uploadReportToStart: 'Upload a report to get started',
    uploadReportDescription:
      'Once you upload a medical report, come back here to generate summaries, ask questions about it, and pull out health readings automatically.',
    uploadReport: 'Upload Report',
    output: 'Output',
    summary: 'summary',
    suggestedProfileUpdates: "Suggested Profile Updates",
    noSummaryYet: 'no summary yet — run Quick Summary or Detailed below',
    quickSummary: 'Quick Summary',
    detailed: 'Detailed',
    extractReadings: 'Extract Readings',
    addToProfile: 'Add to Profile',
    working: 'Working...',
    askQuestion: 'Ask a question...',
    explainThisAnswer: 'Explain this answer',
    explaining: 'Explaining...',
    verifyExtractedReadings: 'Verify Extracted Readings',
    verifyExtractedReadingsDescription:
      'Review and edit the AI-extracted readings before saving them to your health records.',
    noReadingsFound: 'No readings found in this report.',
    readingsLookNormal: 'Readings look normal',
    readingsLookNormalText:
      'The extracted readings appear within the configured threshold ranges.',
    warningValuesDetected: 'Warning values detected',
    warningValuesDetectedText:
      'Some readings are outside the expected range. Please review them with a doctor.',
    criticalValuesDetected: 'Critical values detected',
    criticalValuesDetectedText:
      'Some readings are in a critical range. Please consult a doctor or seek medical help immediately.',
    severityDetails: 'Severity details',
    source: 'Source',
    remove: 'Remove',
    cancel: 'Cancel',
    saveToHealthRecords: 'Save to Health Records',
    saving: 'Saving...',
    addToMyProfile: 'Add to My Profile',
    profileUpdated: '✅ Profile updated!',
    readingsSaved: '✅ Readings saved to your health data!',
    youMustBeLoggedIn: 'You must be logged in.',

    goodMorning: 'Good morning ✨',
    menu: 'Menu',
    myProfile: 'My Profile',
    healthTrends: 'Health Trends',
    compareReports: 'Compare Reports',
    medicalQrCode: 'Medical QR Code',
    settings: 'Settings',
    logout: 'Log out',

    healthCompanionTagline: 'Your intelligent health & emergency companion',
    saveProfile: 'Save profile',
    yourName: 'Your Name',
    addPhoto: 'Add photo',
    uploading: 'Uploading...',
    changePhoto: 'Change photo',
    personalDetails: 'Personal Details',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your full name',
    phoneNumber: 'Phone number',
    phoneNumberPlaceholder: 'Your phone number',
    dateOfBirth: 'Date of birth',
    ageAutoCalculated: 'Age (Auto-calculated)',
    autoCalculated: 'Auto-calculated',
    gender: 'Gender',
    selectGender: 'Select gender',
    female: 'Female',
    male: 'Male',
    other: 'Other',
    preferNotToSay: 'Prefer not to say',
    address: 'Address',
    addressPlaceholder: 'Street, city, state',
    medicalInformation: 'Medical Information',
    bloodType: 'Blood type',
    bloodTypePlaceholder: 'e.g. O+, A-',
    organDonorStatus: 'Organ donor status',
    yes: 'Yes',
    no: 'No',
    allergies: 'Allergies',
    allergiesPlaceholder: 'List any drug, food, or environmental allergies...',
    currentMedications: 'Current medications',
    currentMedicationsPlaceholder: 'List prescription medications, dosages, or supplements...',
    medicalConditions: 'Medical conditions',
    medicalConditionsPlaceholder: 'List chronic conditions, past surgeries, or medical notes...',
    emergencyContacts: 'Emergency Contacts',
    primaryContactName: 'Primary contact name',
    primaryContactNamePlaceholder: 'e.g. Mom, Radha Sharma',
    primaryEmergencyContact: 'Primary emergency contact',
    secondaryContactName: 'Secondary contact name',
    secondaryContactNamePlaceholder: 'e.g. Dad, Shivam Patel',
    secondaryEmergencyContact: 'Secondary emergency contact',
    phoneNumberLower: 'phone number',
    myEmailReadonly: 'My email address (Read-only)',
    authenticatedPrimaryAccount: 'Authenticated primary account',
    profilePhotoUpdated: 'Profile photo updated.',
    mustLoginView: 'You must be logged in to view this page.',
    mustLoginSave: 'You must be logged in to save.',
    profileSaved: 'Profile saved successfully.',
    errorUploadingPhoto: 'Error uploading photo',
    photoUploadedFailedSave: 'Photo uploaded but failed to save',
    errorSaving: 'Error saving',
    years: 'years',

    welcomeBack: 'Welcome Back!',
    loginSubtitle: 'Please log in to your account.',
    emailAddress: 'Email Address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loggingIn: 'Logging in...',
    login: 'Login',
    createAccount: 'Create account',
    loginTerms: 'By logging in you agree to our terms and confirm you have read our data policy.',
    browserNoVideo: 'Your browser does not support the video tag.',
    errorPrefix: 'Error',
  },

  hi: {
    back: 'वापस',
    loading: 'लोड हो रहा है...',
    summarization: 'सारांश',
    noReportLoaded: 'कोई रिपोर्ट लोड नहीं है',
    uploadReportToStart: 'शुरू करने के लिए रिपोर्ट अपलोड करें',
    uploadReportDescription:
      'मेडिकल रिपोर्ट अपलोड करने के बाद, आप यहाँ सारांश बना सकते हैं, रिपोर्ट से सवाल पूछ सकते हैं, और स्वास्थ्य रीडिंग अपने आप निकाल सकते हैं।',
    uploadReport: 'रिपोर्ट अपलोड करें',
    output: 'आउटपुट',
    summary: 'सारांश',
    noSummaryYet: 'अभी कोई सारांश नहीं है — नीचे त्वरित सारांश या विस्तृत विकल्प चलाएँ',
    quickSummary: 'त्वरित सारांश',
    suggestedProfileUpdates: "सुझाए गए प्रोफ़ाइल अपडेट",
    detailed: 'विस्तृत',
    extractReadings: 'रीडिंग निकालें',
    addToProfile: 'प्रोफाइल में जोड़ें',
    working: 'काम हो रहा है...',
    askQuestion: 'सवाल पूछें...',
    explainThisAnswer: 'इस उत्तर को समझाएँ',
    explaining: 'समझाया जा रहा है...',
    verifyExtractedReadings: 'निकाली गई रीडिंग जाँचें',
    verifyExtractedReadingsDescription:
      'AI द्वारा निकाली गई रीडिंग को स्वास्थ्य रिकॉर्ड में सेव करने से पहले जाँचें और संपादित करें।',
    noReadingsFound: 'इस रिपोर्ट में कोई रीडिंग नहीं मिली।',
    readingsLookNormal: 'रीडिंग सामान्य लग रही हैं',
    readingsLookNormalText:
      'निकाली गई रीडिंग निर्धारित सीमा के अंदर लग रही हैं।',
    warningValuesDetected: 'चेतावनी वाली वैल्यू मिली',
    warningValuesDetectedText:
      'कुछ रीडिंग अपेक्षित सीमा से बाहर हैं। कृपया डॉक्टर से सलाह लें।',
    criticalValuesDetected: 'गंभीर वैल्यू मिली',
    criticalValuesDetectedText:
      'कुछ रीडिंग गंभीर सीमा में हैं। कृपया तुरंत डॉक्टर या चिकित्सा सहायता लें।',
    severityDetails: 'गंभीरता विवरण',
    source: 'स्रोत',
    remove: 'हटाएँ',
    cancel: 'रद्द करें',
    saveToHealthRecords: 'स्वास्थ्य रिकॉर्ड में सेव करें',
    saving: 'सेव हो रहा है...',
    addToMyProfile: 'मेरी प्रोफाइल में जोड़ें',
    profileUpdated: '✅ प्रोफाइल अपडेट हो गई!',
    readingsSaved: '✅ रीडिंग आपके स्वास्थ्य डेटा में सेव हो गई!',
    youMustBeLoggedIn: 'आपको लॉग इन करना होगा।',

    goodMorning: 'सुप्रभात ✨',
    menu: 'मेन्यू',
    myProfile: 'मेरी प्रोफाइल',
    healthTrends: 'स्वास्थ्य ट्रेंड्स',
    compareReports: 'रिपोर्ट तुलना',
    medicalQrCode: 'मेडिकल QR कोड',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',

    healthCompanionTagline: 'आपका बुद्धिमान स्वास्थ्य और आपातकालीन साथी',
    saveProfile: 'प्रोफाइल सेव करें',
    yourName: 'आपका नाम',
    addPhoto: 'फोटो जोड़ें',
    uploading: 'अपलोड हो रहा है...',
    changePhoto: 'फोटो बदलें',
    personalDetails: 'व्यक्तिगत जानकारी',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम',
    phoneNumber: 'फोन नंबर',
    phoneNumberPlaceholder: 'अपना फोन नंबर',
    dateOfBirth: 'जन्म तिथि',
    ageAutoCalculated: 'उम्र (अपने आप)',
    autoCalculated: 'अपने आप गणना होगी',
    gender: 'लिंग',
    selectGender: 'लिंग चुनें',
    female: 'महिला',
    male: 'पुरुष',
    other: 'अन्य',
    preferNotToSay: 'बताना नहीं चाहते',
    address: 'पता',
    addressPlaceholder: 'गली, शहर, राज्य',
    medicalInformation: 'चिकित्सा जानकारी',
    bloodType: 'ब्लड ग्रुप',
    bloodTypePlaceholder: 'जैसे O+, A-',
    organDonorStatus: 'अंग दाता स्थिति',
    yes: 'हाँ',
    no: 'नहीं',
    allergies: 'एलर्जी',
    allergiesPlaceholder: 'दवा, भोजन या पर्यावरण से जुड़ी एलर्जी लिखें...',
    currentMedications: 'वर्तमान दवाएँ',
    currentMedicationsPlaceholder: 'दवाएँ, डोज़ या सप्लीमेंट लिखें...',
    medicalConditions: 'चिकित्सा स्थितियाँ',
    medicalConditionsPlaceholder: 'पुरानी बीमारी, सर्जरी या मेडिकल नोट्स लिखें...',
    emergencyContacts: 'आपातकालीन संपर्क',
    primaryContactName: 'प्राथमिक संपर्क का नाम',
    primaryContactNamePlaceholder: 'जैसे माँ,राधा शर्मा',
    primaryEmergencyContact: 'प्राथमिक आपातकालीन संपर्क',
    secondaryContactName: 'द्वितीय संपर्क का नाम',
    secondaryContactNamePlaceholder: 'जैसे पापा,शिवम पटेल',
    secondaryEmergencyContact: 'द्वितीय आपातकालीन संपर्क',
    phoneNumberLower: 'फोन नंबर',
    myEmailReadonly: 'मेरा ईमेल पता (केवल पढ़ने के लिए)',
    authenticatedPrimaryAccount: 'प्रमाणित मुख्य खाता',
    profilePhotoUpdated: 'प्रोफाइल फोटो अपडेट हो गई।',
    mustLoginView: 'इस पेज को देखने के लिए लॉग इन करना होगा।',
    mustLoginSave: 'सेव करने के लिए लॉग इन करना होगा।',
    profileSaved: 'प्रोफाइल सफलतापूर्वक सेव हो गई।',
    errorUploadingPhoto: 'फोटो अपलोड करने में त्रुटि',
    photoUploadedFailedSave: 'फोटो अपलोड हुई लेकिन सेव नहीं हो पाई',
    errorSaving: 'सेव करने में त्रुटि',
    years: 'वर्ष',

    welcomeBack: 'वापसी पर स्वागत है!',
    loginSubtitle: 'कृपया अपने खाते में लॉग इन करें।',
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'you@example.com',
    password: 'पासवर्ड',
    rememberMe: 'मुझे याद रखें',
    forgotPassword: 'पासवर्ड भूल गए?',
    loggingIn: 'लॉग इन हो रहा है...',
    login: 'लॉग इन',
    createAccount: 'खाता बनाएँ',
    loginTerms:
      'लॉग इन करके आप हमारी शर्तों से सहमत होते हैं और पुष्टि करते हैं कि आपने हमारी डेटा नीति पढ़ी है।',
    browserNoVideo: 'आपका ब्राउज़र वीडियो टैग को सपोर्ट नहीं करता।',
    errorPrefix: 'त्रुटि',
  },
}

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('medisync-language') as Language | null

    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved)
    }
  }, [])

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage)
    localStorage.setItem('medisync-language', nextLanguage)
  }

  function toggleLanguage() {
    setLanguage(language === 'en' ? 'hi' : 'en')
  }

  function t(key: TranslationKey) {
    return translations[language][key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}