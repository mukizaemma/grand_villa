import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CMS_URL } from '@lib/apiClient'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import SiteAuditBoard from '@features/handover/SiteAuditBoard'
import { HANDOVER_SECTIONS, HANDOVER_TABS } from '@features/handover/guide'
import { getStaffToken, staffClient } from '@features/staff/api/staffClient'
import { isSuperAdmin } from '@features/staff/auth/roles'
import styles from './HandoverPage.module.css'

const SECTIONS = HANDOVER_TABS.map((tab) => tab.id)

async function readJson(path) {
  const res = await fetch(`${CMS_URL}${path}`)
  if (!res.ok) throw new Error('request failed')
  return res.json()
}

export default function HandoverPage() {
  const { section: sectionId } = useParams()
  const navigate = useNavigate()
  const tab = HANDOVER_SECTIONS[sectionId] ? sectionId : ''
  const [report, setReport] = useState(null)
  const [hosting, setHosting] = useState(null)
  const [hostingFailed, setHostingFailed] = useState(false)
  const [origin, setOrigin] = useState('')
  const [available, setAvailable] = useState(true)
  const [gateReady, setGateReady] = useState(false)
  const [viewer, setViewer] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', section: 'overview', message: '' })
  const [busy, setBusy] = useState(false)
  const { data: layout } = useSiteLayout()
  const brand = brandFromCompany(layout?.company)
  const company = layout?.company
  const superAdmin = isSuperAdmin(viewer)

  const index = Math.max(0, HANDOVER_TABS.findIndex((item) => item.id === tab))
  const section = HANDOVER_SECTIONS[tab] || HANDOVER_SECTIONS.overview
  const previous = index > 0 ? HANDOVER_TABS[index - 1] : null
  const next = index < HANDOVER_TABS.length - 1 ? HANDOVER_TABS[index + 1] : null
  const adminUrl = `${CMS_URL}/admin`
  const closed = gateReady && available === false && !superAdmin

  useEffect(() => {
    if (sectionId && HANDOVER_SECTIONS[sectionId]) return
    navigate('/handover/overview', { replace: true })
  }, [navigate, sectionId])

  useEffect(() => {
    setOrigin(window.location.origin)
    readJson('/api/globals/handover-settings')
      .then((data) => setAvailable(data?.available !== false))
      .catch(() => setAvailable(true))
      .finally(() => setGateReady(true))
    if (!getStaffToken()) return
    staffClient
      .get('/api/users/me')
      .then((res) => setViewer(res.data?.user || null))
      .catch(() => setViewer(null))
  }, [])

  useEffect(() => {
    if (!tab || tab !== 'audit') return
    readJson('/api/site-audit/report').then(setReport).catch(() => {})
  }, [tab])

  useEffect(() => {
    if (!tab || tab !== 'hosting') return
    readJson('/api/hosting-invoices/summary')
      .then((data) => {
        setHosting(data)
        setHostingFailed(false)
      })
      .catch(() => setHostingFailed(true))
  }, [tab])

  useEffect(() => {
    document.title = `Handover — ${brand.name}`
    applyCompanyFavicon(brand.logo)
  }, [brand.logo, brand.name])

  useEffect(() => {
    if (tab) setForm((current) => ({ ...current, section: tab }))
  }, [tab])

  const credentials = useMemo(
    () => [
      { label: 'Public website', value: origin || '/', href: '/' },
      { label: 'Staff desk', value: origin ? `${origin}/staff` : '/staff', href: '/staff' },
      { label: 'Create an account', value: origin ? `${origin}/join` : '/join', href: '/join' },
      { label: 'Admin', value: adminUrl, href: adminUrl },
      { label: 'Login email', value: company?.email || 'The email on your system account' },
      { label: 'Password', value: 'Not shown here. Use Forgot password if you need a new one.' },
    ],
    [adminUrl, company?.email, origin],
  )

  async function sendFeedback(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const res = await fetch(`${CMS_URL}/api/handover-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('Thank you — your note was sent.')
      setForm({ name: '', email: '', section: tab, message: '' })
    } catch {
      toast.error('Could not send that note. Try again in a few minutes.')
    } finally {
      setBusy(false)
    }
  }

  if (!gateReady) {
    return <div className={styles.closed}>Loading the handover guide…</div>
  }

  if (closed) {
    return (
      <div className={styles.closed}>
        <p className={styles.kicker}>Handover guide</p>
        <h1>This guide is unavailable</h1>
        <p>The handover guide has been turned off. New system accounts cannot be created while it is unavailable.</p>
        <Link to="/">Back to the website</Link>
      </div>
    )
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          {brand.logo ? <img src={brand.logo} alt="" /> : null}
          <div>
            <strong>{brand.shortName}</strong>
            <small>Handover guide</small>
          </div>
        </Link>
        <nav>
          {HANDOVER_TABS.map((item) => (
            <Link key={item.id} to={`/handover/${item.id}`} className={tab === item.id ? styles.active : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className={styles.back}>
          ← Back to website
        </Link>
        <p className={styles.credit}>
          Developed by{' '}
          <a href="https://iremetech.com" target="_blank" rel="noopener noreferrer">
            Ireme Tech
          </a>
        </p>
      </aside>

      <main className={styles.main}>
        {available === false && superAdmin ? (
          <p className={styles.notice}>
            This guide is hidden from the public, and /join is not accepting new accounts. You can still read it
            because you are the super admin.
          </p>
        ) : null}
        <p className={styles.kicker}>
          Page {index + 1} of {HANDOVER_TABS.length}
        </p>
        <h1>{section.title}</h1>
        <p className={styles.lead}>{section.lead}</p>

        {tab === 'access' && (
          <div className={styles.creds}>
            {credentials.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                {row.href ? (
                  <a href={row.href} target={row.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {row.value}
                  </a>
                ) : (
                  <strong>{row.value}</strong>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'accounts' && (
          <p className={styles.card}>
            <Link to="/join">Open the account page (/join)</Link>
          </p>
        )}

        {section.blocks.map((block) => (
          <section key={block.heading} className={styles.card}>
            <h2>{block.heading}</h2>
            <p>{block.body}</p>
          </section>
        ))}

        {tab === 'hosting' && <HostingCard hosting={hosting} failed={hostingFailed} />}

        {tab === 'audit' && <SiteAuditBoard report={report} />}

        {tab === 'feedback' && (
          <form className={styles.form} onSubmit={sendFeedback}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              About
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                {SECTIONS.map((id) => (
                  <option key={id} value={id}>
                    {HANDOVER_TABS.find((item) => item.id === id)?.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.full}>
              What should we change or improve?
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}

        <div className={styles.pager}>
          {previous ? (
            <Link to={`/handover/${previous.id}`}>← {previous.label}</Link>
          ) : (
            <span />
          )}
          {next ? <Link to={`/handover/${next.id}`}>{next.label} →</Link> : <span />}
        </div>
      </main>
    </div>
  )
}

function statusClass(status, styles) {
  if (status === 'active') return styles.statusActive
  if (status === 'expiring-soon') return styles.statusSoon
  return styles.statusExpired
}

function HostingCard({ hosting, failed }) {
  if (!hosting) {
    return (
      <section className={styles.card}>
        <h2>Current status</h2>
        <p>{failed ? 'The invoice status will show here once the server is available.' : 'Loading the hosting invoice…'}</p>
      </section>
    )
  }
  return (
    <section className={styles.card}>
      <h2>Current status</h2>
      <p className={`${styles.status} ${statusClass(hosting.status, styles)}`}>{hosting.statusLabel}</p>
      <p>
        Domain on {hosting.registrar}. Hosting on {hosting.host}. ${hosting.annualFee} due {hosting.renewalLabel} each
        year. This period runs until {hosting.periodEndLabel}.
      </p>
    </section>
  )
}
