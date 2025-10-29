// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyCxgAb3jpB35mDAXcbifMJHq9FxaHhYu5U",
  authDomain: "cadeala-cd61d.firebaseapp.com",
  projectId: "cadeala-cd61d",
  storageBucket: "cadeala-cd61d.firebasestorage.app",
  messagingSenderId: "202865893881",
  appId: "1:202865893881:web:85f345c1e8d1d246459d28"
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)
  
  const notificationTitle = payload.notification?.title || 'Rewards App'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'rewards-notification',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  // Handle deep linking based on notification data
  const data = event.notification.data
  let url = '/'
  
  if (data?.type === 'reward') {
    url = `/rewards/${data.rewardId}`
  } else if (data?.type === 'transaction') {
    url = `/wallet`
  } else if (data?.type === 'program') {
    url = `/programs/${data.programId}`
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      if (clientList.length > 0) {
        const client = clientList[0]
        client.focus()
        client.navigate(url)
        return
      }
      
      // If app is not open, open it
      return clients.openWindow(url)
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
})

