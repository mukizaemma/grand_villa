import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND } from '@features/hotel/brand'
import { useStaffAuth } from '../auth/StaffAuthContext'
import styles from './StaffLoginPage.module.css'

export default function StaffLoginPage() {
  const { user, ready, login } = useStaffAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = `Staff sign in — ${BRAND.shortName}`
    if (ready && user) navigate('/staff', { replace: true })
  }, [ready, user, navigate])

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/staff', { replace: true })
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.message || 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.back}>
        ← Back to home
      </Link>
      <form className={styles.card} onSubmit={onSubmit}>
        <img className={styles.logo} src={BRAND.logo} alt={BRAND.name} />
        <h1>{BRAND.shortName}</h1>
        <p>Sign in with your property admin account.</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <Link to="/staff/forgot" className={styles.forgot}>
          Forgot password?
        </Link>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Login'}
        </button>
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
