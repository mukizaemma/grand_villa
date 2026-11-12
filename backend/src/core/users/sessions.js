export async function clearUserSessions(req, id) {
  const userWithSessions = await req.payload.db.findOne({
    collection: 'users',
    req,
    where: {
      id: { equals: id },
    },
  })
  if (!userWithSessions) return false
  userWithSessions.sessions = []
  userWithSessions.updatedAt = null
  await req.payload.db.updateOne({
    id: userWithSessions.id,
    collection: 'users',
    data: userWithSessions,
    req,
    returning: false,
  })
  return true
}
