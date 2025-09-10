'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Save, Timer, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivitySelector } from '@/components/dashboard/activity-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QUICK_TEMPLATES } from '@/lib/constants/marketing-categories';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading';

interface TimeEntryFormProps {
  projectId?: string;
  clientId?: string;
  onSubmit?: (data: TimeEntryData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TimeEntryData>;
  mode?: 'create' | 'edit';
}

interface TimeEntryData {
  id?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  activity: string;
  projectId: string;
  clientId: string;
  description: string;
  billable: boolean;
  rate?: number;
}

export function TimeEntryForm({
  projectId,
  clientId,
  onSubmit,
  onCancel,
  initialData,
  mode = 'create'
}: TimeEntryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedTarget, setAppliedTarget] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TimeEntryData>({
    date: initialData?.date || new Date(),
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    duration: initialData?.duration || 0,
    category: initialData?.category || '',
    activity: initialData?.activity || '',
    projectId: initialData?.projectId || projectId || '',
    clientId: initialData?.clientId || clientId || '',
    description: initialData?.description || '',
    billable: initialData?.billable !== undefined ? initialData.billable : true,
    rate: initialData?.rate
  });

  // Apply suggested target duration from timer (if present)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('timer_target_minutes') : null
      const suggested = raw ? parseInt(raw) : 0
      if (suggested && !formData.duration) {
        setFormData(prev => ({ ...prev, duration: suggested }))
        setAppliedTarget(suggested)
        // clear after submit to allow reuse until saved
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate duration when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins > 0) {
        setFormData(prev => ({ ...prev, duration: diffMins }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  // Calculate end time when duration changes
  const handleDurationChange = (duration: number) => {
    if (duration && formData.startTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const endMs = start.getTime() + (duration * 60000);
      const end = new Date(endMs);
      const endTime = format(end, 'HH:mm');
      
      setFormData(prev => ({
        ...prev,
        duration,
        endTime
      }));
    } else {
      setFormData(prev => ({ ...prev, duration }));
    }
  };

  // Handle activity selection
  const handleActivitySelect = (category: string, activity: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      activity
    }));
  };

  // Handle quick template selection
  const handleQuickTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    // Set current time as start time
    const now = new Date();
    const startTime = format(now, 'HH:mm');
    const endMs = now.getTime() + (template.duration * 60000);
    const endTime = format(new Date(endMs), 'HH:mm');
    
    setFormData(prev => ({
      ...prev,
      category: template.category,
      activity: template.activity,
      duration: template.duration,
      startTime,
      endTime,
      description: template.label
    }));

    toast({
      title: "Template applied",
      description: `${template.label} (${template.duration} min)`,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category || !formData.activity) {
      toast({
        title: "Validation Error",
        description: "Please select an activity",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.duration || formData.duration <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid duration",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      try { localStorage.removeItem('timer_target_minutes') } catch {}
      
      toast({
        title: mode === 'create' ? "Time entry created" : "Time entry updated",
        description: `${formData.duration} minutes logged for ${formData.activity}`,
      });

      // Reset form if creating
      if (mode === 'create') {
        setFormData({
          date: new Date(),
          startTime: '',
          endTime: '',
          duration: 0,
          category: '',
          activity: '',
          projectId: projectId || '',
          clientId: clientId || '',
          description: '',
          billable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save time entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          {mode === 'create' ? 'Log Time' : 'Edit Time Entry'}
        </CardTitle>
        <CardDescription>
          Track time spent on marketing activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Selector */}
          <div className="space-y-2">
            <Label>Activity</Label>
            <ActivitySelector
              value={formData.category && formData.activity ? {
                category: formData.category,
                activity: formData.activity
              } : undefined}
              onSelect={handleActivitySelect}
              onQuickTemplate={handleQuickTemplate}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                className="flex-1"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(15)}
                  className="px-2"
                >
                  15m
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(30)}
                  className="px-2"
                >
                  30m
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(60)}
                  className="px-2"
                >
                  1h
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(120)}
                  className="px-2"
                >
                  2h
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What did you work on?"
              rows={3}
            />
          </div>

          {/* Project and Client (if needed) */}
          {(!projectId || !clientId) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!clientId && (
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* These would be populated from your data */}
                      <SelectItem value="client1">Client 1</SelectItem>
                      <SelectItem value="client2">Client 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!projectId && (
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* These would be populated from your data */}
                      <SelectItem value="project1">Project 1</SelectItem>
                      <SelectItem value="project2">Project 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Billable and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="billable"
                checked={formData.billable}
                onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="billable" className="cursor-pointer">
                Billable
              </Label>
            </div>
            
            {formData.billable && (
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Log Time' : 'Update Entry')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

