// Analytics tracking utilities for Google Analytics and PostHog

// Extend the global Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'set' | 'event' | 'consent',
      targetId: string | object,
      config?: object
    ) => void;
    posthog?: any;
  }
}

// Google Analytics 4 Events
export const GA_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',

  // User engagement
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Subscription events
  PURCHASE: 'purchase',
  SUBSCRIPTION_START: 'begin_checkout',
  SUBSCRIPTION_SUCCESS: 'purchase',
  SUBSCRIPTION_CANCEL: 'refund',

  // Feature usage
  TIMER_START: 'timer_start',
  TIMER_STOP: 'timer_stop',
  TIME_ENTRY_CREATE: 'time_entry_create',
  REPORT_GENERATE: 'report_generate',
  INVOICE_CREATE: 'invoice_create',

  // Engagement
  FILE_EXPORT: 'file_export',
  SETTINGS_UPDATE: 'settings_update',
  SUPPORT_CONTACT: 'contact_support',

  // Errors
  ERROR_OCCURRED: 'exception',
} as const;

// Analytics utility class
export class Analytics {
  private static isEnabled() {
    return process.env.NODE_ENV === 'production' || process.env.ENABLE_GA_DEV === 'true';
  }

  // Track page views
  static trackPageView(url: string, title?: string) {
    if (!this.isEnabled()) return;

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', GA_EVENTS.PAGE_VIEW, {
        page_title: title,
        page_location: url,
      });
    }

    // PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('$pageview', {
        $current_url: url,
        page_title: title,
      });
    }
  }

  // Track user events
  static trackEvent(
    eventName: string,
    parameters?: Record<string, any>,
    value?: number
  ) {
    if (!this.isEnabled()) return;

    const eventData = {
      ...parameters,
      ...(value && { value }),
      timestamp: new Date().toISOString(),
    };

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(eventName, eventData);
    }

    // Also send to our monitoring system for business metrics
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventName,
            properties: eventData,
          }),
        }).catch(() => {
          // Silently fail - analytics shouldn't break the app
        });
      } catch (error) {
        // Silently fail
      }
    }
  }

  // Track user identification
  static identifyUser(userId: string, traits?: Record<string, any>) {
    if (!this.isEnabled()) return;

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-WC4MZKFK0D', {
        user_id: userId,
        custom_map: traits,
      });
    }

    // PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.identify(userId, traits);
    }
  }

  // Track subscription/purchase events
  static trackPurchase(
    transactionId: string,
    value: number,
    currency: string = 'USD',
    plan?: string,
    userId?: string
  ) {
    const purchaseData = {
      transaction_id: transactionId,
      value,
      currency,
      affiliation: 'TrackFlow',
      ...(plan && { item_name: plan }),
      ...(userId && { user_id: userId }),
    };

    this.trackEvent(GA_EVENTS.PURCHASE, purchaseData, value);

    // Enhanced ecommerce for GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value,
        currency,
        items: [{
          item_id: plan || 'subscription',
          item_name: plan || 'Subscription',
          category: 'subscription',
          price: value,
          quantity: 1,
        }],
      });
    }
  }

  // Track conversion funnel steps
  static trackFunnelStep(step: string, stepNumber: number, metadata?: Record<string, any>) {
    this.trackEvent('funnel_step', {
      step_name: step,
      step_number: stepNumber,
      ...metadata,
    });
  }

  // Track feature usage
  static trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent('feature_usage', {
      feature_name: feature,
      action,
      ...metadata,
    });
  }

  // Track errors
  static trackError(error: string | Error, context?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;

    this.trackEvent(GA_EVENTS.ERROR_OCCURRED, {
      description: errorMessage,
      fatal: false,
      ...context,
    });
  }

  // Track business metrics
  static trackBusinessEvent(event: string, value?: number, metadata?: Record<string, any>) {
    this.trackEvent(`business_${event}`, {
      event_category: 'business',
      ...metadata,
    }, value);
  }
}

// Convenience functions for common events
export const trackSignUp = (method: string = 'email') => {
  Analytics.trackEvent(GA_EVENTS.SIGN_UP, { method });
};

export const trackLogin = (method: string = 'email') => {
  Analytics.trackEvent(GA_EVENTS.LOGIN, { method });
};

export const trackLogout = () => {
  Analytics.trackEvent(GA_EVENTS.LOGOUT);
};

export const trackSubscriptionStart = (plan: string, value: number) => {
  Analytics.trackEvent(GA_EVENTS.SUBSCRIPTION_START, {
    currency: 'USD',
    value,
    plan,
  });
  Analytics.trackFunnelStep('subscription_checkout', 1, { plan });
};

export const trackSubscriptionSuccess = (
  transactionId: string,
  plan: string,
  value: number,
  userId?: string
) => {
  Analytics.trackPurchase(transactionId, value, 'USD', plan, userId);
  Analytics.trackFunnelStep('subscription_complete', 2, { plan });
};

export const trackTimerUsage = (action: 'start' | 'stop', duration?: number) => {
  Analytics.trackFeatureUsage('timer', action, { duration });
};

export const trackReportGeneration = (reportType: string, format: string = 'pdf') => {
  Analytics.trackFeatureUsage('reports', 'generate', {
    report_type: reportType,
    export_format: format,
  });
};

export const trackInvoiceCreation = (clientId: string, amount: number) => {
  Analytics.trackFeatureUsage('invoices', 'create', {
    client_id: clientId,
    invoice_amount: amount,
  });
};

export const trackSupportContact = (method: string = 'chat') => {
  Analytics.trackEvent(GA_EVENTS.SUPPORT_CONTACT, { contact_method: method });
};

// Enhanced ecommerce tracking for subscription lifecycle
export const trackSubscriptionLifecycle = {
  viewPlans: () => {
    Analytics.trackEvent('view_item_list', {
      item_list_name: 'subscription_plans',
      item_category: 'subscription',
    });
  },

  selectPlan: (plan: string, value: number) => {
    Analytics.trackEvent('select_item', {
      item_name: plan,
      item_category: 'subscription',
      value,
    });
  },

  addToCart: (plan: string, value: number) => {
    Analytics.trackEvent('add_to_cart', {
      currency: 'USD',
      value,
      items: [{
        item_name: plan,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      }],
    });
  },

  beginCheckout: (plan: string, value: number) => {
    Analytics.trackEvent('begin_checkout', {
      currency: 'USD',
      value,
      items: [{
        item_name: plan,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      }],
    });
  },
};

export default Analytics;