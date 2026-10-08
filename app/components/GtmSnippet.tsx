"use client";
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GTM_ID } from '@/app/lib/constants';
import { isPublicAnalyticsHost, trackFunnel } from '@/app/lib/funnel';
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY, hasOptionalCookieConsent } from '@/app/lib/cookie-consent';

export default function GtmSnippet() {
  const [enabled,setEnabled] = useState(false);
  const pathname = usePathname();
  const lastView = useRef('');
  useEffect(()=>{
    const sync=()=>{
      const allowed=isPublicAnalyticsHost(window.location.hostname) && hasOptionalCookieConsent();
      setEnabled(allowed);
      if(!allowed) { lastView.current=''; return; }
      if(lastView.current!==pathname) {
        lastView.current=pathname;
        if(pathname==='/catalogo' || pathname==='/catalogo/todos' || pathname==='/catalogo/primavera-verao' || pathname.startsWith('/catalogo/categoria/'))trackFunnel('vlt_catalog_view');
        if(pathname==='/atendimento')trackFunnel('vlt_form_view');
      }
    };
    const onStorage=(event: StorageEvent)=>{
      if(event.key!==COOKIE_CONSENT_KEY) return;
      if(!hasOptionalCookieConsent() && document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
        window.location.reload();
        return;
      }
      sync();
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT,sync);
    window.addEventListener('storage',onStorage);
    return ()=>{ window.removeEventListener(COOKIE_CONSENT_EVENT,sync); window.removeEventListener('storage',onStorage); };
  },[pathname]);
  if(!enabled)return null;
  return <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}}/>;
}
