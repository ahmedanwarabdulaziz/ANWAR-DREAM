'use client'

import React, { useEffect, useState } from 'react'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { BusinessService } from '@/lib/businessService'
import { CustomerClassService } from '@/lib/customerClassService'
import { Button } from '@/components/ui/Button'
import { CustomerClass } from '@/lib/types/customerClass'

export default function BusinessSettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [businessId, setBusinessId] = useState<string>('')
  const [businessName, setBusinessName] = useState<string>('')
  const [pointsLabel, setPointsLabel] = useState<string>('')
  const [pointsLabelShort, setPointsLabelShort] = useState<string>('')
  const [defaultReferralRouting, setDefaultReferralRouting] = useState<'referral_class' | 'referrer_class' | 'custom'>('referral_class')
  const [customReferralClassId, setCustomReferralClassId] = useState<string>('')
  const [availableClasses, setAvailableClasses] = useState<CustomerClass[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return }
      const data = await AuthService.getCurrentUserData()
      setUserData(data)
      if (data) {
        const biz = await BusinessService.getBusinessByOwner(data.userId)
        if (biz) {
          setBusinessId(biz.businessId)
          setBusinessName(biz.name)
          const label = (biz as any).pointsLabel as string | undefined
          setPointsLabel(label || `${biz.name} Points`)
          setPointsLabelShort(((biz as any).pointsLabelShort as string | undefined) || '')
          
          // Load referral routing settings
          setDefaultReferralRouting(biz.settings.defaultReferralRouting || 'referral_class')
          setCustomReferralClassId(biz.settings.customReferralClassId || '')
          
          // Load available classes for custom referral routing
          const classes = await CustomerClassService.getBusinessClasses(biz.businessId, true, false)
          setAvailableClasses(classes)
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const save = async () => {
    if (!businessId) return
    setSaving(true)
    setMessage(null)
    try {
      // Save points labels via API
      const res = await fetch(`/api/admin/businesses/${encodeURIComponent(businessId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsLabel, pointsLabelShort }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      
      // Save referral routing settings
      const settingsToUpdate: any = {
        defaultReferralRouting
      }
      
      // Only include customReferralClassId if routing is 'custom' and value is provided
      if (defaultReferralRouting === 'custom' && customReferralClassId) {
        settingsToUpdate.customReferralClassId = customReferralClassId
      }
      
      await BusinessService.updateBusinessSettings(businessId, settingsToUpdate)
      
      setMessage('Settings saved successfully')
      setTimeout(() => setMessage(null), 3000)
    } catch (e: any) {
      setMessage(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userData || !businessId) {
    return (
      <div className="p-4 text-gray600">No business found for your account.</div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-display text-h1 text-primary mb-2">Settings</h1>
        <p className="text-body text-gray600">Update labels and preferences for {businessName}.</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Points Labels Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
          <h2 className="text-h2 text-primary mb-4">Points Labels</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray700 mb-2">Points Label</label>
              <input 
                className="w-full border border-gray200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                value={pointsLabel} 
                onChange={e => setPointsLabel(e.target.value)} 
                placeholder="e.g., One Points" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray700 mb-2">Short Label (optional)</label>
              <input 
                className="w-full border border-gray200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                value={pointsLabelShort} 
                onChange={e => setPointsLabelShort(e.target.value)} 
                placeholder="e.g., ONE" 
              />
            </div>
          </div>
        </div>

        {/* Referral Routing Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
          <h2 className="text-h2 text-primary mb-2">Referral Routing</h2>
          <p className="text-sm text-gray600 mb-6">
            Configure where referred customers are assigned when they sign up through a referral link
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray700 mb-2">
                Default Referral Routing
              </label>
              <select
                value={defaultReferralRouting}
                onChange={(e) => setDefaultReferralRouting(e.target.value as 'referral_class' | 'referrer_class' | 'custom')}
                className="w-full border border-gray200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="referral_class">Referral Customers Class</option>
                <option value="referrer_class">Same Class as Referrer</option>
                <option value="custom">Custom Class</option>
              </select>
              <p className="mt-2 text-xs text-gray600">
                {defaultReferralRouting === 'referral_class' && 
                  'Referred customers will be assigned to the "Referral Customers" permanent class'}
                {defaultReferralRouting === 'referrer_class' && 
                  'Referred customers will be assigned to the same class as the person who referred them'}
                {defaultReferralRouting === 'custom' && 
                  'Referred customers will be assigned to a custom class of your choice'}
              </p>
            </div>

            {defaultReferralRouting === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray700 mb-2">
                  Custom Referral Class
                </label>
                <select
                  value={customReferralClassId}
                  onChange={(e) => setCustomReferralClassId(e.target.value)}
                  className="w-full border border-gray200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="">Select a class...</option>
                  {availableClasses.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.name} {cls.type === 'permanent' && '(Permanent)'}
                    </option>
                  ))}
                </select>
                {!customReferralClassId && (
                  <p className="mt-2 text-xs text-error">
                    Please select a class for custom referral routing
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || (defaultReferralRouting === 'custom' && !customReferralClassId)}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          {message && (
            <span className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-error'}`}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


