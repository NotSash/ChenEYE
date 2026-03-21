const en = {
  /* ═══ Common ═══ */
  common: {
    appName: "ChenEYE",
    tagline: "Be the eyes of Chennai's roads",
    submit: "Submit",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    loading: "Loading...",
    processing: "Processing...",
    search: "Search",
    filter: "Filter",
    viewAll: "View All",
    noResults: "No results found",
    confirm: "Confirm",
    logout: "Logout",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember me",
    or: "or",
    required: "Required",
    optional: "Optional",
  },

  /* ═══ Landing ═══ */
  landing: {
    heroBadge: "Making Chennai's Roads Safer",
    heroTitle1: "Report Traffic",
    heroTitle2: "Violations.",
    heroTitle3: "Anonymously.",
    heroSubtitle: "Your identity stays hidden. Your impact doesn't. Help Chennai Traffic Police take action against road violations with photo evidence.",
    ctaStart: "Start Reporting",
    ctaHow: "See How It Works",
    trustAnonymous: "100% Anonymous",
    trustDevice: "Works on any device",
    trustTime: "Takes 2 minutes",
    howTitle: "How ChenEYE Works",
    step1Title: "Capture the Violation",
    step1Desc: "See a traffic violation? Snap a photo or record a quick video. Include the vehicle's number plate for identification.",
    step2Title: "Submit Your Report",
    step2Desc: "Fill in the details — vehicle number, location, type of violation. Our guided form makes it easy. Your identity stays anonymous.",
    step3Title: "Police Takes Action",
    step3Desc: "Chennai Traffic Police reviews your report and takes appropriate action. You'll be notified of every status update.",
    ctaFirst: "Start Your First Report",
    whyTitle: "Why ChenEYE?",
    faqTitle: "Frequently Asked Questions",
    readyTitle: "Ready to Make Chennai's Roads Safer?",
    readySubtitle: "Join fellow citizens in keeping our streets safe. It only takes 2 minutes.",
    ctaCreate: "Create Free Account",
    alreadyAccount: "Already have an account?",
  },

  /* ═══ Auth ═══ */
  auth: {
    createAccount: "Create Your Account",
    welcomeBack: "Welcome Back",
    anonymityNotice: "Your identity is kept completely anonymous. We collect your details only to prevent spam and misuse. Police officials will never see your personal information — only an anonymous User ID.",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    password: "Password",
    confirmPassword: "Confirm Password",
    age: "Age",
    sendOtp: "Send OTP",
    verifyOtp: "Verify",
    termsAgree: "I agree to the Terms of Service",
    privacyAgree: "I agree to the Privacy Policy",
    falseReportAck: "I understand that filing false reports is punishable under IPC Section 182 and will result in account ban after 3 warnings",
    anonymityAck: "I understand my identity will remain anonymous but my reports will be reviewed by police officials",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
  },

  /* ═══ Dashboard ═══ */
  dashboard: {
    welcome: "Welcome back!",
    anonymousId: "Your Anonymous ID",
    anonymousIdHint: "This ID is how police track your reports without knowing your identity.",
    reportViolation: "Report a Violation",
    reportViolationDesc: "Spotted a traffic violation? Submit a report with photo evidence.",
    newReport: "New Report",
    totalReports: "Total Reports",
    underReview: "Under Review",
    actionTaken: "Action Taken",
    recentReports: "Recent Reports",
    safetyReminder: "Remember: Only submit genuine violations with clear evidence. False reports result in warnings and potential ban.",
  },

  /* ═══ Report ═══ */
  report: {
    uploadEvidence: "Upload Evidence",
    uploadHint: "Clear photos or videos help police take action faster.",
    vehicleInfo: "Vehicle & Violation Information",
    vehicleNumber: "Vehicle Number",
    violationType: "Violation Type",
    vehicleType: "Vehicle Type",
    vehicleColor: "Vehicle Color",
    locationTime: "When & Where Did This Happen?",
    location: "Location",
    date: "Date",
    time: "Time",
    description: "Description",
    landmark: "Landmark",
    direction: "Direction of Travel",
    severity: "Severity",
    repeatOffender: "I've seen this vehicle commit violations before",
    review: "Review Your Report",
    reviewHint: "Please review all details before submitting.",
    submitReport: "Submit Report",
    legalNotice: "By submitting this report, I confirm the information is truthful, the evidence is genuine, and I understand that false reports are punishable under IPC Section 182.",
    successTitle: "Report Submitted Successfully!",
    successHint: "You'll receive updates via email and in-app notifications.",
    submitAnother: "Submit Another",
    viewReports: "View My Reports",
  },

  /* ═══ Status ═══ */
  status: {
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    action_taken: "Action Taken",
    pending: "Pending",
  },

  /* ═══ Admin ═══ */
  admin: {
    dashboard: "Dashboard",
    allReports: "All Reports",
    pendingQueue: "Pending Queue",
    violationMap: "Violation Map",
    inviteCodes: "Invite Codes",
    manageAdmins: "Manage Admins",
    bannedUsers: "Banned Users",
    appeals: "Appeals",
    analytics: "Analytics",
    systemSettings: "System Settings",
    generateCode: "Generate Code",
    intendedFor: "Intended For",
    role: "Role",
    policeAdmin: "Police Admin",
    superAdmin: "Super Admin",
    revoke: "Revoke",
    topViolations: "Top Violations This Week",
    vendettaAlerts: "Vendetta Alerts",
    pendingReview: "Pending Review",
  },

  /* ═══ Navigation ═══ */
  nav: {
    dashboard: "Dashboard",
    newReport: "New Report",
    myReports: "My Reports",
    violationMap: "Violation Map",
    notifications: "Notifications",
    profile: "Profile",
    toggleTheme: "Toggle Theme",
  },
} as const;

export default en;

// Use a recursive mapped type so translations can have any string values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

export type Dictionary = DeepStringify<typeof en>;

