'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { MARKETING_CATEGORIES, MarketingChannel, MarketingCategory, getAllChannels, getChannelById } from '@/lib/constants/marketing-channels'
import { cn } from '@/lib/utils'

interface ChannelSelectorProps {
  selectedChannelId?: string
  onChannelSelect: (channel: MarketingChannel) => void
  className?: string
  placeholder?: string
}

export function ChannelSelector({ 
  selectedChannelId, 
  onChannelSelect, 
  className,
  placeholder = "Select marketing channel..."
}: ChannelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedChannel = selectedChannelId ? getChannelById(selectedChannelId) : null
  const allChannels = getAllChannels()

  // Filter channels based on search query
  const filteredChannels = searchQuery
    ? allChannels.filter(channel => 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allChannels

  // Group filtered channels by category
  const filteredByCategory = MARKETING_CATEGORIES.map(category => ({
    ...category,
    channels: filteredChannels.filter(channel => channel.category === category.id)
  })).filter(category => category.channels.length > 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedChannel ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: selectedChannel.color }}
              />
              <span className="truncate">{selectedChannel.name}</span>
              <Badge variant="outline" className="text-xs">
                {MARKETING_CATEGORIES.find(cat => cat.id === selectedChannel.category)?.name}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search channels..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filteredByCategory.length === 0 ? (
              <CommandEmpty>No channels found.</CommandEmpty>
            ) : (
              filteredByCategory.map((category) => (
                <CommandGroup key={category.id} heading={category.name}>
                  {category.channels.map((channel) => (
                    <CommandItem
                      key={channel.id}
                      onSelect={() => {
                        onChannelSelect(channel)
                        setOpen(false)
                      }}
                      className="flex items-start gap-3 p-3 cursor-pointer"
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" 
                        style={{ backgroundColor: channel.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          {channel.billableByDefault && (
                            <Badge variant="secondary" className="text-xs">Billable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {channel.description}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Quick channel selector for common channels
interface QuickChannelSelectorProps {
  onChannelSelect: (channel: MarketingChannel) => void
  className?: string
}

export function QuickChannelSelector({ onChannelSelect, className }: QuickChannelSelectorProps) {
  // Most commonly used channels for quick access
  const quickChannels = [
    'google-ads',
    'meta-ads', 
    'blog-writing',
    'social-media-management',
    'email-campaigns',
    'strategy-planning',
    'client-meetings'
  ].map(id => getChannelById(id)).filter(Boolean) as MarketingChannel[]

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {quickChannels.map((channel) => (
        <Button
          key={channel.id}
          variant="outline"
          size="sm"
          onClick={() => onChannelSelect(channel)}
          className="h-8 px-3 text-xs"
        >
          <div 
            className="w-2 h-2 rounded-full mr-2" 
            style={{ backgroundColor: channel.color }}
          />
          {channel.name}
        </Button>
      ))}
    </div>
  )
}