'use client';

import Script from 'next/script';

const GA_TRACKING_ID = 'G-WC4MZKFK0D';

export function GoogleAnalytics() {
  // Only load in production or when explicitly enabled
  const shouldLoad = process.env.NODE_ENV === 'production' || process.env.ENABLE_GA_DEV === 'true';

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            // Privacy settings
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            // Enhanced ecommerce
            send_page_view: true,
            // Custom parameters
            custom_map: {
              custom_parameter_1: 'user_plan',
              custom_parameter_2: 'user_cohort'
            }
          });
        `}
      </Script>
    </>
  );
}