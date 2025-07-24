importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRN-RWBDzQhkBwQKOyoYm6YGaoMvJ_Qd4",
  authDomain: "bankroll-2ccb4.firebaseapp.com",
  projectId: "bankroll-2ccb4",
  storageBucket: "bankroll-2ccb4.appspot.com",
  messagingSenderId: "1098127562329",
  appId: "1:1098127562329:web:e5c9a2b85c8c8e6c4c9c8c"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/BankrollLogoTransparent.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
