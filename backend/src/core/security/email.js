import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

export function createEmailAdapter() {
  const defaultFromAddress = process.env.SMTP_FROM || 'noreply@grandvilla.local'
  const defaultFromName = process.env.SMTP_FROM_NAME || 'Grand Villa Apartment'

  if (process.env.SMTP_HOST) {
    return nodemailerAdapter({
      defaultFromAddress,
      defaultFromName,
      skipVerify: true,
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

  // Do not call Ethereal here. On DigitalOcean that request often fails and
  // Payload never boots ("There was an error initializing Payload").
  return nodemailerAdapter({
    defaultFromAddress,
    defaultFromName,
    skipVerify: true,
    transport: nodemailer.createTransport({ jsonTransport: true }),
  })
}
