'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Command, 
  Timer, 
  Plus, 
  Calendar, 
  Search, 
  HelpCircle,
  FileText,
  Settings,
  Users,
  TrendingUp,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Shortcut {
  keys: string;
  description: string;
  icon?: React.ReactNode;
  category: 'Navigation' | 'Actions' | 'Timer' | 'General';
}

const shortcuts: Shortcut[] = [
  // Timer shortcuts
  {
    keys: 'space',
    description: 'Start/Stop timer',
    icon: <Timer className="h-4 w-4" />,
    category: 'Timer'
  },
  {
    keys: 'n',
    description: 'New time entry',
    icon: <Plus className="h-4 w-4" />,
    category: 'Timer'
  },
  {
    keys: 't',
    description: 'Today view',
    icon: <Calendar className="h-4 w-4" />,
    category: 'Timer'
  },
  
  // Navigation shortcuts
  {
    keys: 'g h',
    description: 'Go to Dashboard',
    category: 'Navigation'
  },
  {
    keys: 'g t',
    description: 'Go to Timer',
    category: 'Navigation'
  },
  {
    keys: 'g c',
    description: 'Go to Clients',
    category: 'Navigation'
  },
  {
    keys: 'g p',
    description: 'Go to Projects',
    category: 'Navigation'
  },
  {
    keys: 'g r',
    description: 'Go to Reports',
    category: 'Navigation'
  },
  {
    keys: 'g s',
    description: 'Go to Settings',
    icon: <Settings className="h-4 w-4" />,
    category: 'Navigation'
  },
  
  // Actions
  {
    keys: '/',
    description: 'Focus search',
    icon: <Search className="h-4 w-4" />,
    category: 'Actions'
  },
  {
    keys: 'cmd+k, ctrl+k',
    description: 'Command palette',
    icon: <Command className="h-4 w-4" />,
    category: 'Actions'
  },
  {
    keys: 'cmd+n, ctrl+n',
    description: 'Create new (context aware)',
    icon: <Plus className="h-4 w-4" />,
    category: 'Actions'
  },
  
  // General
  {
    keys: '?',
    description: 'Show keyboard shortcuts',
    icon: <HelpCircle className="h-4 w-4" />,
    category: 'General'
  },
  {
    keys: 'esc',
    description: 'Close dialogs/Cancel',
    category: 'General'
  }
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Timer control (Space)
  useHotkeys('space', (e) => {
    e.preventDefault();
    
    // Check if user is typing in an input
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    )) {
      return;
    }
    
    setIsTimerRunning(!isTimerRunning);
    toast({
      title: isTimerRunning ? 'Timer stopped' : 'Timer started',
      description: isTimerRunning 
        ? 'Your time has been logged' 
        : 'Timer is now running',
    });
  }, {
    enableOnFormTags: false,
  });

  // New time entry (N)
  useHotkeys('n', () => {
    router.push('/timer?action=new');
    toast({
      title: 'New time entry',
      description: 'Opening time entry form',
    });
  }, {
    enableOnFormTags: false,
  });

  // Today view (T)
  useHotkeys('t', () => {
    router.push('/timesheet?view=today');
    toast({
      title: 'Today view',
      description: 'Showing today\'s time entries',
    });
  }, {
    enableOnFormTags: false,
  });

  // Navigation shortcuts (G + key)
  useHotkeys('g h', () => {
    router.push('/dashboard');
  }, {
    enableOnFormTags: false,
  });

  useHotkeys('g t', () => {
    router.push('/timer');
  }, {
    enableOnFormTags: false,
  });

  useHotkeys('g c', () => {
    router.push('/clients');
  }, {
    enableOnFormTags: false,
  });

  useHotkeys('g p', () => {
    router.push('/projects');
  }, {
    enableOnFormTags: false,
  });

  useHotkeys('g r', () => {
    router.push('/reports');
  }, {
    enableOnFormTags: false,
  });

  useHotkeys('g s', () => {
    router.push('/settings');
  }, {
    enableOnFormTags: false,
  });

  // Focus search (/)
  useHotkeys('/', (e) => {
    e.preventDefault();
    const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    } else {
      // If no search input on page, open command palette
      setCommandPaletteOpen(true);
    }
  }, {
    enableOnFormTags: false,
  });

  // Command palette (Cmd/Ctrl + K)
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    setCommandPaletteOpen(true);
  });

  // Create new (Cmd/Ctrl + N)
  useHotkeys('cmd+n, ctrl+n', (e) => {
    e.preventDefault();
    
    // Context aware - check current page
    const pathname = window.location.pathname;
    
    if (pathname.includes('/clients')) {
      router.push('/clients/new');
    } else if (pathname.includes('/projects')) {
      router.push('/projects/new');
    } else if (pathname.includes('/invoices')) {
      router.push('/invoices/new');
    } else {
      // Default to new time entry
      router.push('/timer?action=new');
    }
    
    toast({
      title: 'Creating new...',
      description: 'Opening creation form',
    });
  });

  // Show help (?)
  useHotkeys('shift+/', () => {
    setShowHelp(true);
  }, {
    enableOnFormTags: false,
  });

  // Close dialogs (Escape)
  useHotkeys('escape', () => {
    setShowHelp(false);
    setCommandPaletteOpen(false);
  });

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {shortcut.icon && (
                          <div className="text-muted-foreground">
                            {shortcut.icon}
                          </div>
                        )}
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <div className="flex gap-1">
                        {shortcut.keys.split(', ').map((key, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {index > 0 && <span className="text-xs text-muted-foreground">or</span>}
                            {key.split('+').map((k, i) => (
                              <kbd
                                key={i}
                                className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border"
                              >
                                {k === 'cmd' ? '⌘' : k === 'ctrl' ? 'Ctrl' : k === 'shift' ? '⇧' : k}
                              </kbd>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}

// Command Palette Component
function CommandPalette({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  const commands = [
    { label: 'Timer', icon: <Timer className="h-4 w-4" />, action: () => router.push('/timer') },
    { label: 'New Time Entry', icon: <Plus className="h-4 w-4" />, action: () => router.push('/timer?action=new') },
    { label: 'Clients', icon: <Users className="h-4 w-4" />, action: () => router.push('/clients') },
    { label: 'Reports', icon: <TrendingUp className="h-4 w-4" />, action: () => router.push('/reports') },
    { label: 'Settings', icon: <Settings className="h-4 w-4" />, action: () => router.push('/settings') },
    { label: 'Timesheet', icon: <FileText className="h-4 w-4" />, action: () => router.push('/timesheet') },
  ];
  
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );
  
  const executeCommand = (action: () => void) => {
    action();
    onOpenChange(false);
    setSearch('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-3 text-sm outline-none"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={index}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => executeCommand(cmd.action)}
                >
                  {cmd.icon}
                  <span>{cmd.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Navigate with arrow keys</span>
            <span>Press Enter to select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global keyboard shortcuts provider
export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KeyboardShortcuts />
      {children}
    </>
  );
}


