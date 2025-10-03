'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Google Analytics Measurement ID (fallback to env variable)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-WC4MZKFK0D';
const PH_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

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

// PostHog minimal capture (client-side)
export function capturePosthog(event: string, properties?: Record<string, any>) {
  try {
    // Prefer posthog-js if loaded
    if (typeof window !== 'undefined' && (window as any).posthog?.capture) {
      (window as any).posthog.capture(event, properties)
      return
    }
    if (!PH_API_KEY) return;
    const payload = {
      api_key: PH_API_KEY,
      event,
      properties: {
        ...properties,
        $current_url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    };
    fetch(`${PH_HOST.replace(/\/$/, '')}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
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
  
  // Subscription/billing events
  subscriptionStart: (plan: string, value: number) => {
    event({ action: 'begin_checkout', category: 'ecommerce', label: plan, value });
    capturePosthog('subscription_checkout_started', { plan, value });

    // Enhanced ecommerce - begin checkout
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: value,
        items: [{
          item_id: plan,
          item_name: `${plan} Plan`,
          item_category: 'subscription',
          item_category2: 'monthly',
          price: value,
          quantity: 1,
        }],
      });
    }
  },

  subscriptionComplete: (transactionId: string, plan: string, value: number, userId?: string) => {
    // Enhanced ecommerce purchase event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: 'USD',
        affiliation: 'TrackFlow',
        coupon: '',
        items: [{
          item_id: plan,
          item_name: `${plan} Subscription`,
          item_category: 'subscription',
          item_category2: 'monthly',
          item_variant: plan,
          price: value,
          quantity: 1,
        }],
      });
    }
    capturePosthog('subscription_completed', {
      transaction_id: transactionId,
      plan,
      value,
      user_id: userId
    });
  },

  // Enhanced subscription lifecycle tracking
  viewPricingPage: () => {
    event({ action: 'view_item_list', category: 'ecommerce' });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', {
        item_list_id: 'pricing_plans',
        item_list_name: 'Pricing Plans',
        items: [
          { item_id: 'freelancer', item_name: 'Freelancer Plan', item_category: 'subscription', price: 15 },
          { item_id: 'pro', item_name: 'Agency Starter Plan', item_category: 'subscription', price: 29 },
          { item_id: 'enterprise', item_name: 'Agency Growth Plan', item_category: 'subscription', price: 49 }
        ]
      });
    }
  },

  selectPlan: (plan: string, value: number) => {
    event({ action: 'select_item', category: 'ecommerce', label: plan, value });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'select_item', {
        item_list_id: 'pricing_plans',
        item_list_name: 'Pricing Plans',
        items: [{
          item_id: plan,
          item_name: `${plan} Plan`,
          item_category: 'subscription',
          price: value,
          quantity: 1,
        }]
      });
    }
  },

  subscriptionCancel: (plan: string, reason?: string) => {
    event({ action: 'subscription_cancel', category: 'subscription', label: plan });
    capturePosthog('subscription_cancelled', { plan, reason });
  },

  trialStart: (plan: string) => {
    event({ action: 'trial_start', category: 'subscription', label: plan });
    capturePosthog('trial_started', { plan });
  },

  // Feature usage
  featureUse: (feature: string) => {
    event({
      action: 'feature_use',
      category: 'feature',
      label: feature
    });
    capturePosthog('feature_use', { feature });
  },

  experiment: (name: string, variant: string, action: 'view' | 'cta') => {
    event({ action: `exp_${name}_${action}`, category: 'experiment', label: variant });
    capturePosthog('experiment', { name, variant, action });
  },
  
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
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure',
              send_page_view: true
            });

            // Track initial page view
            gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href,
              page_path: window.location.pathname
            });
          `,
        }}
      />
    </>
  );
}

// Declare gtag on window
// Commented out to avoid conflict with built-in types
// declare global {
//   interface Window {
//     gtag: (
//       command: 'config' | 'event',
//       targetId: string,
//       config?: any
//     ) => void;
//   }
// }


