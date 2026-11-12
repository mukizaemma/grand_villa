import { isSuperAdmin } from '../security/roles.js'

export const HandoverSettings = {
  slug: 'handover-settings',
  label: 'Handover access',
  admin: {
    group: false,
    hidden: ({ user }) => !isSuperAdmin(user),
    description: 'Turn the public handover guide and new account page on or off.',
  },
  access: {
    read: () => true,
    update: ({ req }) => isSuperAdmin(req.user),
  },
  fields: [
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      label: 'Handover guide and public account signup are available',
    },
  ],
}
