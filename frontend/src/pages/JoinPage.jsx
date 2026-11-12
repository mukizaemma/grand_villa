import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CMS_URL } from '@lib/apiClient'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import styles from '@features/staff/pages/StaffLoginPage.module.css'

export default function JoinPage() {
  const navigate = useNavigate()
  const { data } = useSiteLayout()
  const brand = brandFromCompany(data?.company)
  const [open, setOpen] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = `Create an account — ${brand.shortName}`
    applyCompanyFavicon(brand.logo)
    fetch(`${CMS_URL}/api/globals/handover-settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setOpen(body ? body.available !== false : true))
      .catch(() => setOpen(true))
  }, [brand.logo, brand.shortName])

  function setField(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`${CMS_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.errors?.[0]?.message || 'Could not create that account.')
      navigate('/staff/login', { replace: true, state: { joined: form.email } })
    } catch (err) {
      setError(err.message || 'Could not create that account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <Link to="/handover/accounts" className={styles.back}>
        ← Handover guide
      </Link>
      <form className={styles.card} onSubmit={onSubmit}>
        {brand.logo ? <img className={styles.logo} src={brand.logo} alt={brand.name} /> : null}
        <h1>Create an account</h1>
        {open === false ? (
          <p>New accounts are closed while the handover guide is unavailable.</p>
        ) : (
          <>
            <p>This creates a system user for the staff desk. Admin access is granted later by the super admin.</p>
            <label>
              First name
              <input value={form.firstName} onChange={setField('firstName')} required />
            </label>
            <label>
              Last name
              <input value={form.lastName} onChange={setField('lastName')} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={setField('email')} required />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={setField('password')} minLength={8} required />
            </label>
            <label>
              Confirm password
              <input type="password" value={form.confirm} onChange={setField('confirm')} minLength={8} required />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={busy || open === null}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </>
        )}
        <Link to="/staff/login" className={styles.forgot}>
          Already have an account? Sign in
        </Link>
      </form>
      <p className={styles.credit}>
        Developed by{' '}
        <a href="https://iremetech.com" target="_blank" rel="noopener noreferrer">
          Ireme Tech
        </a>
      </p>
    </div>
  )
}
