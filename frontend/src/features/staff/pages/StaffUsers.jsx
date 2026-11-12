import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import { useStaffAuth } from '../auth/StaffAuthContext'
import { isSuperAdmin } from '../auth/roles'
import '../staff.css'

const PAYMENTS = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Not paid' },
  { value: 'suspended', label: 'Suspended' },
]

function apiError(error, fallback) {
  return error.response?.data?.errors?.[0]?.message || fallback
}

function personName(account) {
  return [account.firstName, account.lastName].filter(Boolean).join(' ') || account.email
}

export default function StaffUsers() {
  const { user } = useStaffAuth()
  const [accounts, setAccounts] = useState([])
  const [available, setAvailable] = useState(true)
  const [hosting, setHosting] = useState(null)
  const [origin, setOrigin] = useState('')
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const [people, guide, summary] = await Promise.all([
      staffClient.get('/api/users?limit=100&depth=0&sort=email'),
      staffClient.get('/api/globals/handover-settings'),
      staffClient.get('/api/hosting-invoices/summary'),
    ])
    setAccounts(people.data?.docs || [])
    setAvailable(guide.data?.available !== false)
    setHosting(summary.data)
  }, [])

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!user || !isSuperAdmin(user)) return
    load()
      .catch((error) => toast.error(apiError(error, 'Could not load users.')))
      .finally(() => setLoaded(true))
  }, [load, user])

  if (user && !isSuperAdmin(user)) return <Navigate to="/staff" replace />
  if (!loaded) return <p>Loading…</p>

  async function saveGuide(next) {
    setAvailable(next)
    try {
      await staffClient.post('/api/globals/handover-settings', { available: next })
      toast.success(next ? 'Handover guide is public.' : 'Handover guide is unavailable.')
    } catch (error) {
      setAvailable(!next)
      toast.error(apiError(error, 'Could not update the handover guide.'))
    }
  }

  async function patchUser(account, data, success) {
    try {
      await staffClient.patch(`/api/users/${account.id}`, data)
      toast.success(success)
      await load()
    } catch (error) {
      toast.error(apiError(error, 'Could not update that user.'))
    }
  }

  async function forceLogout(account) {
    if (!window.confirm(`Sign ${personName(account)} out of every device?`)) return
    try {
      await staffClient.post('/api/users/force-logout', { id: account.id })
      toast.success('That user was signed out.')
    } catch (error) {
      toast.error(apiError(error, 'Could not sign that user out.'))
    }
  }

  async function removeUser(account) {
    if (!window.confirm(`Delete ${personName(account)}? This cannot be undone.`)) return
    try {
      await staffClient.delete(`/api/users/${account.id}`)
      toast.success('User deleted.')
      await load()
    } catch (error) {
      toast.error(apiError(error, 'Could not delete that user.'))
    }
  }

  async function savePayment(invoice, payment) {
    try {
      await staffClient.patch(`/api/hosting-invoices/${invoice.id}`, { payment })
      toast.success(`Invoice ${invoice.year} marked ${PAYMENTS.find((item) => item.value === payment)?.label || payment}.`)
      await load()
    } catch (error) {
      toast.error(apiError(error, 'Could not update that invoice.'))
    }
  }

  return (
    <div className="staffPage">
      <h1>Users</h1>
      <p className="staffLead">
        You are the only account that can grant admin access, delete a user, force a logout, or block a login. Other
        users can edit the website, but not Site setting or this page.
      </p>

      <section className="staffCard" style={{ padding: '1.1rem', marginBottom: '1rem' }}>
        <h2>Handover guide</h2>
        <label className="staffCheck">
          <input type="checkbox" checked={available} onChange={(event) => saveGuide(event.target.checked)} />
          Available to the public
        </label>
        <p className="staffLead">
          While this is on, anyone can open the guide and create an account. While it is off, the guide says it is
          unavailable and /join will not create users.
        </p>
        <p>
          <Link to="/handover/overview">Guide</Link>
          {' · '}
          <Link to="/join">Create account</Link>
          {origin ? (
            <>
              {' · '}
              <span>
                {origin}/join
              </span>
            </>
          ) : null}
        </p>
      </section>

      <section className="staffCard" style={{ marginBottom: '1rem' }}>
        <table className="staffTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Login</th>
              <th>Last sign-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const locked = isSuperAdmin(account)
              return (
                <tr key={account.id}>
                  <td>
                    <strong>{personName(account)}</strong>
                    <div>{account.email}</div>
                  </td>
                  <td>{locked ? 'Super admin' : account.role === 'admin' ? 'Admin' : 'Editor'}</td>
                  <td>{account.status === 'inactive' ? 'Blocked' : 'Allowed'}</td>
                  <td>{account.lastLogin ? new Date(account.lastLogin).toLocaleString() : '—'}</td>
                  <td>
                    {locked ? (
                      <span>Protected</span>
                    ) : (
                      <div className="userActions">
                        <button
                          type="button"
                          className="staffBtn staffBtnGhost"
                          onClick={() =>
                            patchUser(
                              account,
                              { role: account.role === 'admin' ? 'editor' : 'admin' },
                              account.role === 'admin' ? 'Admin access removed.' : 'Admin access granted.',
                            )
                          }
                        >
                          {account.role === 'admin' ? 'Remove admin' : 'Grant admin'}
                        </button>
                        <button
                          type="button"
                          className="staffBtn staffBtnGhost"
                          onClick={() =>
                            patchUser(
                              account,
                              { status: account.status === 'inactive' ? 'active' : 'inactive' },
                              account.status === 'inactive' ? 'Login allowed.' : 'Login blocked.',
                            )
                          }
                        >
                          {account.status === 'inactive' ? 'Allow login' : 'Block login'}
                        </button>
                        <button type="button" className="staffBtn staffBtnGhost" onClick={() => forceLogout(account)}>
                          Force logout
                        </button>
                        <button type="button" className="staffBtn staffBtnDanger" onClick={() => removeUser(account)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="staffCard" style={{ padding: '1.1rem' }}>
        <h2>Hosting</h2>
        <p className="staffLead">
          Domain on Namecheap. Hosting on DigitalOcean. $70 due every 25 October.
          {hosting?.statusLabel ? ` Current status: ${hosting.statusLabel}.` : ''}
          {hosting?.periodEndLabel ? ` This period runs until ${hosting.periodEndLabel}.` : ''}
        </p>
        <table className="staffTable">
          <thead>
            <tr>
              <th>Year</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {(hosting?.invoices || []).map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.year}</td>
                <td>25 October {invoice.year}</td>
                <td>${invoice.amount}</td>
                <td>
                  <select value={invoice.payment} onChange={(event) => savePayment(invoice, event.target.value)}>
                    {PAYMENTS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
