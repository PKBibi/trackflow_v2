import { log } from '@/lib/logger';
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Play, 
  Pause, 
  Square,
  Plus,
  RotateCcw,
  Save,
  Timer as TimerIcon,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ChannelSelector, QuickChannelSelector } from '@/components/dashboard/channel-selector';
import { MarketingChannel, getCategoryById } from '@/lib/constants/marketing-channels';
import { timeEntriesAPI, TimeEntryWithDetails } from '@/lib/api/time-entries';
import { clientsAPI, ClientWithStats } from '@/lib/api/clients';
import { projectsAPI, ProjectWithStats } from '@/lib/api/projects';
import { createClient } from '@/lib/supabase/client';

interface TimerState {
  isRunning: boolean;
  seconds: number;
  startTime?: Date;
  currentEntryId?: string;
}

export default function TimerPage() {
  // State
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [plan, setPlan] = useState<'free'|'pro'|'enterprise'>('free');
  
  // Timer state
  const [currentTimer, setCurrentTimer] = useState<TimerState>({
    isRunning: false,
    seconds: 0
  });

  // Form state for new time entry
  const [newEntry, setNewEntry] = useState({
    clientId: '',
    projectId: '',
    channel: null as MarketingChannel | null,
    taskTitle: '',
    description: '',
    hourlyRate: 15000, // $150/hour in cents
    billable: true
  });

  // Refs for timer intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Guest storage keys
  const GUEST_RUNNING_KEY = 'guest_running_timer';
  const GUEST_TODAY_ENTRIES_KEY = 'guest_today_entries';

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load clients, projects, and today's entries in parallel
      const [clientsData, projectsData, entriesData, runningTimer] = await Promise.all([
        clientsAPI.getAll(),
        projectsAPI.getAll(),
        timeEntriesAPI.getToday(),
        timeEntriesAPI.getRunningTimer()
      ]);

      setClients(clientsData);
      setProjects(projectsData);
      setTodayEntries(entriesData);

      // If there's a running timer, restore it
      if (runningTimer) {
        const startTime = new Date(runningTimer.start_time);
        const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
        
        setCurrentTimer({
          isRunning: true,
          seconds: elapsedSeconds,
          startTime: startTime,
          currentEntryId: runningTimer.id
        });

        // Find the channel for the running timer
        const channel = { 
          id: runningTimer.marketing_channel,
          name: runningTimer.marketing_channel,
          category: runningTimer.marketing_category,
          description: '',
          icon: '',
          billableByDefault: runningTimer.billable,
          color: '#3b82f6'
        } as MarketingChannel;

        setNewEntry({
          clientId: runningTimer.client_id,
          projectId: runningTimer.project_id,
          channel,
          taskTitle: runningTimer.task_title,
          description: runningTimer.task_description || '',
          hourlyRate: runningTimer.hourly_rate,
          billable: runningTimer.billable
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      log.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guest: seed demo lists, restore running timer and entries
  const loadGuestInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const guestClient: ClientWithStats = {
        id: 'guest-client',
        user_id: 'guest',
        name: 'Guest Client',
        company: 'Demo',
        country: 'US',
        hourly_rate: 15000,
        currency: 'USD',
        tax_rate: 0,
        has_retainer: false,
        retainer_hours: 0,
        retainer_amount: 0,
        retainer_auto_renew: false,
        alert_at_75_percent: false,
        alert_at_90_percent: false,
        alert_at_100_percent: false,
        status: 'active',
        current_month_hours: 0,
        current_month_earnings: 0,
        projects_count: 1,
      } as ClientWithStats;

      const guestProject: ProjectWithStats = {
        id: 'guest-project',
        user_id: 'guest',
        client_id: 'guest-client',
        name: 'Guest Project',
        status: 'active',
        priority: 'medium',
        billable: true,
        hourly_rate: 15000,
        client_name: 'Guest Client',
        total_time_entries: 0,
        total_hours: 0,
        total_amount: 0,
        is_over_budget: false,
      } as ProjectWithStats;

      setClients([guestClient]);
      setProjects([guestProject]);

      // Restore guest entries
      const raw = typeof window !== 'undefined' ? localStorage.getItem(GUEST_TODAY_ENTRIES_KEY) : null;
      const parsed: any[] = raw ? JSON.parse(raw) : [];
      const entries: TimeEntryWithDetails[] = parsed.map((e) => ({
        id: e.id || Math.random().toString(36).slice(2),
        client_id: 'guest-client',
        project_id: 'guest-project',
        start_time: e.start_time || new Date().toISOString(),
        duration: e.duration, // minutes
        marketing_category: e.marketing_category || (e.channel?.category ?? 'strategy-analytics'),
        marketing_channel: e.marketing_channel || (e.channel?.id ?? 'strategy-planning'),
        task_title: e.task_title,
        task_description: e.task_description || '',
        billable: e.billable,
        hourly_rate: e.hourly_rate ?? 15000,
        amount: e.amount,
        status: 'stopped',
        is_timer_running: false,
        client_name: 'Guest Client',
        project_name: 'Guest Project',
        channel_name: e.marketing_channel,
        category_name: e.marketing_category,
      }));
      setTodayEntries(entries);

      // Restore running timer
      const rawRun = typeof window !== 'undefined' ? localStorage.getItem(GUEST_RUNNING_KEY) : null;
      if (rawRun) {
        try {
          const run = JSON.parse(rawRun);
          const startedAt = run.startedAt ? new Date(run.startedAt) : new Date();
          const baseSeconds = Number(run.secondsElapsed || 0);
          const extra = run.isRunning ? Math.floor((Date.now() - startedAt.getTime()) / 1000) : 0;
          setCurrentTimer({
            isRunning: !!run.isRunning,
            seconds: baseSeconds + extra,
            startTime: startedAt,
          });
          if (run.newEntry) {
            setNewEntry((prev) => ({
              ...prev,
              clientId: 'guest-client',
              projectId: 'guest-project',
              channel: run.newEntry.channel || prev.channel,
              taskTitle: run.newEntry.taskTitle || prev.taskTitle,
              description: run.newEntry.description || prev.description,
              hourlyRate: run.newEntry.hourlyRate ?? prev.hourlyRate,
              billable: run.newEntry.billable ?? prev.billable,
            }));
          }
        } catch {}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      log.error('Failed to load guest data:', err);
    } finally {
      setLoading(false);
    }
  }, [GUEST_RUNNING_KEY, GUEST_TODAY_ENTRIES_KEY]);

  // Load initial data with auth detection
  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsGuest(true);
          await loadGuestInitialData();
        } else {
          await loadInitialData();
        }
        // load plan for AI features
        try {
          const r = await fetch('/api/me/plan');
          const d = await r.json();
          setPlan((d.plan || 'free'))
        } catch {}
      } catch (err) {
        // On any auth check error, fall back to guest mode
        setIsGuest(true);
        await loadGuestInitialData();
      }
    };
    init();
  }, [loadGuestInitialData, loadInitialData]);

  // Reload today's entries
  const reloadTodayEntries = async () => {
    try {
      const entries = await timeEntriesAPI.getToday();
      setTodayEntries(entries);
    } catch (err) {
      log.error('Failed to reload today entries:', err);
    }
  };

  // Format time display
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate earnings
  const calculateEarnings = (seconds: number, hourlyRate: number) => {
    const hours = seconds / 3600;
    return Math.round(hours * hourlyRate);
  };

  // AI Estimate hint (Pro+): fetch predicted minutes when channel + task present
  const [estimateHint, setEstimateHint] = useState<{ minutes: number; confidence: number; rationale?: string } | null>(null);
  const [targetMinutes, setTargetMinutes] = useState<number | null>(null);
  useEffect(() => {
    const canEstimate = newEntry.channel?.id && (newEntry.taskTitle || newEntry.description)
    if (!canEstimate) { setEstimateHint(null); return }
    let cancelled = false
    const run = async () => {
      try {
        const resp = await fetch('/api/me/plan')
        const { plan } = await resp.json()
        if (plan === 'free') { setEstimateHint(null); return }
        const r = await fetch('/api/ai/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: newEntry.channel!.id, title: newEntry.taskTitle, description: newEntry.description })
        })
        if (!r.ok) return
        const data = await r.json()
        if (!cancelled) setEstimateHint({ minutes: data.predictedMinutes, confidence: data.confidence, rationale: data.rationale })
      } catch {}
    }
    run()
    return () => { cancelled = true }
  }, [newEntry.channel, newEntry.taskTitle, newEntry.description])

  // Start timer
  const startTimer = async () => {
    if (!newEntry.channel || !newEntry.taskTitle.trim()) {
      setError('Please select a channel and enter a task title');
      return;
    }

    if (!newEntry.clientId) {
      setError('Please select a client');
      return;
    }

    if (!newEntry.projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setError(null);
      const startTime = new Date();

      if (isGuest) {
        // Start guest timer (local only)
        setCurrentTimer({ isRunning: true, seconds: 0, startTime });
        // Persist running state
        localStorage.setItem(
          GUEST_RUNNING_KEY,
          JSON.stringify({
            isRunning: true,
            startedAt: startTime.toISOString(),
            secondsElapsed: 0,
            newEntry,
          })
        );
      } else {
        // Stop any existing running timers first
        await timeEntriesAPI.stopAllRunningTimers();

        // Create new time entry in database
        const timeEntry = await timeEntriesAPI.create({
          client_id: newEntry.clientId,
          project_id: newEntry.projectId,
          start_time: startTime.toISOString(),
          marketing_category: newEntry.channel.category,
          marketing_channel: newEntry.channel.id,
          task_title: newEntry.taskTitle,
          task_description: newEntry.description,
          billable: newEntry.billable,
          hourly_rate: newEntry.hourlyRate,
          status: 'running',
          is_timer_running: true
        });

        setCurrentTimer({
          isRunning: true,
          seconds: 0,
          startTime: startTime,
          currentEntryId: timeEntry.id
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start timer');
      log.error('Failed to start timer:', err);
    }
  };

  // Stop timer and save entry
  const stopTimer = async () => {
    if (!currentTimer.currentEntryId || !currentTimer.startTime) {
      // Guest mode may not have currentEntryId
      if (!isGuest) return;
    }

    try {
      setError(null);
      
      const endTime = new Date();
      
      if (isGuest) {
        // Save a local entry
        const seconds = currentTimer.seconds;
        const minutes = Math.max(1, Math.round(seconds / 60));
        const amount = calculateEarnings(seconds, newEntry.hourlyRate);
        const entry = {
          id: Math.random().toString(36).slice(2),
          task_title: newEntry.taskTitle,
          task_description: newEntry.description,
          marketing_channel: newEntry.channel?.id || 'strategy-planning',
          marketing_category: newEntry.channel?.category || 'strategy-analytics',
          billable: newEntry.billable,
          hourly_rate: newEntry.hourlyRate,
          amount,
          duration: minutes,
          start_time: currentTimer.startTime?.toISOString(),
        };
        const raw = localStorage.getItem(GUEST_TODAY_ENTRIES_KEY);
        const list = raw ? JSON.parse(raw) : [];
        list.push(entry);
        localStorage.setItem(GUEST_TODAY_ENTRIES_KEY, JSON.stringify(list));
        // Clear running timer
        localStorage.removeItem(GUEST_RUNNING_KEY);

        // Reset timer state
        setCurrentTimer({ isRunning: false, seconds: 0 });
        // Clear form
        setNewEntry(prev => ({ ...prev, taskTitle: '', description: '' }));
        // Reload from local
        await reloadTodayEntries();
      } else {
        // Update the time entry in database
        await timeEntriesAPI.update(currentTimer.currentEntryId!, {
          end_time: endTime.toISOString(),
          status: 'stopped',
          is_timer_running: false
        });

        // Reset timer state
        setCurrentTimer({
          isRunning: false,
          seconds: 0
        });

        // Clear form
        setNewEntry(prev => ({
          ...prev,
          taskTitle: '',
          description: ''
        }));

        // Reload today's entries
        await reloadTodayEntries();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop timer');
      log.error('Failed to stop timer:', err);
    }
  };

  // Pause/Resume timer
  const toggleTimer = async () => {
    if (!currentTimer.currentEntryId) {
      if (!isGuest) return;
    }

    try {
      setError(null);
      const newIsRunning = !currentTimer.isRunning;
      if (isGuest) {
        // Persist current elapsed seconds and running flag
        const raw = localStorage.getItem(GUEST_RUNNING_KEY);
        const run = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          GUEST_RUNNING_KEY,
          JSON.stringify({
            ...run,
            isRunning: newIsRunning,
            secondsElapsed: currentTimer.seconds,
          })
        );
        setCurrentTimer(prev => ({ ...prev, isRunning: newIsRunning }));
      } else {
        await timeEntriesAPI.update(currentTimer.currentEntryId!, {
          is_timer_running: newIsRunning,
          status: newIsRunning ? 'running' : 'stopped'
        });
        setCurrentTimer(prev => ({ ...prev, isRunning: newIsRunning }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle timer');
      log.error('Failed to toggle timer:', err);
    }
  };

  // Reset timer
  const resetTimer = async () => {
    if (currentTimer.currentEntryId) {
      try {
        if (!isGuest) {
          // Delete the current entry if it exists
          await timeEntriesAPI.delete(currentTimer.currentEntryId);
        } else {
          localStorage.removeItem(GUEST_RUNNING_KEY);
        }
      } catch (err) {
        log.error('Failed to delete timer entry:', err);
      }
    }
    
    setCurrentTimer({
      isRunning: false,
      seconds: 0
    });
  };

  // Timer effect
  useEffect(() => {
    if (currentTimer.isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTimer(prev => ({
          ...prev,
          seconds: prev.seconds + 1
        }));
      }, 1000);
      // Update guest running persisted seconds periodically
      if (isGuest) {
        const raw = localStorage.getItem(GUEST_RUNNING_KEY);
        const run = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          GUEST_RUNNING_KEY,
          JSON.stringify({
            ...run,
            isRunning: true,
            secondsElapsed: currentTimer.seconds,
          })
        );
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentTimer.isRunning, currentTimer.seconds, isGuest, GUEST_RUNNING_KEY]);

  // Calculate totals for today
  const totalTodaySeconds = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0) * 60, 0);
  const totalTodayEarnings = todayEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timer</h1>
        <p className="text-muted-foreground">
          Track time by marketing channel and campaign
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Today</span>
              </div>
              <span className="text-lg font-bold">{formatTime(totalTodaySeconds)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Earnings</span>
              </div>
              <span className="text-lg font-bold">${(totalTodayEarnings / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Entries</span>
              </div>
              <span className="text-lg font-bold">{todayEntries.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timer Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TimerIcon className="w-5 h-5" />
              Active Timer
            </CardTitle>
            <CardDescription>
              Start tracking time for your marketing tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-blue-600 mb-4">
                {formatTime(currentTimer.seconds)}
              </div>
              {plan==='free' && !currentTimer.isRunning && newEntry.channel && (newEntry.taskTitle || newEntry.description) && (
                <div className="text-xs text-muted-foreground mb-2">
                  AI estimates available on Pro — <a href="/pricing/simple" className="underline" onClick={async (e)=>{ try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('timer_upgrade_click_estimate'); } catch {} }}>Upgrade</a>
                </div>
              )}
              {estimateHint && !currentTimer.isRunning && (
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2 justify-center">
                  <span>Estimated: ~{Math.round(estimateHint.minutes)} min ({Math.round((estimateHint.confidence || 0)*100)}% conf)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('timer_apply_estimate'); } catch {}
                      const mins = Math.max(1, Math.round(estimateHint.minutes))
                      setTargetMinutes(mins)
                      try { localStorage.setItem('timer_target_minutes', String(mins)) } catch {}
                    }}
                  >
                    Apply estimate
                  </Button>
                </div>
              )}
              {targetMinutes && !currentTimer.isRunning && (
                <div className="text-xs text-blue-600 mb-2">
                  Target: {targetMinutes} min
                </div>
              )}
              {currentTimer.isRunning && newEntry.channel && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: newEntry.channel.color }}
                  />
                  <span className="text-sm font-medium">{newEntry.channel.name}</span>
                  {newEntry.taskTitle && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{newEntry.taskTitle}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2">
              {!currentTimer.isRunning ? (
                <Button 
                  onClick={startTimer}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!newEntry.channel || !newEntry.taskTitle.trim() || !newEntry.clientId || !newEntry.projectId}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={toggleTimer}
                    size="lg"
                    variant="outline"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                  <Button 
                    onClick={stopTimer}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop & Save
                  </Button>
                </>
              )}
              
              {currentTimer.seconds > 0 && (
                <Button 
                  onClick={resetTimer}
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}
            </div>

            <Separator />

            {/* Entry Form */}
            <div className="space-y-4">
              {targetMinutes !== null && (
                <div>
                  <Label htmlFor="targetDuration">Target Duration (min)</Label>
                  <Input
                    id="targetDuration"
                    type="number"
                    className="w-32 mt-1"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(Math.max(1, Number(e.target.value || 0)))}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <select 
                    id="client"
                    value={newEntry.clientId}
                    onChange={(e) => {
                      const clientId = e.target.value;
                      const client = clients.find(c => c.id === clientId);
                      setNewEntry(prev => ({ 
                        ...prev, 
                        clientId,
                        hourlyRate: client?.hourly_rate || 15000
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client...</option>
                    {clients.filter(c => c.status === 'active').map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="project">Project *</Label>
                  <select 
                    id="project"
                    value={newEntry.projectId}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      const project = projects.find(p => p.id === projectId);
                      setNewEntry(prev => ({ 
                        ...prev, 
                        projectId,
                        hourlyRate: project?.hourly_rate || prev.hourlyRate
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!newEntry.clientId}
                  >
                    <option value="">Select a project...</option>
                    {projects
                      .filter(p => !newEntry.clientId || p.client_id === newEntry.clientId)
                      .map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                  {newEntry.clientId && projects.filter(p => p.client_id === newEntry.clientId).length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No projects found for selected client. 
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-blue-600"
                        onClick={() => window.open('/projects', '_blank')}
                      >
                        Create one →
                      </Button>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Marketing Channel *</Label>
                <ChannelSelector
                  selectedChannelId={newEntry.channel?.id}
                  onChannelSelect={(channel) => setNewEntry(prev => ({ ...prev, channel }))}
                  className="w-full mt-1"
                />
              </div>

              {/* Quick Channel Selection */}
              <div>
                <Label className="text-sm text-muted-foreground">Quick Select:</Label>
                <QuickChannelSelector 
                  onChannelSelect={(channel) => setNewEntry(prev => ({ ...prev, channel }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="task">Task Title *</Label>
                <Input
                  id="task"
                  placeholder="What are you working on?"
                  value={newEntry.taskTitle}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, taskTitle: e.target.value }))}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={plan==='free'}
                    title={plan==='free' ? 'Upgrade to Pro to use AI suggestions' : undefined}
                    onClick={async () => {
                      try {
                        const text = (newEntry.taskTitle || newEntry.description || '').trim()
                        if (!text) {
                          setError('Enter a task title or description for suggestions')
                          return
                        }
                        try { const { trackEvent } = await import('@/components/analytics'); trackEvent.featureUse('timer_ai_suggest_click'); } catch {}
                        const resp = await fetch('/api/ai/parse-time-entry', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ text })
                        })
                        if (!resp.ok) throw new Error('AI suggestion unavailable')
                        const data = await resp.json()
                        setNewEntry(prev => ({
                          ...prev,
                          taskTitle: data.suggestedTitle || prev.taskTitle,
                          channel: data.channelId ? { 
                            id: data.channelId, 
                            name: data.channelId,
                            category: data.categoryId || prev.channel?.category || 'strategy-analytics',
                            description: '',
                            icon: '',
                            billableByDefault: data.billable ?? true,
                            color: prev.channel?.color || '#3b82f6'
                          } : prev.channel,
                          billable: typeof data.billable === 'boolean' ? data.billable : prev.billable
                        }))
                      } catch (e) {
                        setError('Failed to get AI suggestion. Ensure you are on Pro plan and try again.')
                      }
                    }}
                  >
                    Suggest
                  </Button>
                  {plan==='free' && (
                    <span className="text-xs text-muted-foreground">Pro required for AI suggestions — <a href="/pricing/simple" className="underline">Upgrade</a></span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about this task..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rate">Hourly Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={newEntry.hourlyRate / 100}
                    onChange={(e) => setNewEntry(prev => ({ 
                      ...prev, 
                      hourlyRate: Math.round(parseFloat(e.target.value || '0') * 100) 
                    }))}
                    className="w-32 mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billable"
                    checked={newEntry.billable}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, billable: e.target.checked }))}
                  />
                  <Label htmlFor="billable">Billable</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Time Entries</CardTitle>
            <CardDescription>
              Your tracked time for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No time entries yet today.</p>
                  <p className="text-sm">Start your first timer to see entries here.</p>
                </div>
              ) : (
                todayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: '#3b82f6' }}
                        />
                        <span className="font-medium">{entry.task_title}</span>
                        {entry.billable && (
                          <Badge variant="secondary" className="text-xs">Billable</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>{entry.marketing_channel}</span>
                        <span> • {entry.client_name}</span>
                        <span> • {entry.project_name}</span>
                      </div>
                      {entry.task_description && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.task_description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {entry.duration ? formatTime(entry.duration * 60) : '00:00:00'}
                      </div>
                      {entry.billable && entry.amount && (
                        <div className="text-sm text-green-600">
                          ${(entry.amount / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
