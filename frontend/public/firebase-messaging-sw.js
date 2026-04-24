/* global importScripts, firebase */

// Scripts for firebase and firebase-messaging
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

const params = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: params.get("apiKey") || "",
  authDomain: params.get("authDomain") || "",
  projectId: params.get("projectId") || "",
  storageBucket: params.get("storageBucket") || "",
  messagingSenderId: params.get("messagingSenderId") || "",
  appId: params.get("appId") || "",
};

if (!firebaseConfig.apiKey) {
  console.warn(
    "[firebase-sw] Missing Firebase config; background messaging disabled.",
  );
} else {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.apps.length ? firebase.messaging() : null;

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload,
    );

    // We now use data-only messages for 100% control over display and
    // to prevent the browser from showing its own "automatic" notification.
    const data = payload.data || {};
    const title = data.title || "New Notification";
    const body = data.body || "";

    // Ensure icon URL is absolute so it shows up on mobile
    const iconPath = data.icon || data.image || "/favicon.png";
    const absoluteIcon = iconPath.startsWith("http")
      ? iconPath
      : `${self.location.origin}${iconPath}`;

    const notificationOptions = {
      body: body,
      icon: absoluteIcon,
      badge: absoluteIcon, // small icon in status bar on Android
      data: data,
      tag: "clashcode-notif", // Collapses rapid notifications
      renotify: true, // Vibrate/sound again even if tag is same
    };

    self.registration.showNotification(title, notificationOptions);
  });
}
