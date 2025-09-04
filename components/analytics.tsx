'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Google Analytics Measurement ID from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
export function pageview(url: string) {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Track custom events
export function event({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Predefined events for TrackFlow
export const trackEvent = {
  // User actions
  signup: () => event({ action: 'signup', category: 'user' }),
  login: () => event({ action: 'login', category: 'user' }),
  logout: () => event({ action: 'logout', category: 'user' }),
  
  // Timer events
  timerStart: () => event({ action: 'timer_start', category: 'timer' }),
  timerStop: (duration: number) => event({ 
    action: 'timer_stop', 
    category: 'timer',
    value: duration 
  }),
  
  // Time entry events
  timeEntryCreate: () => event({ action: 'time_entry_create', category: 'time_entry' }),
  timeEntryEdit: () => event({ action: 'time_entry_edit', category: 'time_entry' }),
  timeEntryDelete: () => event({ action: 'time_entry_delete', category: 'time_entry' }),
  
  // Client events
  clientCreate: () => event({ action: 'client_create', category: 'client' }),
  clientEdit: () => event({ action: 'client_edit', category: 'client' }),
  
  // Project events
  projectCreate: () => event({ action: 'project_create', category: 'project' }),
  projectComplete: () => event({ action: 'project_complete', category: 'project' }),
  
  // Invoice events
  invoiceCreate: (amount: number) => event({ 
    action: 'invoice_create', 
    category: 'invoice',
    value: amount 
  }),
  invoiceSend: () => event({ action: 'invoice_send', category: 'invoice' }),
  invoicePaid: (amount: number) => event({ 
    action: 'invoice_paid', 
    category: 'invoice',
    value: amount 
  }),
  
  // Report events
  reportGenerate: (type: string) => event({ 
    action: 'report_generate', 
    category: 'report',
    label: type 
  }),
  reportExport: (format: string) => event({ 
    action: 'report_export', 
    category: 'report',
    label: format 
  }),
  
  // Onboarding events
  onboardingStart: () => event({ action: 'onboarding_start', category: 'onboarding' }),
  onboardingComplete: () => event({ action: 'onboarding_complete', category: 'onboarding' }),
  onboardingSkip: (step: string) => event({ 
    action: 'onboarding_skip', 
    category: 'onboarding',
    label: step 
  }),
  
  // Feature usage
  featureUse: (feature: string) => event({ 
    action: 'feature_use', 
    category: 'feature',
    label: feature 
  }),
  
  // Error tracking
  error: (message: string) => event({ 
    action: 'error', 
    category: 'error',
    label: message 
  }),
};

// Analytics Provider Component
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    }
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

// Declare gtag on window
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: any
    ) => void;
  }
}

