// config/email.js
export const config = {
  host: process.env.EMAIL_HOST || 'localhost', // MailHog runs on localhost
  port: process.env.EMAIL_PORT || 1025,       // MailHog SMTP port
  secure: false,                              // MailHog doesn't use TLS
  // REMOVE THESE LINES COMPLETELY for MailHog:
  // auth: {
  //   user: '',
  //   pass: ''
  // },
  from: process.env.EMAIL_FROM || 'no-reply@healthcare.local',
  appName: process.env.APP_NAME || 'QuickClinic',
  baseUrl: process.env.BASE_URL || 'https://quickclinic-fowt.onrender.com'
};