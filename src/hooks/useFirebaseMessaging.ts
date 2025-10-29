'use client'

import { useState, useEffect } from 'react'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/lib/firebase'

export function useFirebaseMessaging() {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if messaging is supported
    if (!messaging) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Request permission and get token
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission()
        setPermission(permission)

        if (permission === 'granted' && messaging) {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          })
          
          if (token) {
            setToken(token)
            console.log('FCM Token:', token)
            
            // Send token to server
            await fetch('/api/fcm-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token })
            })
          }
        }
      } catch (error) {
        console.error('Error getting FCM token:', error)
      }
    }

    requestPermission()

    // Listen for foreground messages
    const unsubscribe = messaging ? onMessage(messaging, (payload) => {
      console.log('Message received:', payload)
      
      // Show notification in foreground
      if (payload.notification) {
        new Notification(payload.notification.title || 'Rewards App', {
          body: payload.notification.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'rewards-notification',
          data: payload.data
        })
      }
    }) : null

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (!isSupported) return false

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting permission:', error)
      return false
    }
  }

  return {
    token,
    permission,
    isSupported,
    requestNotificationPermission
  }
}
