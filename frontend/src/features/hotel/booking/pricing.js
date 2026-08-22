/**
 * rooms: cart rooms [{ pricePerNight, ... }]
 * nights: number of nights (0 if dates aren't set yet)
 * experiences: cart experiences [{ price, ... }] — flat, one-time, not multiplied by nights
 */
export function calcEstimatedTotal(rooms, nights, experiences = []) {
  const roomsPerNightSubtotal = rooms.reduce((sum, r) => sum + r.pricePerNight, 0);
  const experiencesSubtotal = experiences.reduce((sum, e) => sum + e.price, 0);
  // Dates not set yet — show the per-night rate as-is rather than $0,
  // so the number on screen still means something before Step 1 is filled in.
  const roomsTotal = nights > 0 ? roomsPerNightSubtotal * nights : roomsPerNightSubtotal;
  return roomsTotal + experiencesSubtotal;
}