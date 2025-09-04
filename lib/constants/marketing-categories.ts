import { 
  FileText, 
  Megaphone, 
  Users, 
  Code, 
  Mail, 
  TrendingUp, 
  Clock,
  Phone,
  Edit3,
  BarChart2,
  Calendar
} from 'lucide-react';

export const MARKETING_CATEGORIES = {
  'content-seo': {
    label: 'Content & SEO',
    icon: 'FileText', // Lucide icon name
    color: '#10b981',
    activities: [
      'Content Strategy',
      'Content Marketing',
      'Search Engine Optimization (SEO)',
      'Video Marketing',
      'Blog Writing',
      'Copywriting',
      'Keyword Research',
      'On-Page Optimization',
      'Link Building',
      'Technical SEO Audit',
      'Local SEO',
    ]
  },
  'advertising-paid-media': {
    label: 'Advertising & Paid Media',
    icon: 'Megaphone',
    color: '#3b82f6',
    activities: [
      'Paid Search (PPC)',
      'Google Ads Management',
      'Meta Ads Management',
      'LinkedIn Ads',
      'Display Advertising',
      'Shopping Campaigns',
      'Remarketing',
      'Campaign Setup',
      'Bid Management',
      'Ad Copy Creation',
    ]
  },
  'social-influencer-marketing': {
    label: 'Social & Influencer Marketing',
    icon: 'Users',
    color: '#8b5cf6',
    activities: [
      'Social Media Management',
      'Community Management',
      'Influencer Outreach',
      'Content Scheduling',
      'Social Listening',
      'Engagement Management',
      'Social Media Crisis Management'
    ]
  },
  'web-tech-dev': {
    label: 'Web & Tech',
    icon: 'Code',
    color: '#06b6d4',
    activities: [
      'Website Development',
      'UX/UI Design',
      'Landing Page Creation',
      'E-commerce Platform Management',
      'Analytics Implementation',
      'Tag Management',
      'Site Speed Optimization',
      'Mobile Optimization',
      'A/B Testing',
    ]
  },
  'email-direct-marketing': {
    label: 'Email & Direct Marketing',
    icon: 'Mail',
    color: '#f59e0b',
    activities: [
      'Email Campaign Design',
      'Newsletter Creation',
      'Automation Setup',
      'List Management',
      'Segmentation',
      'Deliverability Management',
      'SMS Marketing',
      'Affiliate Program Management',
      'Referral Marketing'
    ]
  },
  'strategy-analytics': {
    label: 'Strategy & Analytics',
    icon: 'TrendingUp',
    color: '#ec4899',
    activities: [
      'Marketing Strategy',
      'Competitor Analysis',
      'Market Research',
      'Reporting & Analytics',
      'Conversion Rate Optimization (CRO)',
      'ROI Analysis',
      'Client Presentations',
      'Performance Reviews',
      'App Store Optimization (ASO)'
    ]
  }
};

export const QUICK_TEMPLATES = [
  { 
    label: 'Client Call', 
    category: 'strategy-analytics', 
    activity: 'Client Presentations',
    duration: 30,
    icon: 'Phone'
  },
  { 
    label: 'PPC Optimization', 
    category: 'advertising-paid-media',
    activity: 'Bid Management', 
    duration: 45,
    icon: 'TrendingUp'
  },
  { 
    label: 'Content Writing', 
    category: 'content-seo',
    activity: 'Blog Writing', 
    duration: 120,
    icon: 'Edit3'
  },
  { 
    label: 'Social Media Scheduling', 
    category: 'social-influencer-marketing',
    activity: 'Content Scheduling', 
    duration: 60,
    icon: 'Calendar'
  },
  { 
    label: 'Monthly Report', 
    category: 'strategy-analytics',
    activity: 'Reporting & Analytics', 
    duration: 90,
    icon: 'BarChart2'
  }
];

export type MarketingCategory = keyof typeof MARKETING_CATEGORIES;
export type CategoryData = typeof MARKETING_CATEGORIES[MarketingCategory];

// Helper function to get icon component
export const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    FileText,
    Megaphone,
    Users,
    Code,
    Mail,
    TrendingUp,
    Clock,
    Phone,
    Edit3,
    BarChart2,
    Calendar
  };
  return icons[iconName] || FileText;
};

// Helper function to get all activities across categories
export const getAllActivities = () => {
  const activities: { activity: string; category: MarketingCategory }[] = [];
  
  Object.entries(MARKETING_CATEGORIES).forEach(([categoryKey, categoryData]) => {
    categoryData.activities.forEach(activity => {
      activities.push({
        activity,
        category: categoryKey as MarketingCategory
      });
    });
  });
  
  return activities;
};

// Helper function to search activities
export const searchActivities = (query: string) => {
  const normalizedQuery = query.toLowerCase();
  const results: { activity: string; category: MarketingCategory; categoryLabel: string }[] = [];
  
  Object.entries(MARKETING_CATEGORIES).forEach(([categoryKey, categoryData]) => {
    categoryData.activities.forEach(activity => {
      if (activity.toLowerCase().includes(normalizedQuery)) {
        results.push({
          activity,
          category: categoryKey as MarketingCategory,
          categoryLabel: categoryData.label
        });
      }
    });
  });
  
  return results;
};

