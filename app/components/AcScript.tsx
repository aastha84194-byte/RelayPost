"use client";

import Script from 'next/script';

export default function AcScript() {
  return (
    <Script
      id="aclib"
      src="//acscdn.com/script/aclib.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && (window as any).aclib) {
          (window as any).aclib.runAutoTag({
            zoneId: 'isleobkjgr',
          });
        }
      }}
    />
  );
}
