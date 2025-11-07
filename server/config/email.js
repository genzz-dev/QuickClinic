export const config = {
  host: process.env.EMAIL_HOST || 'localhost',
  port: parseInt(process.env.EMAIL_PORT) || 1025,
  secure: process.env.EMAIL_SECURE === 'true',
  ...(process.env.EMAIL_USER && {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }),
  from: process.env.EMAIL_FROM || 'no-reply@healthcare.local',
  appName: process.env.APP_NAME || 'QuickClinic',
  baseUrl: process.env.BASE_URL || 'https://quickclinic-fowt.onrender.com',
};
