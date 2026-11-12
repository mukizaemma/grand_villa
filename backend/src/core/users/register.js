import { APIError } from 'payload'
import { assertPublicFormRateLimit } from '../security/rateLimit.js'
import { isSuperAdmin, SUPER_ADMIN_EMAIL } from '../security/roles.js'

function errorMessage(error, fallback) {
  return error?.data?.errors?.[0]?.message || error?.message || fallback
}

export async function registerUserHandler(req) {
  if (!assertPublicFormRateLimit(req)) {
    return Response.json({ errors: [{ message: 'Please wait a few minutes and try again.' }] }, { status: 429 })
  }

  let body = {}
  try {
    body = (await req.json()) || {}
  } catch {
    body = {}
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const firstName = String(body.firstName || '').trim()
  const lastName = String(body.lastName || '').trim()

  if (!firstName || !email || !password) {
    return Response.json({ errors: [{ message: 'First name, email, and password are required.' }] }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ errors: [{ message: 'Enter a valid email address.' }] }, { status: 400 })
  }
  if (password.length < 8) {
    return Response.json({ errors: [{ message: 'Use at least 8 characters for the password.' }] }, { status: 400 })
  }
  if (email === SUPER_ADMIN_EMAIL) {
    return Response.json({ errors: [{ message: 'This email cannot be registered from the public page.' }] }, { status: 400 })
  }

  let settings = { available: true }
  try {
    settings = await req.payload.findGlobal({
      slug: 'handover-settings',
      overrideAccess: true,
      req,
    })
  } catch {
    settings = { available: true }
  }
  if (settings?.available === false) {
    return Response.json(
      { errors: [{ message: 'New accounts are closed while the handover guide is unavailable.' }] },
      { status: 403 },
    )
  }

  try {
    await req.payload.create({
      collection: 'users',
      data: {
        email,
        password,
        firstName,
        lastName,
        role: 'editor',
        status: 'active',
      },
      overrideAccess: true,
      req,
    })
  } catch (error) {
    if (error instanceof APIError && error.status) {
      return Response.json({ errors: [{ message: errorMessage(error, 'Could not create that account.') }] }, { status: error.status })
    }
    const message = errorMessage(error, 'Could not create that account.')
    const duplicate = /already|duplicate|unique|registered/i.test(message)
    return Response.json(
      { errors: [{ message: duplicate ? 'An account with that email already exists.' : message }] },
      { status: 400 },
    )
  }

  return Response.json({
    ok: true,
    email,
    message: 'Account created. Sign in on the staff desk. Admin access is granted only by the super admin.',
  })
}

export async function forceLogoutHandler(req) {
  if (!isSuperAdmin(req.user)) {
    return Response.json({ errors: [{ message: 'Only the super admin can force a logout.' }] }, { status: 403 })
  }
  let body = {}
  try {
    body = (await req.json()) || {}
  } catch {
    body = {}
  }
  const id = body.id
  if (!id) {
    return Response.json({ errors: [{ message: 'Choose a user to sign out.' }] }, { status: 400 })
  }
  const { clearUserSessions } = await import('./sessions.js')
  const cleared = await clearUserSessions(req, id)
  if (!cleared) {
    return Response.json({ errors: [{ message: 'That user was not found.' }] }, { status: 404 })
  }
  return Response.json({ ok: true })
}
