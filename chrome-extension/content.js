// Basic platform auto-detection (privacy-first: URL + title only)
(function(){
  const patterns = [
    { hostIncludes: 'ads.google.com', category: 'PPC', channel: 'Google Ads' },
    { hostIncludes: 'business.facebook.com', category: 'Social Media', channel: 'Meta Ads' },
    { hostIncludes: 'app.linkedin.com' , category: 'Social Media', channel: 'LinkedIn Ads' },
    { hostIncludes: 'ads.tiktok.com', category: 'Social Media', channel: 'TikTok Ads' },
    { hostIncludes: 'analytics.google.com', category: 'Analytics & Tracking', channel: 'Google Analytics' },
    { hostIncludes: 'search.google.com', category: 'SEO', channel: 'Search Console' },
    { hostIncludes: 'ahrefs.com', category: 'SEO', channel: 'Ahrefs' },
    { hostIncludes: 'app.semrush.com', category: 'SEO', channel: 'SEMrush' }
  ]

  function detect(){
    try {
      const host = location.host || ''
      const match = patterns.find(p => host.includes(p.hostIncludes))
      if (match) {
        chrome.runtime.sendMessage({ action: 'detectedContext', data: match })
      }
    } catch (_) {}
  }

  // Initial detection and on navigation changes
  detect()
  window.addEventListener('popstate', detect)
  const pushState = history.pushState
  history.pushState = function(){ pushState.apply(this, arguments as any); setTimeout(detect, 0) }
})()

