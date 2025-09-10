'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronRight, 
  ChevronLeft,
  User,
  Briefcase,
  MapPin,
  Upload,
  Check,
  Sparkles,
  Timer,
  FileText,
  TrendingUp,
  Settings,
  Clock,
  DollarSign,
  Building2,
  Zap,
  ArrowRight,
  SkipForward,
  PlayCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MARKETING_CATEGORIES, getCategoryIcon, QUICK_TEMPLATES } from '@/lib/constants/marketing-categories';
import { cn } from '@/lib/utils';

interface OnboardingData {
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

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney Time (AEDT)' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  const [data, setData] = useState<OnboardingData>({
    name: '',
    company: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    categories: [],
    clientName: '',
    clientEmail: '',
    hourlyRate: 100,
    projectName: '',
    projectBudget: undefined,
    completedSteps: [],
    onboardingCompleted: false
  });

  const totalSteps = 4;

  // Auto-detect timezone on mount
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matchingTimezone = timezones.find(tz => tz.value === detectedTimezone);
    if (matchingTimezone) {
      setData(prev => ({ ...prev, timezone: matchingTimezone.value }));
    }
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      });
    }
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Validate current step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim() !== '' && data.company.trim() !== '';
      case 2:
        return data.categories.length > 0;
      case 3:
        // Optional step, always valid
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Navigate to next step
  const handleNext = () => {
    if (!isStepValid() && currentStep !== 3) {
      toast({
        title: "Please complete this step",
        description: "Fill in all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    setData(prev => ({
      ...prev,
      completedSteps: Array.from(new Set([...prev.completedSteps, currentStep]))
    }));
    
    if (currentStep === totalSteps) {
      completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip current step
  const handleSkip = () => {
    if (currentStep === 3) {
      // Skip client setup
      setData(prev => ({
        ...prev,
        clientName: '',
        clientEmail: '',
        projectName: ''
      }));
    }
    
    if (currentStep === totalSteps) {
      completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Save onboarding data (mock API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create example time entries
      await seedExampleTimeEntries();
      
      // Mark onboarding as completed
      setData(prev => ({ ...prev, onboardingCompleted: true }));
      
      toast({
        title: "Welcome to TrackFlow!",
        description: "Your account has been set up successfully.",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Seed example time entries for demo
  const seedExampleTimeEntries = async () => {
    const exampleEntries = [
      {
        date: new Date(Date.now() - 86400000), // Yesterday
        activity: 'Content Writing',
        category: 'content-seo',
        duration: 120,
        description: 'Blog post about marketing trends',
        client: data.clientName || 'Example Client',
        project: data.projectName || 'Marketing Campaign',
        billable: true,
        rate: data.hourlyRate
      },
      {
        date: new Date(Date.now() - 172800000), // 2 days ago
        activity: 'Google Ads Management',
        category: 'advertising-paid-media',
        duration: 90,
        description: 'PPC campaign optimization',
        client: data.clientName || 'Example Client',
        project: data.projectName || 'Marketing Campaign',
        billable: true,
        rate: data.hourlyRate
      },
      {
        date: new Date(Date.now() - 259200000), // 3 days ago
        activity: 'Social Media Management',
        category: 'social-influencer-marketing',
        duration: 60,
        description: 'Weekly content scheduling',
        client: data.clientName || 'Example Client',
        project: data.projectName || 'Marketing Campaign',
        billable: true,
        rate: data.hourlyRate
      }
    ];
    
    // Save example entries (mock)
    console.log('Seeded example time entries:', exampleEntries);
  };

  // Tour tooltips configuration
  const tourTooltips = [
    {
      id: 'timer',
      title: 'Start Timer',
      description: 'Click here to start tracking your time',
      target: '.timer-button'
    },
    {
      id: 'activities',
      title: 'Recent Activities',
      description: 'Your recent time entries appear here',
      target: '.activities-section'
    },
    {
      id: 'reports',
      title: 'View Reports',
      description: 'Generate detailed reports and analytics',
      target: '.reports-button'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account and preferences',
      target: '.settings-button'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">Welcome to TrackFlow!</h2>
              <p className="text-muted-foreground mt-2">
                Let's start by setting up your profile
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {data.avatar ? (
                    <Image src={data.avatar} alt="Profile avatar" width={96} height={96} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {data.name ? data.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label>Your Name *</Label>
              <Input
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label>Company/Agency Name *</Label>
              <Input
                placeholder="Acme Marketing Agency"
                value={data.company}
                onChange={(e) => setData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={data.timezone}
                onValueChange={(value) => setData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                We've auto-detected your timezone
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">What services do you offer?</h2>
              <p className="text-muted-foreground mt-2">
                Select all that apply - this helps us personalize your experience
              </p>
            </div>

            {/* Marketing Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(MARKETING_CATEGORIES).map(([key, category]) => {
                const Icon = getCategoryIcon(category.icon);
                const isSelected = data.categories.includes(key);
                
                return (
                  <div
                    key={key}
                    onClick={() => toggleCategory(key)}
                    className={cn(
                      "relative border rounded-lg p-4 cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div 
                        className="rounded-md p-2"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <Icon 
                          className="h-5 w-5" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">
                          {category.label}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.activities.slice(0, 3).join(', ')}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.activities.length} activities
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.categories.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Great! We'll set up {data.categories.length} quick templates based on your selections.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Add Your First Client</h2>
              <p className="text-muted-foreground mt-2">
                Optional - you can skip this and add clients later
              </p>
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                placeholder="Acme Corporation"
                value={data.clientName}
                onChange={(e) => setData(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>

            {/* Client Email */}
            <div className="space-y-2">
              <Label>Client Email</Label>
              <Input
                type="email"
                placeholder="contact@acmecorp.com"
                value={data.clientEmail}
                onChange={(e) => setData(prev => ({ ...prev, clientEmail: e.target.value }))}
              />
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label>Default Hourly Rate</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="100"
                  value={data.hourlyRate}
                  onChange={(e) => setData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You can set different rates for each project
              </p>
            </div>

            {/* First Project */}
            {data.clientName && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Create First Project</h3>
                
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    placeholder="Website Redesign"
                    value={data.projectName}
                    onChange={(e) => setData(prev => ({ ...prev, projectName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Budget (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="5000"
                      value={data.projectBudget || ''}
                      onChange={(e) => setData(prev => ({ ...prev, projectBudget: parseInt(e.target.value) || undefined }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">
                Let's take a quick tour of TrackFlow
              </p>
            </div>

            {/* Summary */}
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <h3 className="font-semibold mb-3">Your Setup Summary</h3>
              
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm">Profile configured for {data.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm">{data.categories.length} service categories selected</span>
              </div>
              
              {data.clientName && (
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm">First client "{data.clientName}" added</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm">3 example time entries created</span>
              </div>
            </div>

            {/* Tour Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Tour Highlights</h3>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Time Tracking</p>
                    <p className="text-xs text-muted-foreground">
                      Start timers, log activities, and track billable hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Recent Activities</p>
                    <p className="text-xs text-muted-foreground">
                      View and manage your time entries in one place
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Reports & Analytics</p>
                    <p className="text-xs text-muted-foreground">
                      Generate insights and track your productivity
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                    <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Settings & Team</p>
                    <p className="text-xs text-muted-foreground">
                      Manage your account, team, and preferences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowTour(true)}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Start Interactive Tour
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={currentStep === 1 || currentStep === 2}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            
            {/* Step Labels */}
            <div className="flex justify-between mt-4">
              {['Profile', 'Services', 'Client', 'Tour'].map((label, index) => (
                <div
                  key={label}
                  className={cn(
                    "text-xs font-medium",
                    index + 1 === currentStep 
                      ? "text-primary" 
                      : index + 1 < currentStep
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>

            {/* Navigation */}
            <div className="border-t px-8 py-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentStep === 3 && (
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                    >
                      Skip This Step
                    </Button>
                  )}
                  
                  {currentStep === totalSteps ? (
                    <Button
                      onClick={completeOnboarding}
                      disabled={isLoading}
                      className="gap-2 min-w-[140px]"
                    >
                      {isLoading ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Get Started
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid() && currentStep !== 3}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Need help? Contact support at{' '}
              <a href="mailto:support@track-flow.app" className="text-primary hover:underline">
                support@track-flow.app
              </a>
            </p>
          </div>
        </div>

        {/* Interactive Tour Modal (simplified version) */}
        {showTour && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Interactive Tour</CardTitle>
                <CardDescription>
                  Learn the key features of TrackFlow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    When you enter the dashboard, look for these key areas:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Timer className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span><strong>Timer Button:</strong> Start tracking time instantly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Recent Activities:</strong> View your latest time entries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span><strong>Reports:</strong> Analyze your productivity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span><strong>Settings:</strong> Customize your experience</span>
                    </li>
                  </ul>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => {
                    setShowTour(false);
                    completeOnboarding();
                  }}>
                    Got it, let's go!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
