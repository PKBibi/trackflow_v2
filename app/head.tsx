export default function Head() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  const preconnects = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://js.stripe.com',
    posthogHost.replace(/\/$/, ''),
  ]
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl)
      preconnects.push(`${u.origin}`)
    } catch {}
  }
  return (
    <>
      {preconnects.map((href) => (
        <link key={href} rel="preconnect" href={href} crossOrigin="anonymous" />
      ))}
      {preconnects.map((href) => (
        <link key={`${href}-dns`} rel="dns-prefetch" href={href} />
      ))}
    </>
  )
}

