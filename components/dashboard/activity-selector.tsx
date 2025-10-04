'use client';

import { log } from '@/lib/logger';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Megaphone, 
  Users, 
  Code, 
  Mail, 
  TrendingUp,
  Search,
  X,
  ChevronRight,
  Clock,
  Phone,
  Edit3,
  BarChart2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  MARKETING_CATEGORIES, 
  QUICK_TEMPLATES,
  getCategoryIcon,
  searchActivities,
  type MarketingCategory 
} from '@/lib/constants/marketing-categories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivitySelectorProps {
  value?: {
    category: string;
    activity: string;
  };
  onSelect: (category: string, activity: string) => void;
  onQuickTemplate?: (template: typeof QUICK_TEMPLATES[0]) => void;
  className?: string;
}

export function ActivitySelector({ 
  value, 
  onSelect, 
  onQuickTemplate,
  className 
}: ActivitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MarketingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivities, setRecentActivities] = useState<Array<{
    category: string;
    activity: string;
    timestamp: number;
  }>>([]);

  // Load recent activities from encrypted localStorage
  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const { safeLocalStorage } = await import('@/lib/utils/encryption')
        const stored = await safeLocalStorage.getItem<Array<{
          category: string;
          activity: string;
          timestamp: number;
        }>>('recentActivities')
        if (stored) {
          setRecentActivities(stored)
        }
      } catch (error) {
        log.error('Failed to load recent activities:', error)
      }
    }
    
    loadRecentActivities()
  }, []);

  // Save recent activity with encryption
  const saveRecentActivity = async (category: string, activity: string) => {
    const newRecent = [
      { category, activity, timestamp: Date.now() },
      ...recentActivities.filter(r => 
        !(r.category === category && r.activity === activity)
      )
    ].slice(0, 5); // Keep only 5 most recent
    
    setRecentActivities(newRecent);
    
    try {
      const { safeLocalStorage } = await import('@/lib/utils/encryption')
      await safeLocalStorage.setItem('recentActivities', newRecent)
    } catch (error) {
      log.error('Failed to save recent activities:', error)
    }
  };

  // Get search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchActivities(searchQuery);
  }, [searchQuery]);

  // Handle activity selection
  const handleActivitySelect = (category: string, activity: string) => {
    onSelect(category, activity);
    saveRecentActivity(category, activity);
    setIsOpen(false);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Handle quick template selection
  const handleQuickTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    if (onQuickTemplate) {
      onQuickTemplate(template);
    } else {
      handleActivitySelect(template.category, template.activity);
    }
  };

  // Reset modal state when closed
  const handleClose = () => {
    setIsOpen(false);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const iconComponents: Record<string, any> = {
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

  return (
    <>
      {/* Main Button/Display */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full justify-between text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">
          {value ? (
            <span className="flex items-center gap-2">
              <span style={{ color: MARKETING_CATEGORIES[value.category as MarketingCategory]?.color }}>
                {value.activity}
              </span>
              <Badge variant="secondary" className="text-xs">
                {MARKETING_CATEGORIES[value.category as MarketingCategory]?.label}
              </Badge>
            </span>
          ) : (
            "Select activity..."
          )}
        </span>
        <ChevronRight className="h-4 w-4 opacity-50" />
      </Button>

      {/* Selection Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {selectedCategory 
                ? MARKETING_CATEGORIES[selectedCategory].label
                : "Select Activity"
              }
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Templates (shown when no category selected and no search) */}
            {!selectedCategory && !searchQuery && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Quick Templates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_TEMPLATES.map((template) => {
                    const Icon = iconComponents[template.icon] || Clock;
                    return (
                      <Button
                        key={template.label}
                        variant="outline"
                        className="justify-start gap-3 h-auto py-3"
                        onClick={() => handleQuickTemplate(template)}
                      >
                        <Icon className="h-4 w-4" style={{ color: MARKETING_CATEGORIES[template.category as MarketingCategory].color }} />
                        <div className="text-left">
                          <div className="font-medium">{template.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.duration} min
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activities (shown when no category selected and no search) */}
            {!selectedCategory && !searchQuery && recentActivities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Recent</h3>
                <div className="space-y-1">
                  {recentActivities.map((recent, idx) => {
                    const category = MARKETING_CATEGORIES[recent.category as MarketingCategory];
                    if (!category) return null;
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-auto py-2"
                        onClick={() => handleActivitySelect(recent.category, recent.activity)}
                      >
                        <Clock className="h-3 w-3" style={{ color: category.color }} />
                        <span>{recent.activity}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {category.label}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => {
                      const category = MARKETING_CATEGORIES[result.category];
                      return (
                        <Button
                          key={idx}
                          variant="ghost"
                          className="w-full justify-start gap-2 h-auto py-2"
                          onClick={() => handleActivitySelect(result.category, result.activity)}
                        >
                          <span>{result.activity}</span>
                          <Badge 
                            variant="secondary" 
                            className="ml-auto text-xs"
                            style={{ borderColor: category.color, color: category.color }}
                          >
                            {category.label}
                          </Badge>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No activities found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Category Grid (shown when no category selected and no search) */}
            {!selectedCategory && !searchQuery && (
              <>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(MARKETING_CATEGORIES).map(([key, category]) => {
                    const Icon = iconComponents[category.icon] || FileText;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key as MarketingCategory)}
                        className="group relative rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/50"
                        style={{ borderColor: category.color + '30' }}
                      >
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
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight mb-1">
                              {category.label}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {category.activities.length} activities
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Activities List (shown when category is selected) */}
            {selectedCategory && !searchQuery && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="mb-4"
                >
                  ← Back to categories
                </Button>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    {MARKETING_CATEGORIES[selectedCategory].activities.map((activity) => (
                      <Button
                        key={activity}
                        variant="ghost"
                        className="w-full justify-start h-auto py-3"
                        onClick={() => handleActivitySelect(selectedCategory, activity)}
                      >
                        {activity}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

