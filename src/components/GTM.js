'use client'

import React, { useEffect } from 'react';

const GTM = ({ gtmId }) => {
  useEffect(() => {
    if (!window.dataLayer) {
      const gtmScript = document.createElement('script');
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      gtmScript.async = true;
      document.head.appendChild(gtmScript);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
    }
  }, [gtmId]);

  return null;
};

export default GTM;
