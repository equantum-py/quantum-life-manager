import { supabase } from '../lib/supabaseClient';

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase no está configurado");
  }
  return supabase;
}

// Convert urlB64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushService = {
  isPushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  async registerServiceWorker() {
    if (!this.isPushSupported()) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (err) {
      console.error('Error registering service worker:', err);
      return null;
    }
  },

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    return permission;
  },

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported()) return null;
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  },

  async subscribeToPush() {
    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VITE_VAPID_PUBLIC_KEY no está configurada.');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    return subscription;
  },

  async savePushSubscription(userId: string, subscription: PushSubscription) {
    const client = getSupabaseClient();
    const subJson = subscription.toJSON();
    
    if (!subJson.endpoint || !subJson.keys) {
      throw new Error("Suscripción inválida");
    }

    const payload = {
      user_id: userId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
      user_agent: navigator.userAgent,
      device_label: 'Web Browser',
      is_active: true
    };

    // Upsert logic if endpoint exists
    const { error } = await client
      .from('push_subscriptions')
      .upsert(payload, { onConflict: 'endpoint' });

    if (error) {
      console.error('Error saving subscription to Supabase:', error);
      throw error;
    }
  }
};
