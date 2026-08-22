export function dayKey(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  try {
    return new Date(value).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

export function staysOverlap(checkIn, checkOut, closedFrom, openFrom) {
  const stayStart = dayKey(checkIn)
  const stayEnd = dayKey(checkOut)
  const blockStart = dayKey(closedFrom)
  const blockEnd = dayKey(openFrom)
  if (!stayStart || !stayEnd || !blockStart || !blockEnd) return false
  return stayStart < blockEnd && stayEnd > blockStart
}

export function roomIdOf(value) {
  if (!value) return ''
  if (typeof value === 'object') return value.slug || value.id || value._id || ''
  return String(value)
}

export function closureBlocksStay(block, { checkIn, checkOut, roomSlugs = [] }) {
  if (!block || block.active === false) return false
  if (!staysOverlap(checkIn, checkOut, block.startDate, block.reopenDate)) return false
  if (block.scope === 'hotel') return true
  const closed = (block.rooms || []).map(roomIdOf).filter(Boolean)
  return roomSlugs.some((slug) => closed.includes(slug))
}

export function guestClosureMessage(block) {
  if (!block) return ''
  if (block.guestMessage) return block.guestMessage
  const from = dayKey(block.startDate)
  const open = dayKey(block.reopenDate)
  const last = addDays(open, -1)
  const window = last && last !== from ? `${from}–${last}` : from
  return `${window} ${last && last !== from ? 'are' : 'is'} closed. Stay before ${from}, or check in from ${open}.`
}

export async function findBlockingClosure(payload, { checkIn, checkOut, roomSlugs = [] }) {
  const result = await payload.find({
    collection: 'availability-blocks',
    where: { active: { equals: true } },
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })
  return (result.docs || []).find((block) => closureBlocksStay(block, { checkIn, checkOut, roomSlugs })) || null
}

export function addDays(value, amount) {
  const key = dayKey(value)
  if (!key) return ''
  const date = new Date(`${key}T12:00:00`)
  date.setDate(date.getDate() + amount)
  return date.toISOString().slice(0, 10)
}

export function eachNight(start, endExclusive) {
  const nights = []
  let cursor = dayKey(start)
  const end = dayKey(endExclusive)
  while (cursor && end && cursor < end) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function websiteSellable(units) {
  const total = Math.max(1, Number(units) || 1)
  return total > 1 ? total - 1 : 1
}

function bookingUsesRoom(booking, roomSlug) {
  return (booking.rooms || []).some((row) => row.roomId === roomSlug)
}

export async function buildRoomCalendar(payload, { roomSlug, from, to }) {
  const start = dayKey(from) || dayKey(new Date())
  const end = dayKey(to) || addDays(start, 180)

  const [rooms, blocks, bookings] = await Promise.all([
    roomSlug
      ? payload.find({
          collection: 'rooms',
          where: { slug: { equals: roomSlug } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] }),
    payload.find({
      collection: 'availability-blocks',
      where: { active: { equals: true } },
      limit: 100,
      depth: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'bookings',
      where: {
        and: [
          { status: { not_equals: 'cancelled' } },
          { checkIn: { less_than: end } },
          { checkOut: { greater_than: start } },
        ],
      },
      limit: 300,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const room = rooms.docs?.[0] || null
  const units = Math.max(1, Number(room?.units) || 1)
  const sellable = room ? websiteSellable(units) : 0
  const slugs = roomSlug ? [roomSlug] : []
  const closed = []
  const notes = []

  eachNight(start, end).forEach((night) => {
    const blocked = (blocks.docs || []).some((block) =>
      closureBlocksStay(block, { checkIn: night, checkOut: addDays(night, 1), roomSlugs: slugs }),
    )
    if (!roomSlug) {
      if (blocked) closed.push(night)
      return
    }
    const taken = (bookings.docs || []).filter((booking) => {
      return bookingUsesRoom(booking, roomSlug) && staysOverlap(booking.checkIn, booking.checkOut, night, addDays(night, 1))
    }).length
    if (blocked || taken >= sellable) closed.push(night)
  })

  ;(blocks.docs || []).forEach((block) => {
    if (closureBlocksStay(block, { checkIn: start, checkOut: end, roomSlugs: slugs })) {
      notes.push(guestClosureMessage(block))
    }
  })

  return {
    room: roomSlug || '',
    units,
    sellable,
    holdback: units > 1 ? 1 : 0,
    closed,
    notes: [...new Set(notes)],
  }
}

export async function findUnavailableStay(payload, { checkIn, checkOut, roomSlugs = [] }) {
  const closed = await findBlockingClosure(payload, { checkIn, checkOut, roomSlugs })
  if (closed) return guestClosureMessage(closed)

  for (const slug of roomSlugs) {
    const calendar = await buildRoomCalendar(payload, {
      roomSlug: slug,
      from: checkIn,
      to: checkOut,
    })
    const clash = eachNight(checkIn, checkOut).find((night) => calendar.closed.includes(night))
    if (clash) {
      return calendar.units > 1
        ? 'That room type is fully booked on those nights, or only the last room is left for the front desk.'
        : 'That room is already booked on those nights. Please choose other dates.'
    }
  }
  return null
}
