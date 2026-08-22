import { APIError } from 'payload'
import { assertBookingCreateRateLimit } from '../../../core/security/rateLimit.js'
import { findUnavailableStay } from './availability.js'
import { calcStayTotal, nightsBetween } from './pricing.js'

// Receives POST /api/bookings from the frontend's booking flow
// (see useBookingSubmit.js). Rooms are snapshotted (roomId/name/
// pricePerNight) rather than related, so a booking's historical price
// stays correct even if the room's live rate changes later.
//
// Unlike every other collection here, guests submitting a booking are
// NOT authenticated — so `create` is public, but `read`/`update`/
// `delete` are restricted to logged-in staff (Users). `status` is
// separately locked down at the field level so a guest's own request
// can't set itself to "confirmed."
export const Bookings = {
  slug: 'bookings',
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: false,
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'confirmationMethod', 'checkIn', 'checkOut', 'status'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'create' && !req.user && !assertBookingCreateRateLimit(req)) {
          throw new APIError('Too many booking attempts. Please wait a few minutes and try again.', 429)
        }

        const checkIn = data.checkIn ?? originalDoc?.checkIn
        const checkOut = data.checkOut ?? originalDoc?.checkOut
        const nights = nightsBetween(checkIn, checkOut)
        if (checkIn && checkOut && nights < 1) {
          throw new APIError('Check-out must be after check-in.', 400)
        }

        const incomingRooms = data.rooms ?? originalDoc?.rooms
        if (!incomingRooms?.length) return data

        const slugs = incomingRooms.map((row) => row.roomId).filter(Boolean)
        if (checkIn && checkOut && slugs.length) {
          const unavailable = await findUnavailableStay(req.payload, {
            checkIn,
            checkOut,
            roomSlugs: slugs,
          })
          if (unavailable) {
            throw new APIError(unavailable, 409)
          }
        }
        const liveRooms = await req.payload.find({
          collection: 'rooms',
          where: { slug: { in: slugs } },
          limit: 100,
          overrideAccess: true,
        })
        const roomBySlug = new Map(liveRooms.docs.map((doc) => [doc.slug, doc]))

        data.rooms = incomingRooms.map((row) => {
          const live = roomBySlug.get(row.roomId)
          if (!live) {
            throw new APIError(`Room "${row.roomId}" is not available.`, 400)
          }
          return {
            ...row,
            name: live.name,
            pricePerNight: live.pricePerNight,
          }
        })

        const incomingExperiences = data.experiences ?? originalDoc?.experiences ?? []
        if (incomingExperiences.length) {
          const expSlugs = incomingExperiences.map((row) => row.experienceId).filter(Boolean)
          const liveExperiences = await req.payload.find({
            collection: 'experiences',
            where: { slug: { in: expSlugs } },
            limit: 100,
            overrideAccess: true,
          })
          const expBySlug = new Map(liveExperiences.docs.map((doc) => [doc.slug, doc]))
          data.experiences = incomingExperiences.map((row) => {
            const live = expBySlug.get(row.experienceId)
            if (!live) {
              throw new APIError(`Experience "${row.experienceId}" is not available.`, 400)
            }
            return {
              ...row,
              name: live.name,
              price: live.price,
            }
          })
        }

        if (nights > 0) {
          data.total = calcStayTotal(data.rooms, nights, data.experiences || [])
          data.currency = data.currency || 'USD'
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        // Computed display title for the admin list — Payload's
        // useAsTitle needs a real stored field, not a nested group path.
        const first = data.guest?.firstName || ''
        const last = data.guest?.lastName || ''
        data.guestName = `${first} ${last}`.trim() || 'Guest'

        // Western Union has no real-time confirmation (see the
        // paymentMethod options below) — a fresh WU booking should read
        // as "waiting on staff to verify," not the generic "unpaid"
        // every other method starts as. Only applied on create, so a
        // staff member manually setting paymentStatus afterwards is
        // never silently overwritten by this hook.
        if (operation === 'create' && data.paymentMethod === 'western-union') {
          data.paymentStatus = 'awaiting-manual-confirmation'
        }

        if (Array.isArray(data.communications)) {
          data.communications = data.communications.map((row) => ({
            ...row,
            at: row.at || new Date().toISOString(),
            author: row.author || req.user?.email || 'Staff',
          }))
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'guestName',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true, // shown as the row title instead — see useAsTitle above
      },
    },
    {
      name: 'rooms',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Snapshotted at booking time — not a live relation to Rooms.',
      },
      fields: [
        { name: 'roomId', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'pricePerNight', type: 'number', required: true, admin: { width: '25%' } },
      ],
    },
    {
      name: 'experiences',
      type: 'array',
      admin: {
        description: 'Snapshotted at booking time — not a live relation to Experiences.',
      },
      fields: [
        { name: 'experienceId', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'price', type: 'number', required: true, admin: { width: '25%' } },
      ],
    },
    {
      name: 'checkIn',
      type: 'date',
      required: true,
      admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'checkOut',
      type: 'date',
      required: true,
      admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'adults',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
      admin: { width: '25%' },
    },
    {
      name: 'children',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { width: '25%' },
    },
    {
      name: 'guest',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text', admin: { width: '25%' } },
        { name: 'lastName', type: 'text', admin: { width: '25%' } },
        { name: 'mobile', type: 'text', required: true, admin: { width: '25%' } },
        { name: 'email', type: 'text', admin: { width: '25%' } },
        { name: 'country', type: 'text', admin: { width: '25%' } },
        { name: 'specialRequests', type: 'textarea', admin: { width: '75%' } },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'pay-at-hotel',
      admin: { width: '25%' },
      options: [
        { label: 'Pay on arrival', value: 'pay-at-hotel' },
        { label: 'Card (Stripe)', value: 'stripe' },
        { label: 'Mobile Money (MTN MoMo)', value: 'momo' },
        { label: 'Western Union', value: 'western-union' },
      ],
    },
    {
      name: 'confirmationMethod',
      type: 'select',
      required: true,
      admin: { width: '25%' },
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Email', value: 'email' },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        width: '25%',
        description: 'Recalculated on the server from live room/experience prices × nights.',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      admin: {
        width: '25%',
        description: 'Display/charge currency. Stripe uses USD; MoMo uses RWF with USD_TO_RWF when set.',
      },
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'RWF', value: 'RWF' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      access: {
        // A guest's own create request can never set this — Payload
        // falls back to defaultValue ('pending') whenever this returns
        // false, regardless of what the client sent. Staff can still
        // change it afterwards through the admin UI (update access
        // below is unrestricted for logged-in users).
        create: () => false,
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      access: {
        // Same reasoning as `status` — a guest's request can never mark
        // its own payment as "paid." Stripe/MoMo only ever get flipped
        // to 'paid' by their respective webhook/status routes, which use
        // Payload's Local API (payload.update(...)) and so bypass this
        // access check by design — see the payments API routes.
        create: () => false,
      },
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        // Western Union only — see paymentMethod notes above.
        { label: 'Awaiting Manual Confirmation', value: 'awaiting-manual-confirmation' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentMeta',
      type: 'group',
      access: {
        create: () => false,
      },
      admin: {
        position: 'sidebar',
        description: 'Provider references — filled in by the payment routes, not the booking form.',
      },
      fields: [
        { name: 'stripePaymentIntentId', type: 'text', admin: { readOnly: true } },
        { name: 'momoReferenceId', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'communications',
      type: 'array',
      labels: { singular: 'Message', plural: 'Conversation' },
      access: {
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
      },
      admin: {
        description:
          'Replies and notes for this reservation. Log guest WhatsApp/email replies here so management can review the full conversation.',
      },
      fields: [
        {
          name: 'at',
          type: 'date',
          admin: { width: '25%', date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'direction',
          type: 'select',
          required: true,
          defaultValue: 'note',
          admin: { width: '25%' },
          options: [
            { label: 'Sent to guest', value: 'outbound' },
            { label: 'Guest reply', value: 'inbound' },
            { label: 'Internal note', value: 'note' },
          ],
        },
        {
          name: 'channel',
          type: 'select',
          required: true,
          defaultValue: 'internal',
          admin: { width: '25%' },
          options: [
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Email', value: 'email' },
            { label: 'Internal', value: 'internal' },
          ],
        },
        { name: 'author', type: 'text', admin: { width: '25%' } },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
  ],
}