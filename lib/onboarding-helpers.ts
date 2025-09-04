import { format } from 'date-fns';

export interface OnboardingData {
  // Step 1: Profile
  name: string;
  company: string;
  avatar?: string;
  timezone: string;
  
  // Step 2: Services
  categories: string[];
  
  // Step 3: First Client
  clientName: string;
  clientEmail: string;
  hourlyRate: number;
  projectName: string;
  projectBudget?: number;
  
  // Metadata
  completedSteps: number[];
  onboardingCompleted: boolean;
}

export interface ExampleTimeEntry {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  activity: string;
  category: string;
  description: string;
  client: string;
  project: string;
  billable: boolean;
  rate: number;
  amount: number;
}

export const createExampleTimeEntries = (
  clientName: string = 'Example Client',
  projectName: string = 'Marketing Campaign',
  hourlyRate: number = 100
): ExampleTimeEntry[] => {
  const now = new Date();
  
  const entries: ExampleTimeEntry[] = [
    {
      id: '1',
      date: new Date(now.getTime() - 86400000), // Yesterday
      startTime: '09:00',
      endTime: '11:00',
      duration: 120,
      activity: 'Content Writing',
      category: 'content-seo',
      description: 'Created blog post about digital marketing trends for 2024',
      client: clientName,
      project: projectName,
      billable: true,
      rate: hourlyRate,
      amount: (120 / 60) * hourlyRate
    },
    {
      id: '2',
      date: new Date(now.getTime() - 172800000), // 2 days ago
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      activity: 'Google Ads Management',
      category: 'advertising-paid-media',
      description: 'Optimized PPC campaigns and adjusted bidding strategies',
      client: clientName,
      project: projectName,
      billable: true,
      rate: hourlyRate,
      amount: (90 / 60) * hourlyRate
    },
    {
      id: '3',
      date: new Date(now.getTime() - 259200000), // 3 days ago
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      activity: 'Social Media Management',
      category: 'social-influencer-marketing',
      description: 'Scheduled weekly content across social media platforms',
      client: clientName,
      project: projectName,
      billable: true,
      rate: hourlyRate,
      amount: (60 / 60) * hourlyRate
    }
  ];
  
  return entries;
};

export const saveOnboardingData = async (data: OnboardingData): Promise<boolean> => {
  try {
    // Save to localStorage for persistence
    localStorage.setItem('onboardingData', JSON.stringify(data));
    
    // In production, you would save this to your database
    // await supabase.from('profiles').update({
    //   name: data.name,
    //   company: data.company,
    //   avatar: data.avatar,
    //   timezone: data.timezone,
    //   selected_categories: data.categories,
    //   onboarding_completed: true,
    //   onboarding_completed_at: new Date().toISOString()
    // }).eq('id', userId);
    
    return true;
  } catch (error) {
    console.error('Failed to save onboarding data:', error);
    return false;
  }
};

export const getOnboardingStatus = (): boolean => {
  try {
    const data = localStorage.getItem('onboardingData');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.onboardingCompleted === true;
    }
    return false;
  } catch {
    return false;
  }
};

export const clearOnboardingData = (): void => {
  localStorage.removeItem('onboardingData');
};

// Quick templates based on selected categories
export const generateQuickTemplates = (categories: string[]) => {
  const templates = [];
  
  if (categories.includes('content-seo')) {
    templates.push(
      { label: 'Blog Writing', category: 'content-seo', activity: 'Blog Writing', duration: 120 },
      { label: 'SEO Audit', category: 'content-seo', activity: 'Technical SEO Audit', duration: 90 }
    );
  }
  
  if (categories.includes('advertising-paid-media')) {
    templates.push(
      { label: 'PPC Optimization', category: 'advertising-paid-media', activity: 'Bid Management', duration: 45 },
      { label: 'Ad Creation', category: 'advertising-paid-media', activity: 'Ad Copy Creation', duration: 60 }
    );
  }
  
  if (categories.includes('social-influencer-marketing')) {
    templates.push(
      { label: 'Social Scheduling', category: 'social-influencer-marketing', activity: 'Content Scheduling', duration: 60 },
      { label: 'Community Management', category: 'social-influencer-marketing', activity: 'Community Management', duration: 30 }
    );
  }
  
  if (categories.includes('web-tech-dev')) {
    templates.push(
      { label: 'Website Update', category: 'web-tech-dev', activity: 'Website Development', duration: 120 },
      { label: 'A/B Testing', category: 'web-tech-dev', activity: 'A/B Testing', duration: 45 }
    );
  }
  
  if (categories.includes('email-direct-marketing')) {
    templates.push(
      { label: 'Newsletter', category: 'email-direct-marketing', activity: 'Newsletter Creation', duration: 90 },
      { label: 'Email Campaign', category: 'email-direct-marketing', activity: 'Email Campaign Design', duration: 120 }
    );
  }
  
  if (categories.includes('strategy-analytics')) {
    templates.push(
      { label: 'Client Call', category: 'strategy-analytics', activity: 'Client Presentations', duration: 30 },
      { label: 'Monthly Report', category: 'strategy-analytics', activity: 'Reporting & Analytics', duration: 90 }
    );
  }
  
  return templates.slice(0, 5); // Return max 5 templates
};

