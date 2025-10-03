# Domain and SSL Setup Guide

## Domain Configuration for track-flow.app

### 1. Domain Purchase and Registration

**Recommended Registrars:**
- Namecheap (budget-friendly)
- Google Domains (easy management)
- Cloudflare (integrated services)

**Domain to Purchase:** `track-flow.app`

### 2. DNS Configuration

#### Option A: Vercel DNS (Recommended)
```bash
# Primary domain
Type: A
Name: @
Value: 76.76.19.61
TTL: 300

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300

# API subdomain (optional)
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 300
```

#### Option B: Cloudflare DNS (Advanced)
```bash
# Primary domain (proxied through Cloudflare)
Type: A
Name: @
Value: 76.76.19.61
Proxy: Enabled (orange cloud)

# WWW redirect
Type: CNAME
Name: www
Value: track-flow.app
Proxy: Enabled

# Email records (for Resend)
Type: TXT
Name: @
Value: "v=spf1 include:spf.resend.com ~all"

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

### 3. SSL Certificate Setup

#### Automatic SSL (Vercel - Recommended)
Vercel automatically provisions and manages SSL certificates:
- Supports Let's Encrypt certificates
- Auto-renewal every 90 days
- Wildcard certificates for subdomains
- Zero configuration required

#### Manual SSL Configuration (Advanced)
```javascript
// vercel.json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 4. Domain Verification Steps

#### Step 1: Add Domain to Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to Settings → Domains
4. Click "Add Domain"
5. Enter `track-flow.app`
6. Follow verification instructions

#### Step 2: Configure DNS Records
1. Copy the provided DNS records from Vercel
2. Add them to your domain registrar's DNS settings
3. Wait for DNS propagation (15 minutes - 48 hours)

#### Step 3: Verify SSL Certificate
```bash
# Check SSL certificate
openssl s_client -connect track-flow.app:443 -servername track-flow.app

# Verify certificate chain
curl -I https://track-flow.app

# Test HTTPS redirect
curl -I http://track-flow.app
```

### 5. Subdomain Configuration

#### Marketing Subdomains
```bash
# Blog subdomain (future)
Type: CNAME
Name: blog
Value: cname.vercel-dns.com

# Help/Docs subdomain (future)
Type: CNAME
Name: help
Value: cname.vercel-dns.com

# Status page subdomain
Type: CNAME
Name: status
Value: cname.vercel-dns.com
```

#### API Subdomains
```bash
# API subdomain
Type: CNAME
Name: api
Value: cname.vercel-dns.com

# Webhooks subdomain (optional)
Type: CNAME
Name: webhooks
Value: cname.vercel-dns.com
```

### 6. Email Domain Setup (for Resend)

#### SPF Record
```
Type: TXT
Name: @
Value: "v=spf1 include:spf.resend.com ~all"
```

#### DKIM Record
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

#### DMARC Record
```
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@track-flow.app"
```

### 7. Domain Security

#### HSTS Preload
1. Visit https://hstspreload.org/
2. Enter `track-flow.app`
3. Submit for HSTS preload list
4. Add HSTS header in application

#### CAA Records (Optional)
```bash
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"

Type: CAA
Name: @
Value: 0 issuewild "letsencrypt.org"

Type: CAA
Name: @
Value: 0 iodef "mailto:security@track-flow.app"
```

### 8. Performance Optimization

#### CDN Configuration (Cloudflare)
```javascript
// Cloudflare page rules
https://track-flow.app/*
- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Security Level: Medium
- SSL: Full (strict)
- Always Use HTTPS: On
```

#### DNS Optimization
```bash
# Reduce TTL during setup
TTL: 300 (5 minutes)

# Increase TTL after stable
TTL: 3600 (1 hour)
```

### 9. Monitoring and Alerts

#### DNS Monitoring
```bash
# Check DNS propagation
dig track-flow.app
dig www.track-flow.app
dig track-flow.app MX

# Monitor SSL expiration
curl -s https://track-flow.app | openssl x509 -noout -dates
```

#### Uptime Monitoring
- Set up StatusCake or UptimeRobot
- Monitor HTTPS endpoints
- Alert on certificate expiration

### 10. Testing Checklist

#### Pre-Launch Tests
- [ ] Domain resolves correctly
- [ ] WWW redirects to non-WWW
- [ ] HTTPS works and redirects from HTTP
- [ ] SSL certificate is valid and trusted
- [ ] All subdomains resolve correctly
- [ ] Email domain verification passes

#### Post-Launch Tests
```bash
# SSL Labs test
https://www.ssllabs.com/ssltest/analyze.html?d=track-flow.app

# DNS propagation check
https://dnschecker.org/

# Security headers test
https://securityheaders.com/?q=track-flow.app

# Performance test
https://pagespeed.web.dev/report?url=https://track-flow.app
```

### 11. Troubleshooting

#### Common Issues

**DNS Not Propagating**
- Wait 24-48 hours for full propagation
- Clear local DNS cache: `ipconfig /flushdns`
- Use different DNS servers for testing

**SSL Certificate Issues**
- Verify domain ownership in Vercel
- Check DNS records are correct
- Wait for automatic certificate provisioning

**Mixed Content Warnings**
- Ensure all resources load over HTTPS
- Update absolute URLs to use HTTPS
- Check third-party integrations

#### Debug Commands
```bash
# Check DNS resolution
nslookup track-flow.app
dig +trace track-flow.app

# Test SSL connection
openssl s_client -connect track-flow.app:443

# Check certificate details
echo | openssl s_client -connect track-flow.app:443 2>/dev/null | openssl x509 -noout -text
```