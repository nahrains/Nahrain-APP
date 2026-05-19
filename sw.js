importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const CACHE_NAME = 'nahrain-student-v2.4';
const ASSETS = [
    './index.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

const BYPASS_HOSTS = [
    'firebaseio.com','googleapis.com','gstatic.com',
    'firebaseapp.com','firebasestorage.app',
    'firebasestorage.googleapis.com','identitytoolkit.googleapis.com',
    'cdn.jsdelivr.net','cdnjs.cloudflare.com',
    'fonts.googleapis.com','fonts.gstatic.com',
];

function shouldBypass(url) {
    try { const h=new URL(url).hostname; return BYPASS_HOSTS.some(d=>h===d||h.endsWith('.'+d)); }
    catch{return true;}
}

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(Promise.all([
        self.clients.claim(),
        caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
    ]));
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    if (shouldBypass(e.request.url)) return;
    e.respondWith(
        fetch(e.request).then(res=>{ caches.open(CACHE_NAME).then(c=>c.put(e.request,res.clone())); return res; })
        .catch(()=>caches.match(e.request))
    );
});

// ══ FCM Background Messages ══
firebase.initializeApp({
    apiKey:"AIzaSyBWtURZAw5Kja8S6bHuQyimuhMMX4fZOco",
    authDomain:"al-nahrain-school-1d9f6.firebaseapp.com",
    projectId:"al-nahrain-school-1d9f6",
    messagingSenderId:"119716570818",
    appId:"1:119716570818:web:aa200d98166a5a964f3d5b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    const title = payload.notification?.title || payload.data?.title || 'إشعار جديد - النهرين';
    const body  = payload.notification?.body  || payload.data?.body  || '';
    self.registration.showNotification(title, {
        body,
        icon: '../logo.jpg',
        badge: '../logo.jpg',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [300, 100, 300, 100, 300],
        silent: false,
        renotify: true,
        tag: 'nahrain-' + Date.now(),
    });
});
