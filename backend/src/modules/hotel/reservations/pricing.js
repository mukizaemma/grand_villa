/**
 * Shared stay-pricing math for Grand Villa bookings.
 * The public site displays USD; the server overwrites client-supplied totals
 * so Stripe/MoMo cannot be charged a forged amount.
 */
export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const diffMs = new Date(checkOut) - new Date(checkIn)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function calcStayTotal(rooms, nights, experiences = []) {
  const roomsTotal = rooms.reduce((sum, room) => sum + Number(room.pricePerNight || 0) * nights, 0)
  const experiencesTotal = experiences.reduce((sum, item) => sum + Number(item.price || 0), 0)
  return roomsTotal + experiencesTotal
}
