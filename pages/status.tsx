// pages/status.tsx
import React from 'react'

export default function StatusPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Status Page</h1>
      <p><strong>Environment:</strong> {process.env.NEXT_PUBLIC_ENV_NAME}</p>
      <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_API_KEY}</p>
    </div>
  )
}