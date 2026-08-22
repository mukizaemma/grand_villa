import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export function createEmailAdapter() {
  const fromAddress = process.env.SMTP_FROM || 'noreply@grandvilla.local'
  const fromName = process.env.SMTP_FROM_NAME || 'Grand Villa Apartment'

  if (process.env.SMTP_HOST) {
    return nodemailerAdapter({
      defaultFromAddress: fromAddress,
      defaultFromName: fromName,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      },
    })
  }

  // Local/dev: Ethereal inbox. Forgot-password still works; the preview
  // URL is printed in the backend terminal.
  return nodemailerAdapter({
    defaultFromAddress: fromAddress,
    defaultFromName: fromName,
  })
}
