const CACHE='nova-pay-final-v19-10';
const CORE=['./','./index.html','./styles.css','./app.js','./supabase-config.js','./manifest.webmanifest','./icon.svg','./login-support.jpg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>{
   const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response;
  }).catch(()=>caches.match('./index.html')));
 }else{
  event.respondWith(caches.match(req).then(cached=>{
   const network=fetch(req).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
    return response;
   });
   return cached||network;
  }));
 }
});
