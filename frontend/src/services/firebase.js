import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return null;
  }

  try {
    // Explicitly register the service worker
    const swUrl = new URL("/firebase-messaging-sw.js", window.location.origin);
    swUrl.searchParams.set(
      "apiKey",
      import.meta.env.VITE_FIREBASE_API_KEY || "",
    );
    swUrl.searchParams.set(
      "authDomain",
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    );
    swUrl.searchParams.set(
      "projectId",
      import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    );
    swUrl.searchParams.set(
      "storageBucket",
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    );
    swUrl.searchParams.set(
      "messagingSenderId",
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    );
    swUrl.searchParams.set("appId", import.meta.env.VITE_FIREBASE_APP_ID || "");

    const registration = await navigator.serviceWorker.register(
      swUrl.toString(),
      {
        scope: "/",
      },
    );
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error(
        "VITE_FIREBASE_VAPID_KEY is missing from environment variables!",
      );
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn(
        "No registration token available. Request permission to generate one.",
      );
      // This can happen if the user denies permission after the prompt but before token generation
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", {
      code: err.code,
      message: err.message,
      stack: err.stack,
    });

    if (err.code === "messaging/permission-blocked") {
      console.error("Notification permission was blocked by the browser.");
    } else if (err.code === "messaging/invalid-vapid-key") {
      console.error(
        "The provided VAPID key is invalid. Please verify VITE_FIREBASE_VAPID_KEY in your .env file.",
      );
    } else if (err.code === "messaging/failed-serviceworker-registration") {
      console.error(
        "Service worker registration failed. Check if firebase-messaging-sw.js exists in the public directory.",
      );
    }
    return null;
  }
};

export const onMessageListener = (callback) => onMessage(messaging, callback);
