/* Dr. Corner — service worker: يخلّي الموقع تطبيق قابل للتثبيت ويفتح بسرعة */
const CACHE='drcorner-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // الملفات بتاعتنا: من النت الأول (عشان التحديثات توصل)، ولو مفيش نت من الكاش
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
      .catch(()=>caches.match(r,{ignoreSearch:true})));
  }else if(/fonts\.googleapis\.com|fonts\.gstatic\.com|gstatic\.com\/firebasejs/.test(u.href)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));
  }
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws)if('focus' in w)return w.focus();
    return self.clients.openWindow(self.registration.scope);
  }));
});
