'use client';

import { useState } from 'react';
import { TimeEntryForm } from '@/components/dashboard/time-entry-form';
import { ActivitySelector } from '@/components/dashboard/activity-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Timer, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TimerPage() {
  const { toast } = useToast();
  const [activeTimer, setActiveTimer] = useState<any>(null);

  const handleTimeSubmit = async (data: any) => {
    // Here you would typically save to your database
    console.log('Time entry submitted:', data);
    
    // Show success message
    toast({
      title: "Success",
      description: `Logged ${data.duration} minutes for ${data.activity}`,
    });
    
    // In a real app, you might refresh the time entries list here
  };

  const handleQuickActivity = () => {
    // Example of using just the activity selector separately
    console.log('Quick activity selected');
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Track time spent on marketing activities with our mobile-optimized interface
        </p>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manual" className="gap-2">
            <Clock className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="timer" className="gap-2">
            <Timer className="h-4 w-4" />
            Live Timer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Time Entry Form */}
          <TimeEntryForm
            onSubmit={handleTimeSubmit}
          />

          {/* Recent Entries Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Entries
              </CardTitle>
              <CardDescription>
                Your latest time tracking entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Google Ads Management</p>
                      <p className="text-sm text-muted-foreground">Advertising & Paid Media</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">45 min</p>
                      <p className="text-xs text-green-600">Billable</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Blog Writing</p>
                      <p className="text-sm text-muted-foreground">Content & SEO</p>
                      <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">2h 15min</p>
                      <p className="text-xs text-green-600">Billable</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Social Media Management</p>
                      <p className="text-sm text-muted-foreground">Social & Influencer Marketing</p>
                      <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">1h 30min</p>
                      <p className="text-xs text-green-600">Billable</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Timer</CardTitle>
              <CardDescription>
                Start a timer and log your activity when complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Activity Selector for Timer */}
              <div className="space-y-2">
                <label className="text-sm font-medium">What are you working on?</label>
                <ActivitySelector
                  value={activeTimer?.activity}
                  onSelect={(category, activity) => {
                    setActiveTimer({ category, activity });
                    console.log('Timer activity selected:', { category, activity });
                  }}
                />
              </div>

              {/* Timer Display */}
              <div className="text-center py-8">
                <div className="text-6xl font-mono font-bold">
                  00:00:00
                </div>
                {activeTimer && (
                  <p className="text-muted-foreground mt-2">
                    {activeTimer.activity}
                  </p>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex gap-2 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Start Timer
                </button>
                <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                  Reset
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

