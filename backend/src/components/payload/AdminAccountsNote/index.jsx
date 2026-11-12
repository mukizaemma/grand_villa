import React from 'react'

export function AdminAccountsNote() {
  return (
    <div
      style={{
        padding: '1rem 1.15rem',
        background: '#f3ecdd',
        border: '1px solid #d8cdbe',
        borderRadius: 8,
        color: '#2b2b28',
        lineHeight: 1.5,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 6 }}>Users</strong>
      Only admin@iremetech.com can open Users, grant admin access, delete an account, force a
      logout, or block a login. Everyone else manages website content from the staff desk.
      New people register at the public /join page while the handover guide is available.
    </div>
  )
}
