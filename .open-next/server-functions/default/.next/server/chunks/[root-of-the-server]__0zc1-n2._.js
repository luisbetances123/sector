module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},20171,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),i=e.i(59756),s=e.i(61916),n=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),p=e.i(95169),c=e.i(47587),u=e.i(66012),x=e.i(70101),g=e.i(26937),v=e.i(10372),f=e.i(93695);e.i(52474);var h=e.i(5232),m=e.i(89171);async function b(e){let{searchParams:t}=new URL(e.url),a=t.get("titulo")||"Propiedad",r=t.get("precio")||"0",i=t.get("sector")||"",s=t.get("recamaras")||"0",n=t.get("banos")||"0",o=t.get("area")||"0",l=t.get("notas")||"",d=t.get("imagen")||"",p=Number(r)?"US$ "+Number(r).toLocaleString("en-US"):r,c=`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #fff; color: #111; }
  .page { width: 794px; min-height: 1123px; padding: 48px; }
  .header { border-bottom: 3px solid #CCFF00; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
  .logo span { color: #CCFF00; }
  .sector-tag { font-size: 10px; font-family: monospace; background: #f0f0f0; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
  .titulo { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 8px; }
  .precio { font-size: 28px; font-weight: 900; color: #111; margin-bottom: 32px; }
  .imagen { width: 100%; height: 320px; object-fit: cover; border-radius: 12px; margin-bottom: 32px; background: #f0f0f0; }
  .specs { display: flex; gap: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; margin-bottom: 32px; }
  .spec { flex: 1; padding: 20px; text-align: center; border-right: 1px solid #e0e0e0; }
  .spec:last-child { border-right: none; }
  .spec-value { font-size: 28px; font-weight: 900; font-family: monospace; }
  .spec-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 4px; }
  .section-title { font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 12px; }
  .notas { background: #f9f9f9; border-radius: 12px; padding: 20px; font-size: 13px; line-height: 1.6; color: #444; }
  .footer { margin-top: 48px; border-top: 1px solid #e0e0e0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
  .footer-text { font-size: 10px; color: #aaa; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; }
  .footer-dot { width: 8px; height: 8px; background: #CCFF00; border-radius: 50%; display: inline-block; margin-right: 6px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">SEC<span>TOR</span></div>
    <div class="sector-tag">${i}</div>
  </div>
  <div class="titulo">${a}</div>
  <div class="precio">${p}</div>
  ${d?`<img class="imagen" src="${d}" alt="${a}" />`:'<div class="imagen"></div>'}
  <div class="specs">
    <div class="spec">
      <div class="spec-value">${s}</div>
      <div class="spec-label">Recamaras</div>
    </div>
    <div class="spec">
      <div class="spec-value">${n}</div>
      <div class="spec-label">Banos</div>
    </div>
    <div class="spec">
      <div class="spec-value">${o}</div>
      <div class="spec-label">m2</div>
    </div>
  </div>
  ${l?`<div class="section-title">Descripcion y Detalles</div><div class="notas">${l}</div>`:""}
  <div class="footer">
    <div class="footer-text"><span class="footer-dot"></span>sector.do — CRM Inmobiliario para Realtors en RD</div>
    <div class="footer-text">Ficha generada por SECTOR</div>
  </div>
</div>
</body>
</html>`;return new m.NextResponse(c,{headers:{"Content-Type":"text/html; charset=utf-8"}})}e.s(["GET",0,b],41735);var R=e.i(41735);let w=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/pdf/propiedad/route",pathname:"/api/pdf/propiedad",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/pdf/propiedad/route.ts",nextConfigOutput:"standalone",userland:R,...{}}),{workAsyncStorage:y,workUnitAsyncStorage:C,serverHooks:E}=w;async function A(e,t,r){r.requestMeta&&(0,i.setRequestMeta)(e,r.requestMeta),w.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/pdf/propiedad/route";m=m.replace(/\/index$/,"")||"/";let b=await w.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:R,deploymentId:y,params:C,nextConfig:E,parsedUrl:A,isDraftMode:T,prerenderManifest:N,routerServerContext:k,isOnDemandRevalidate:S,revalidateOnlyGenerated:P,resolvedPathname:q,clientReferenceManifest:O,serverActionsManifest:_}=b,$=(0,o.normalizeAppPath)(m),j=!!(N.dynamicRoutes[$]||N.routes[q]),U=async()=>((null==k?void 0:k.render404)?await k.render404(e,t,A,!1):t.end("This page could not be found"),null);if(j&&!T){let e=!!N.routes[q],t=N.dynamicRoutes[$];if(t&&!1===t.fallback&&!e){if(E.adapterPath)return await U();throw new f.NoFallbackError}}let D=null;!j||w.isDev||T||(D="/index"===(D=q)?"/":D);let H=!0===w.isDev||!j,I=j&&!H;_&&O&&(0,n.setManifestsSingleton)({page:m,clientReferenceManifest:O,serverActionsManifest:_});let F=e.method||"GET",M=(0,s.getTracer)(),z=M.getActiveScopeSpan(),K=!!(null==k?void 0:k.isWrappedByNextServer),B=!!(0,i.getRequestMeta)(e,"minimalMode"),L=(0,i.getRequestMeta)(e,"incrementalCache")||await w.getIncrementalCache(e,E,N,B);null==L||L.resetRequestCache(),globalThis.__incrementalCache=L;let G={params:C,previewProps:N.preview,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:H,incrementalCache:L,cacheLifeProfiles:E.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,i)=>w.onRequestError(e,t,r,i,k)},sharedContext:{buildId:R,deploymentId:y}},V=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),X=d.NextRequestAdapter.fromNodeNextRequest(V,(0,d.signalFromNodeResponse)(t));try{let i,n=async e=>w.handle(X,G).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=M.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${F} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",r),i.updateName(t))}else e.updateName(`${F} ${m}`)}),o=async i=>{var s,o;let l=async({previousCacheEntry:a})=>{try{if(!B&&S&&P&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await n(i);e.fetchMetrics=G.renderOpts.fetchMetrics;let o=G.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let l=G.renderOpts.collectedTags;if(!j)return await (0,u.sendResponse)(V,W,s,G.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,x.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[v.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==G.renderOpts.collectedRevalidate&&!(G.renderOpts.collectedRevalidate>=v.INFINITE_CACHE)&&G.renderOpts.collectedRevalidate,r=void 0===G.renderOpts.collectedExpire||G.renderOpts.collectedExpire>=v.INFINITE_CACHE?void 0:G.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await w.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:I,isOnDemandRevalidate:S})},!1,k),t}},d=await w.handleResponse({req:e,nextConfig:E,cacheKey:D,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:P,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:B});if(!j)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),T&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,x.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&j||p.delete(v.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,g.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)(V,W,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};K&&z?await o(z):(i=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${F} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},o),void 0,!K))}catch(t){if(t instanceof f.NoFallbackError||await w.onRequestError(e,t,{routerKind:"App Router",routePath:$,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:I,isOnDemandRevalidate:S})},!1,k),j)throw t;return await (0,u.sendResponse)(V,W,new Response(null,{status:500})),null}}e.s(["handler",0,A,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:C})},"routeModule",0,w,"serverHooks",0,E,"workAsyncStorage",0,y,"workUnitAsyncStorage",0,C],20171)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0zc1-n2._.js.map