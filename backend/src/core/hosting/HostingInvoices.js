import { isSuperAdmin } from '../security/roles.js'
import { describeHosting, invoicesToEnsure, newInvoiceData } from './status.js'

async function ensureInvoices(payload, req) {
  const existing = await payload.find({
    collection: 'hosting-invoices',
    limit: 50,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const missing = invoicesToEnsure(existing.docs.map((doc) => doc.year))
  for (const year of missing) {
    await payload.create({
      collection: 'hosting-invoices',
      data: newInvoiceData(year),
      overrideAccess: true,
      req,
    })
  }
  if (!missing.length) return existing.docs
  const refreshed = await payload.find({
    collection: 'hosting-invoices',
    limit: 50,
    depth: 0,
    sort: 'year',
    overrideAccess: true,
    req,
  })
  return refreshed.docs
}

export async function hostingSummary(payload, req) {
  const docs = await ensureInvoices(payload, req)
  const summary = describeHosting(docs)
  return {
    ...summary,
    invoices: [...docs]
      .sort((a, b) => Number(a.year) - Number(b.year))
      .map((doc) => ({
        id: doc.id,
        year: Number(doc.year),
        amount: Number(doc.amount || 70),
        payment: doc.payment || 'unpaid',
        dueDate: doc.dueDate,
      })),
  }
}

const superAdminOnly = ({ req }) => isSuperAdmin(req.user)

export const HostingInvoices = {
  slug: 'hosting-invoices',
  labels: {
    singular: 'Hosting invoice',
    plural: 'Hosting invoices',
  },
  admin: {
    group: false,
    useAsTitle: 'year',
    defaultColumns: ['year', 'amount', 'payment', 'dueDate'],
    hidden: ({ user }) => !isSuperAdmin(user),
    description: 'Annual domain and hosting invoice. Due every 25 October.',
  },
  access: {
    read: () => true,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  endpoints: [
    {
      path: '/summary',
      method: 'get',
      handler: async (req) => {
        const summary = await hostingSummary(req.payload, req)
        return Response.json(summary)
      },
    },
  ],
  fields: [
    { name: 'year', type: 'number', required: true, unique: true, admin: { width: '25%' } },
    { name: 'amount', type: 'number', required: true, defaultValue: 70, admin: { width: '25%' } },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
      admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'payment',
      type: 'select',
      required: true,
      defaultValue: 'unpaid',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Not paid', value: 'unpaid' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: { width: '25%' },
    },
  ],
}
