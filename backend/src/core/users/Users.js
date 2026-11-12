import { APIError } from 'payload'
import { previewUpload } from '../fields/pageHero.js'
import { rowActionsField } from '../fields/rowActions.js'
import { isSuperAdmin, SUPER_ADMIN_EMAIL } from '../security/roles.js'
import { forceLogoutHandler } from './register.js'
import { clearUserSessions } from './sessions.js'

const isSelfOrSuper = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  return { id: { equals: user.id } }
}

const canCreateUser = async ({ req }) => {
  if (isSuperAdmin(req.user)) return true
  const existing = await req.payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return existing.totalDocs === 0
}

function resetEmailHtml({ token }) {
  const server = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
  const adminUrl = `${server}/admin/reset/${token}`
  const staffUrl = `${frontend}/staff/reset/${token}`
  return `
    <div style="font-family:Georgia,serif;background:#f7f5f1;padding:32px">
      <div style="max-width:520px;margin:0 auto;background:#fff;padding:28px 32px;border:1px solid #e6e9f0">
        <p style="color:#c4a574;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;margin:0 0 8px">Grand Villa Apartment</p>
        <h1 style="color:#1a2b4b;font-size:22px;margin:0 0 12px">Reset your password</h1>
        <p style="color:#5c6578;line-height:1.6">We received a request to reset the password for this account. This link expires in one hour.</p>
        <p style="margin:24px 0">
          <a href="${adminUrl}" style="display:inline-block;background:#1a2b4b;color:#fff;text-decoration:none;padding:12px 18px;font-weight:700">Choose a new password</a>
        </p>
        <p style="color:#8a8172;font-size:13px;word-break:break-all">${adminUrl}</p>
        <p style="color:#8a8172;font-size:13px">Staff desk: <a href="${staffUrl}">${staffUrl}</a></p>
        <p style="color:#8a8172;font-size:13px">If you did not request this, you can ignore the email.</p>
      </div>
    </div>
  `
}

export const Users = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    forgotPassword: {
      expiration: 1000 * 60 * 60,
      generateEmailSubject: () => 'Reset your Grand Villa password',
      generateEmailHTML: resetEmailHtml,
    },
  },
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    group: false,
    useAsTitle: 'email',
    hidden: ({ user }) => !isSuperAdmin(user),
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'status', 'rowActions'],
    description: 'System users. Only admin@iremetech.com can grant admin, delete users, or block login.',
  },
  access: {
    admin: ({ req: { user } }) => isSuperAdmin(user) || user?.role === 'admin',
    create: canCreateUser,
    read: isSelfOrSuper,
    update: isSelfOrSuper,
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  endpoints: [
    {
      path: '/force-logout',
      method: 'post',
      handler: forceLogoutHandler,
    },
  ],
  fields: [
    rowActionsField,
    { name: 'firstName', type: 'text', admin: { width: '25%' } },
    { name: 'lastName', type: 'text', admin: { width: '25%' } },
    { name: 'name', type: 'text', admin: { width: '25%', description: 'Optional display name if first/last are empty' } },
    { name: 'phone', type: 'text', admin: { width: '25%' } },
    previewUpload('avatar', { admin: { width: '25%' } }),
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Editor — website content', value: 'editor' },
        { label: 'Admin — admin panel', value: 'admin' },
      ],
      admin: { position: 'sidebar', description: 'Admin panel access. Site setting and Users stay with the super admin.' },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Login allowed', value: 'active' },
        { label: 'Login blocked', value: 'inactive' },
      ],
      admin: { position: 'sidebar' },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        if (data.email) data.email = String(data.email).trim().toLowerCase()
        if (operation === 'create' && !req.context?.trustedAccountCreate && !isSuperAdmin(req.user)) {
          data.role = 'editor'
          data.status = 'active'
        }
        if (operation === 'update' && originalDoc && !isSuperAdmin(req.user)) {
          data.role = originalDoc.role
          data.status = originalDoc.status
          if (String(data.email || '').toLowerCase() === SUPER_ADMIN_EMAIL) data.email = originalDoc.email
        }
        if (operation === 'update' && originalDoc && isSuperAdmin(originalDoc)) {
          data.email = originalDoc.email
          data.status = 'active'
          data.role = originalDoc.role || 'admin'
        }
        return data
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user?.status === 'inactive') {
          throw new APIError('Login is not allowed for this account.', 401)
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (!isSuperAdmin(req.user)) {
          throw new APIError('Only the super admin can delete a user.', 403)
        }
        const existing = await req.payload.findByID({
          collection: 'users',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (isSuperAdmin(existing)) {
          throw new APIError('The super admin account cannot be deleted.', 400)
        }
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation === 'update' && doc?.status === 'inactive' && previousDoc?.status !== 'inactive') {
          await clearUserSessions(req, doc.id)
        }
      },
    ],
    afterLogin: [
      ({ req, user }) => {
        if (!user?.id) return
        const { id } = user
        const { payload } = req
        setImmediate(() => {
          payload
            .update({
              collection: 'users',
              id,
              data: { lastLogin: new Date().toISOString() },
              overrideAccess: true,
            })
            .catch((error) => {
              payload.logger?.error?.(error)
            })
        })
      },
    ],
  },
}
