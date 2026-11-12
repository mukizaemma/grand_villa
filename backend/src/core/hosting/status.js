const FEE = 70
const RENEWAL_MONTH = 10
const RENEWAL_DAY = 25
const START_YEAR = 2026

export const HOSTING_FACTS = {
  registrar: 'Namecheap',
  host: 'DigitalOcean',
  annualFee: FEE,
  renewalLabel: '25 October',
}

function kigaliParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const read = (type) => Number(parts.find((part) => part.type === type)?.value)
  return { year: read('year'), month: read('month'), day: read('day') }
}

export function governingYear(date = new Date()) {
  const { year, month, day } = kigaliParts(date)
  const onOrAfterRenewal = month > RENEWAL_MONTH || (month === RENEWAL_MONTH && day >= RENEWAL_DAY)
  return onOrAfterRenewal ? year : year - 1
}

function utcDay(year, month, day) {
  return Date.UTC(year, month - 1, day)
}

export function describeHosting(invoices, date = new Date()) {
  const today = kigaliParts(date)
  const year = governingYear(date)
  const invoice = (invoices || []).find((item) => Number(item.year) === year) || null
  const periodEnd = { year: year + 1, month: RENEWAL_MONTH, day: RENEWAL_DAY }
  const daysLeft = Math.round(
    (utcDay(periodEnd.year, periodEnd.month, periodEnd.day) - utcDay(today.year, today.month, today.day)) / 86400000,
  )
  const payment = invoice?.payment || 'unpaid'
  let status = 'unpaid'

  if (payment === 'suspended') status = 'suspended'
  else if (payment === 'paid') status = daysLeft <= 30 ? (daysLeft <= 0 ? 'expired' : 'expiring-soon') : 'active'
  else status = 'expired'

  const labels = {
    active: 'Active',
    'expiring-soon': 'Expiring soon',
    expired: 'Expired',
    unpaid: 'Not paid',
    suspended: 'Suspended',
  }

  return {
    ...HOSTING_FACTS,
    status,
    statusLabel: labels[status],
    daysLeft,
    governingYear: year,
    periodEnd: `${periodEnd.year}-10-25`,
    periodEndLabel: `25 October ${periodEnd.year}`,
    invoice: invoice
      ? {
          id: invoice.id,
          year: Number(invoice.year),
          amount: Number(invoice.amount || FEE),
          payment,
          dueDate: invoice.dueDate || `${year}-10-25`,
        }
      : null,
  }
}

export function invoicesToEnsure(existingYears, date = new Date()) {
  const have = new Set((existingYears || []).map((year) => Number(year)))
  const last = governingYear(date) + 1
  const missing = []
  for (let year = START_YEAR; year <= last; year += 1) {
    if (!have.has(year)) missing.push(year)
  }
  return missing
}

export function newInvoiceData(year) {
  return {
    year,
    amount: FEE,
    dueDate: new Date(Date.UTC(year, RENEWAL_MONTH - 1, RENEWAL_DAY)).toISOString(),
    payment: year === START_YEAR ? 'paid' : 'unpaid',
  }
}
