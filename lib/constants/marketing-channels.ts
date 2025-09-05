// Marketing Channel Structure for TrackFlow
// Based on mobile-optimized two-tier hierarchy for digital marketing

export interface MarketingChannel {
  id: string
  name: string
  category: string
  description: string
  icon: string
  billableByDefault: boolean
  color: string
}

export interface MarketingCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  channels: MarketingChannel[]
}

// Tier 1 Categories
export const MARKETING_CATEGORIES: MarketingCategory[] = [
  {
    id: 'content-seo',
    name: 'Content & SEO',
    description: 'Content creation, SEO optimization, and organic growth',
    icon: 'FileText',
    color: '#10b981', // green-500
    channels: [
      {
        id: 'blog-writing',
        name: 'Blog Writing',
        category: 'content-seo',
        description: 'Writing blog posts, articles, and content pieces',
        icon: 'Edit3',
        billableByDefault: true,
        color: '#10b981'
      },
      {
        id: 'keyword-research',
        name: 'Keyword Research',
        category: 'content-seo',
        description: 'SEO keyword research and analysis',
        icon: 'Search',
        billableByDefault: true,
        color: '#10b981'
      },
      {
        id: 'technical-seo',
        name: 'Technical SEO',
        category: 'content-seo',
        description: 'Technical SEO audits and implementation',
        icon: 'Settings',
        billableByDefault: true,
        color: '#10b981'
      },
      {
        id: 'content-strategy',
        name: 'Content Strategy',
        category: 'content-seo',
        description: 'Content planning and strategy development',
        icon: 'Map',
        billableByDefault: true,
        color: '#10b981'
      },
      {
        id: 'copywriting',
        name: 'Copywriting',
        category: 'content-seo',
        description: 'Sales copy, landing pages, and conversion copy',
        icon: 'PenTool',
        billableByDefault: true,
        color: '#10b981'
      }
    ]
  },
  {
    id: 'advertising-paid',
    name: 'Advertising & Paid Media',
    description: 'Paid advertising campaigns and media buying',
    icon: 'Target',
    color: '#ef4444', // red-500
    channels: [
      {
        id: 'google-ads',
        name: 'Google Ads',
        category: 'advertising-paid',
        description: 'Google Ads campaign management and optimization',
        icon: 'Search',
        billableByDefault: true,
        color: '#ef4444'
      },
      {
        id: 'meta-ads',
        name: 'Meta Ads (Facebook/Instagram)',
        category: 'advertising-paid',
        description: 'Facebook and Instagram advertising',
        icon: 'Facebook',
        billableByDefault: true,
        color: '#ef4444'
      },
      {
        id: 'linkedin-ads',
        name: 'LinkedIn Ads',
        category: 'advertising-paid',
        description: 'LinkedIn advertising and sponsored content',
        icon: 'Linkedin',
        billableByDefault: true,
        color: '#ef4444'
      },
      {
        id: 'tiktok-ads',
        name: 'TikTok Ads',
        category: 'advertising-paid',
        description: 'TikTok advertising campaigns',
        icon: 'Music',
        billableByDefault: true,
        color: '#ef4444'
      },
      {
        id: 'microsoft-ads',
        name: 'Microsoft Ads (Bing)',
        category: 'advertising-paid',
        description: 'Microsoft/Bing advertising campaigns',
        icon: 'Globe',
        billableByDefault: true,
        color: '#ef4444'
      },
      {
        id: 'campaign-setup',
        name: 'Campaign Setup',
        category: 'advertising-paid',
        description: 'Initial campaign creation and configuration',
        icon: 'Plus',
        billableByDefault: true,
        color: '#ef4444'
      },
      {
        id: 'ad-creative',
        name: 'Ad Creative Development',
        category: 'advertising-paid',
        description: 'Creating ad visuals, copy, and videos',
        icon: 'Image',
        billableByDefault: true,
        color: '#ef4444'
      }
    ]
  },
  {
    id: 'social-community',
    name: 'Social & Community',
    description: 'Social media management and community building',
    icon: 'Users',
    color: '#8b5cf6', // violet-500
    channels: [
      {
        id: 'social-media-management',
        name: 'Social Media Management',
        category: 'social-community',
        description: 'Managing social media accounts and posting',
        icon: 'MessageCircle',
        billableByDefault: true,
        color: '#8b5cf6'
      },
      {
        id: 'community-management',
        name: 'Community Management',
        category: 'social-community',
        description: 'Managing online communities and engagement',
        icon: 'Users',
        billableByDefault: true,
        color: '#8b5cf6'
      },
      {
        id: 'influencer-outreach',
        name: 'Influencer Outreach',
        category: 'social-community',
        description: 'Identifying and reaching out to influencers',
        icon: 'UserPlus',
        billableByDefault: true,
        color: '#8b5cf6'
      },
      {
        id: 'social-content-creation',
        name: 'Social Content Creation',
        category: 'social-community',
        description: 'Creating posts, stories, and social content',
        icon: 'Camera',
        billableByDefault: true,
        color: '#8b5cf6'
      },
      {
        id: 'social-strategy',
        name: 'Social Strategy',
        category: 'social-community',
        description: 'Social media strategy and planning',
        icon: 'Calendar',
        billableByDefault: true,
        color: '#8b5cf6'
      }
    ]
  },
  {
    id: 'web-tech',
    name: 'Web & Tech',
    description: 'Website development, optimization, and technical tasks',
    icon: 'Code',
    color: '#3b82f6', // blue-500
    channels: [
      {
        id: 'website-development',
        name: 'Website Development',
        category: 'web-tech',
        description: 'Building and coding websites',
        icon: 'Code',
        billableByDefault: true,
        color: '#3b82f6'
      },
      {
        id: 'landing-page-optimization',
        name: 'Landing Page Optimization',
        category: 'web-tech',
        description: 'CRO and landing page improvements',
        icon: 'MousePointer',
        billableByDefault: true,
        color: '#3b82f6'
      },
      {
        id: 'analytics-setup',
        name: 'Analytics Setup',
        category: 'web-tech',
        description: 'Setting up tracking and analytics',
        icon: 'BarChart3',
        billableByDefault: true,
        color: '#3b82f6'
      },
      {
        id: 'automation-setup',
        name: 'Marketing Automation',
        category: 'web-tech',
        description: 'Setting up marketing automation workflows',
        icon: 'Zap',
        billableByDefault: true,
        color: '#3b82f6'
      },
      {
        id: 'tech-maintenance',
        name: 'Technical Maintenance',
        category: 'web-tech',
        description: 'Website maintenance and updates',
        icon: 'Wrench',
        billableByDefault: true,
        color: '#3b82f6'
      }
    ]
  },
  {
    id: 'email-direct',
    name: 'Email & Direct',
    description: 'Email marketing, SMS, and direct communication',
    icon: 'Mail',
    color: '#f59e0b', // amber-500
    channels: [
      {
        id: 'email-campaigns',
        name: 'Email Campaigns',
        category: 'email-direct',
        description: 'Creating and managing email campaigns',
        icon: 'Mail',
        billableByDefault: true,
        color: '#f59e0b'
      },
      {
        id: 'email-automation',
        name: 'Email Automation',
        category: 'email-direct',
        description: 'Setting up email automation sequences',
        icon: 'Repeat',
        billableByDefault: true,
        color: '#f59e0b'
      },
      {
        id: 'newsletter-creation',
        name: 'Newsletter Creation',
        category: 'email-direct',
        description: 'Creating newsletters and regular email content',
        icon: 'FileText',
        billableByDefault: true,
        color: '#f59e0b'
      },
      {
        id: 'sms-marketing',
        name: 'SMS Marketing',
        category: 'email-direct',
        description: 'SMS and text message marketing campaigns',
        icon: 'MessageSquare',
        billableByDefault: true,
        color: '#f59e0b'
      },
      {
        id: 'direct-mail',
        name: 'Direct Mail',
        category: 'email-direct',
        description: 'Physical direct mail campaigns',
        icon: 'Send',
        billableByDefault: true,
        color: '#f59e0b'
      }
    ]
  },
  {
    id: 'strategy-analytics',
    name: 'Strategy & Analytics',
    description: 'Strategic planning, analysis, and reporting',
    icon: 'TrendingUp',
    color: '#6366f1', // indigo-500
    channels: [
      {
        id: 'strategy-planning',
        name: 'Strategy Planning',
        category: 'strategy-analytics',
        description: 'Marketing strategy development and planning',
        icon: 'Map',
        billableByDefault: true,
        color: '#6366f1'
      },
      {
        id: 'analytics-reporting',
        name: 'Analytics & Reporting',
        category: 'strategy-analytics',
        description: 'Data analysis and performance reporting',
        icon: 'BarChart3',
        billableByDefault: true,
        color: '#6366f1'
      },
      {
        id: 'competitor-analysis',
        name: 'Competitor Analysis',
        category: 'strategy-analytics',
        description: 'Analyzing competitor strategies and tactics',
        icon: 'Eye',
        billableByDefault: true,
        color: '#6366f1'
      },
      {
        id: 'market-research',
        name: 'Market Research',
        category: 'strategy-analytics',
        description: 'Market research and audience analysis',
        icon: 'Search',
        billableByDefault: true,
        color: '#6366f1'
      },
      {
        id: 'client-meetings',
        name: 'Client Meetings',
        category: 'strategy-analytics',
        description: 'Client calls, meetings, and presentations',
        icon: 'Users',
        billableByDefault: true,
        color: '#6366f1'
      },
      {
        id: 'admin-tasks',
        name: 'Admin Tasks',
        category: 'strategy-analytics',
        description: 'Administrative work and project management',
        icon: 'Clipboard',
        billableByDefault: false,
        color: '#6366f1'
      }
    ]
  }
]

// Helper functions
export const getAllChannels = (): MarketingChannel[] => {
  return MARKETING_CATEGORIES.flatMap(category => category.channels)
}

export const getChannelById = (channelId: string): MarketingChannel | undefined => {
  return getAllChannels().find(channel => channel.id === channelId)
}

export const getCategoryById = (categoryId: string): MarketingCategory | undefined => {
  return MARKETING_CATEGORIES.find(category => category.id === categoryId)
}

export const getChannelsByCategory = (categoryId: string): MarketingChannel[] => {
  const category = getCategoryById(categoryId)
  return category ? category.channels : []
}

export const getBillableChannels = (): MarketingChannel[] => {
  return getAllChannels().filter(channel => channel.billableByDefault)
}

export const getNonBillableChannels = (): MarketingChannel[] => {
  return getAllChannels().filter(channel => !channel.billableByDefault)
}