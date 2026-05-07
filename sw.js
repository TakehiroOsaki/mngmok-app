// Service Worker - 管理者ダッシュボード
const CACHE_NAME = 'admin-dashboard-v2';
const CACHE_FILES = [
  './index.html',
  './manifest.json'
];

// インストール：静的ファイルをキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

// アクティベート：古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// フェッチ：Dropbox APIはネットワーク優先、それ以外はキャッシュ優先
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Dropbox API / 認証リクエストは常にネットワーク
  if (url.includes('dropbox.com') || url.includes('dropboxapi.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 静的ファイル：キャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
