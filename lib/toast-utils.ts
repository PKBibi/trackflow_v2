import { toast } from '@/components/ui/use-toast'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface EnhancedToastOptions {
  title: string
  description?: string
  action?: ToastAction
  duration?: number
}

export const toastUtils = {
  success: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 5000 } = options
    
    toast({
      title: `✓ ${title}`,
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
    })
  },

  error: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 6000 } = options
    
    toast({
      title: `✗ ${title}`,
      description,
      duration,
      variant: 'destructive',
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
    })
  },

  warning: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 5000 } = options
    
    toast({
      title: `⚠ ${title}`,
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
    })
  },

  info: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 4000 } = options
    
    toast({
      title: `ℹ ${title}`,
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
    })
  },

  loading: (options: { title: string; description?: string }) => {
    const { title, description } = options
    
    return toast({
      title: `⏳ ${title}`,
      description,
      duration: Infinity, // Keep until dismissed
    })
  },

  download: (options: EnhancedToastOptions & { fileUrl?: string }) => {
    const { title, description, fileUrl, duration = 8000 } = options
    
    toast({
      title: `⬇ ${title}`,
      description,
      duration,
      action: fileUrl ? {
        label: 'Download',
        onClick: () => window.open(fileUrl, '_blank')
      } : undefined,
    })
  },

  // Quick methods for common use cases
  exportSuccess: (fileName: string, fileUrl?: string) => {
    toastUtils.download({
      title: 'Export completed',
      description: `${fileName} is ready for download`,
      fileUrl,
    })
  },

  exportError: (retry?: () => void) => {
    toastUtils.error({
      title: 'Export failed',
      description: 'Unable to generate export. Please try again.',
      action: retry ? { label: 'Retry', onClick: retry } : undefined,
    })
  },

  saveSuccess: (itemName?: string) => {
    toastUtils.success({
      title: 'Saved successfully',
      description: itemName ? `${itemName} has been saved` : undefined,
    })
  },

  saveError: (retry?: () => void) => {
    toastUtils.error({
      title: 'Save failed',
      description: 'Unable to save changes. Please try again.',
      action: retry ? { label: 'Retry', onClick: retry } : undefined,
    })
  },

  deleteSuccess: (itemName?: string) => {
    toastUtils.success({
      title: 'Deleted successfully',
      description: itemName ? `${itemName} has been deleted` : undefined,
    })
  },

  deleteError: () => {
    toastUtils.error({
      title: 'Delete failed',
      description: 'Unable to delete item. Please try again.',
    })
  },

  copySuccess: (content?: string) => {
    toastUtils.success({
      title: 'Copied to clipboard',
      description: content ? `${content} copied` : undefined,
      duration: 2000,
    })
  },

  updateAvailable: (onRefresh: () => void) => {
    toastUtils.info({
      title: 'Update available',
      description: 'A new version is available. Refresh to get the latest features.',
      action: { label: 'Refresh', onClick: onRefresh },
      duration: 10000,
    })
  },
}