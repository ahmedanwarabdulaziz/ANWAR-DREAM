'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface BusinessItem { businessId: string; name: string; pointsLabel?: string; pointsLabelShort?: string }

export default function BusinessesSettingsPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [pointsLabel, setPointsLabel] = useState('')
  const [pointsLabelShort, setPointsLabelShort] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/businesses')
      .then(r => r.json())
      .then(d => setBusinesses(d.businesses || []))
  }, [])

  useEffect(() => {
    setMessage(null)
    const b = businesses.find(x => x.businessId === selectedId)
    if (b) {
      setPointsLabel(b.pointsLabel || `${b.name} Points`)
      setPointsLabelShort(b.pointsLabelShort || '')
    } else {
      setPointsLabel('')
      setPointsLabelShort('')
    }
  }, [selectedId, businesses])

  const save = async () => {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/businesses/${encodeURIComponent(selectedId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsLabel, pointsLabelShort }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      setMessage('Saved')
      // Update list entry
      setBusinesses(prev => prev.map(b => b.businessId === selectedId ? { ...b, pointsLabel: data.pointsLabel, pointsLabelShort: data.pointsLabelShort } : b))
    } catch (e: any) {
      setMessage(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-display text-h1 text-primary mb-2">Business Settings</h1>
        <p className="text-body text-gray600">Set custom points labels per business.</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <div className="flex gap-3 items-center">
          <label className="w-40 text-sm text-gray700">Business</label>
          <select className="border px-3 py-2 rounded flex-1" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">Select business</option>
            {businesses.map(b => (
              <option key={b.businessId} value={b.businessId}>{b.name}</option>
            ))}
          </select>
        </div>

        {selectedId && (
          <>
            <div className="flex gap-3 items-center">
              <label className="w-40 text-sm text-gray700">Points Label</label>
              <input className="border px-3 py-2 rounded flex-1" value={pointsLabel} onChange={e => setPointsLabel(e.target.value)} placeholder="e.g., One Points" />
            </div>
            <div className="flex gap-3 items-center">
              <label className="w-40 text-sm text-gray700">Short Label (optional)</label>
              <input className="border px-3 py-2 rounded flex-1" value={pointsLabelShort} onChange={e => setPointsLabelShort(e.target.value)} placeholder="e.g., ONE" />
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-40" />
              <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              {message && <span className="text-sm text-gray600">{message}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


