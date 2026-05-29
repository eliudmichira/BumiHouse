// Internationalization (i18n) system for English and Kiswahili
const translations = {
  en: {
    // Navigation
    home: "Home",
    properties: "Properties",
    about: "About",
    contact: "Contact",
    login: "Login",
    register: "Register",
    profile: "Profile",
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    
    // Profile Update Page
    profilePicture: "Profile Picture",
    uploadNewPicture: "Click below to upload a new profile picture",
    chooseFile: "Choose File",
    personalInformation: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    location: "Location",
    bio: "Bio",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    language: "Language",
    security: "Security",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordStrength: "Password Strength",
    saveChanges: "Save Changes",
    updating: "Updating...",
    profileUpdated: "Profile updated successfully!",
    passwordUpdated: "Password updated successfully!",
    failedToUpdate: "Failed to update profile",
    failedToUpdatePassword: "Failed to update password",
    
    // Account Overview
    accountOverview: "Account Overview",
    propertiesListed: "Properties Listed",
    savedProperties: "Saved Properties",
    memberSince: "Member Since",
    
    // Quick Actions
    quickActions: "Quick Actions",
    billingPayments: "Billing & Payments",
    privacySettings: "Privacy Settings",
    helpSupport: "Help & Support",
    
    // Password Strength
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    veryStrong: "Very Strong",
    
    // Form Labels
    username: "Username",
    fullName: "Full Name",
    address: "Address",
    city: "City",
    country: "Country",
    
    // Notifications
    emailNotifications: "Email Notifications",
    smsNotifications: "SMS Notifications",
    pushNotifications: "Push Notifications",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    
    // Property Related
    searchProperties: "Search Properties",
    filterProperties: "Filter Properties",
    propertyDetails: "Property Details",
    contactAgent: "Contact Agent",
    scheduleViewing: "Schedule Viewing",
    saveProperty: "Save Property",
    shareProperty: "Share Property",
    
    // Authentication
    signIn: "Sign In",
    signUp: "Sign Up",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    
    // Validation Messages
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 8 characters",
    phoneInvalid: "Please enter a valid phone number"
  },
  
  sw: {
    // Navigation
    home: "Nyumbani",
    properties: "Mali",
    about: "Kuhusu",
    contact: "Wasiliana",
    login: "Ingia",
    register: "Jisajili",
    profile: "Wasifu",
    dashboard: "Dashibodi",
    settings: "Mipangilio",
    logout: "Ondoka",
    
    // Profile Update Page
    profilePicture: "Picha ya Wasifu",
    uploadNewPicture: "Bofya hapa chini kupakia picha mpya ya wasifu",
    chooseFile: "Chagua Faili",
    personalInformation: "Taarifa za Kibinafsi",
    firstName: "Jina la Kwanza",
    lastName: "Jina la Mwisho",
    email: "Barua Pepe",
    phone: "Nambari ya Simu",
    location: "Mahali",
    bio: "Wasifu",
    preferences: "Mapendeleo",
    darkMode: "Hali ya Giza",
    notifications: "Arifa",
    language: "Lugha",
    security: "Usalama",
    currentPassword: "Nywila ya Sasa",
    newPassword: "Nywila Mpya",
    confirmPassword: "Thibitisha Nywila",
    passwordStrength: "Nguvu ya Nywila",
    saveChanges: "Hifadhi Mabadiliko",
    updating: "Inasasisha...",
    profileUpdated: "Wasifu umesasishwa kwa mafanikio!",
    passwordUpdated: "Nywila imesasishwa kwa mafanikio!",
    failedToUpdate: "Imeshindwa kusasisha wasifu",
    failedToUpdatePassword: "Imeshindwa kusasisha nywila",
    
    // Account Overview
    accountOverview: "Muhtasari wa Akaunti",
    propertiesListed: "Mali Zilizoorodheshwa",
    savedProperties: "Mali Zilizohifadhiwa",
    memberSince: "Mwanachama Tangu",
    
    // Quick Actions
    quickActions: "Vitendo vya Haraka",
    billingPayments: "Bili na Malipo",
    privacySettings: "Mipangilio ya Faragha",
    helpSupport: "Msaada na Usaidizi",
    
    // Password Strength
    weak: "Dhaifu",
    fair: "Mkubwa",
    good: "Nzuri",
    strong: "Imara",
    veryStrong: "Imara Sana",
    
    // Form Labels
    username: "Jina la Mtumiaji",
    fullName: "Jina Kamili",
    address: "Anwani",
    city: "Jiji",
    country: "Nchi",
    
    // Notifications
    emailNotifications: "Arifa za Barua Pepe",
    smsNotifications: "Arifa za SMS",
    pushNotifications: "Arifa za Push",
    
    // Common
    save: "Hifadhi",
    cancel: "Ghairi",
    edit: "Hariri",
    delete: "Futa",
    view: "Tazama",
    back: "Rudi",
    next: "Ifuatayo",
    previous: "Iliyotangulia",
    submit: "Wasilisha",
    loading: "Inapakia...",
    error: "Hitilafu",
    success: "Mafanikio",
    warning: "Onyo",
    info: "Maelezo",
    
    // Property Related
    searchProperties: "Tafuta Mali",
    filterProperties: "Chuja Mali",
    propertyDetails: "Maelezo ya Mali",
    contactAgent: "Wasiliana na Wakili",
    scheduleViewing: "Panga Kuangalia",
    saveProperty: "Hifadhi Mali",
    shareProperty: "Shiriki Mali",
    
    // Authentication
    signIn: "Ingia",
    signUp: "Jisajili",
    forgotPassword: "Umesahau nywila?",
    resetPassword: "Weka upya nywila",
    createAccount: "Unda Akaunti",
    alreadyHaveAccount: "Una akaunti tayari?",
    dontHaveAccount: "Huna akaunti?",
    
    // Validation Messages
    required: "Sehemu hii inahitajika",
    invalidEmail: "Tafadhali weka barua pepe halali",
    passwordMismatch: "Nywila hazifanani",
    passwordTooShort: "Nywila lazima iwe na herufi 8 au zaidi",
    phoneInvalid: "Tafadhali weka nambari ya simu halali"
  }
};

// Language context and provider
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('estate_language');
    return savedLanguage && translations[savedLanguage] ? savedLanguage : 'en';
  });

  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('estate_language', language);
    }
  };

  useEffect(() => {
    // Update document direction and language attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'sw' ? 'ltr' : 'ltr'; // Both languages are LTR
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default translations; 