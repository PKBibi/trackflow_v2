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

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
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
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload today's entries
  const reloadTodayEntries = async () => {
    try {
      const entries = await timeEntriesAPI.getToday();
      setTodayEntries(entries);
    } catch (err) {
      console.error('Failed to reload today entries:', err);
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
      
      // Stop any existing running timers first
      await timeEntriesAPI.stopAllRunningTimers();

      const startTime = new Date();
      
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start timer');
      console.error('Failed to start timer:', err);
    }
  };

  // Stop timer and save entry
  const stopTimer = async () => {
    if (!currentTimer.currentEntryId || !currentTimer.startTime) {
      return;
    }

    try {
      setError(null);
      
      const endTime = new Date();
      
      // Update the time entry in database
      await timeEntriesAPI.update(currentTimer.currentEntryId, {
        end_time: endTime.toISOString(),
        is_timer_running: false,
        status: 'stopped'
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
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop timer');
      console.error('Failed to stop timer:', err);
    }
  };

  // Pause/Resume timer
  const toggleTimer = async () => {
    if (!currentTimer.currentEntryId) {
      return;
    }

    try {
      setError(null);
      const newIsRunning = !currentTimer.isRunning;
      
      await timeEntriesAPI.update(currentTimer.currentEntryId, {
        is_timer_running: newIsRunning
      });

      setCurrentTimer(prev => ({
        ...prev,
        isRunning: newIsRunning
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle timer');
      console.error('Failed to toggle timer:', err);
    }
  };

  // Reset timer
  const resetTimer = async () => {
    if (currentTimer.currentEntryId) {
      try {
        // Delete the current entry if it exists
        await timeEntriesAPI.delete(currentTimer.currentEntryId);
      } catch (err) {
        console.error('Failed to delete timer entry:', err);
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
  }, [currentTimer.isRunning]);

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
                          {project.campaign_platform && ` (${project.campaign_platform})`}
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
                        onClick={() => window.open('/dashboard/projects', '_blank')}
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