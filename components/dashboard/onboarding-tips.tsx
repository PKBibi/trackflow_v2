'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Lightbulb, 
  Timer, 
  FileText, 
  TrendingUp, 
  Settings,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  actionUrl?: string;
}

const tips: Tip[] = [
  {
    id: 'start-timer',
    title: 'Start Your First Timer',
    description: 'Track your time in real-time with our timer feature',
    icon: <Timer className="h-5 w-5" />,
    action: 'Start Timer',
    actionUrl: '/timer'
  },
  {
    id: 'log-time',
    title: 'Log Your Time',
    description: 'Manually add time entries for past work',
    icon: <FileText className="h-5 w-5" />,
    action: 'Log Time',
    actionUrl: '/timer'
  },
  {
    id: 'view-reports',
    title: 'Check Your Reports',
    description: 'See insights about your productivity and earnings',
    icon: <TrendingUp className="h-5 w-5" />,
    action: 'View Reports',
    actionUrl: '/reports'
  },
  {
    id: 'customize-settings',
    title: 'Customize Your Settings',
    description: 'Set up integrations and personalize your experience',
    icon: <Settings className="h-5 w-5" />,
    action: 'Go to Settings',
    actionUrl: '/settings'
  }
];

export function OnboardingTips() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [completedTips, setCompletedTips] = useState<string[]>([]);

  useEffect(() => {
    // Check if user just completed onboarding
    const onboardingData = localStorage.getItem('onboardingData');
    const tipsShown = localStorage.getItem('onboardingTipsShown');
    
    if (onboardingData && !tipsShown) {
      const data = JSON.parse(onboardingData);
      if (data.onboardingCompleted) {
        setIsVisible(true);
      }
    }
    
    // Load completed tips
    const saved = localStorage.getItem('completedTips');
    if (saved) {
      setCompletedTips(JSON.parse(saved));
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('onboardingTipsShown', 'true');
  };

  const handleCompleteTip = (tipId: string) => {
    const newCompleted = [...completedTips, tipId];
    setCompletedTips(newCompleted);
    localStorage.setItem('completedTips', JSON.stringify(newCompleted));
    
    // Move to next tip
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    }
  };

  const progress = (completedTips.length / tips.length) * 100;
  const currentTip = tips[currentTipIndex];

  if (!isVisible) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Getting Started Tips</h3>
              <p className="text-sm text-muted-foreground">
                Complete these steps to get the most out of TrackFlow
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-medium">{completedTips.length} of {tips.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Tip */}
        <div className="bg-background rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              {currentTip.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{currentTip.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {currentTip.description}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  handleCompleteTip(currentTip.id);
                  if (currentTip.actionUrl) {
                    window.location.href = currentTip.actionUrl;
                  }
                }}
                className="gap-2"
              >
                {currentTip.action}
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            {completedTips.includes(currentTip.id) && (
              <div className="text-green-600">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* Tips Navigation */}
        <div className="flex gap-2">
          {tips.map((tip, index) => (
            <button
              key={tip.id}
              onClick={() => setCurrentTipIndex(index)}
              className={`flex-1 h-1 rounded-full transition-colors ${
                completedTips.includes(tip.id)
                  ? 'bg-primary'
                  : index === currentTipIndex
                  ? 'bg-primary/50'
                  : 'bg-primary/20'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Welcome Message Component
export function WelcomeMessage() {
  const [userData, setUserData] = useState<{ name: string; company: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onboardingData = localStorage.getItem('onboardingData');
    const welcomeShown = localStorage.getItem('welcomeMessageShown');
    
    if (onboardingData && !welcomeShown) {
      const data = JSON.parse(onboardingData);
      if (data.onboardingCompleted) {
        setUserData({ name: data.name, company: data.company });
        setIsVisible(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setIsVisible(false);
          localStorage.setItem('welcomeMessageShown', 'true');
        }, 10000);
      }
    }
  }, []);

  if (!isVisible || !userData) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm animate-in slide-in-from-bottom-5 z-50">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                Welcome to TrackFlow, {userData.name}! 🎉
              </h4>
              <p className="text-sm text-muted-foreground">
                Your workspace for {userData.company} is all set up. 
                Start tracking your time and growing your business!
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                localStorage.setItem('welcomeMessageShown', 'true');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
