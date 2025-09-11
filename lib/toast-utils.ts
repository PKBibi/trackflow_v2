import { toast } from '@/components/ui/use-toast'
import { CheckCircle, XCircle, Info, AlertTriangle, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          {title}
        </div>
      ) as any,
      description,
      duration,
      action: action ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="border-green-200 hover:bg-green-50"
        >
          {action.label}
        </Button>
      ) : undefined,
    })
  },

  error: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 6000 } = options
    
    toast({
      title: (
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600" />
          {title}
        </div>
      ) as any,
      description,
      duration,
      variant: 'destructive',
      action: action ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="border-red-200 hover:bg-red-50"
        >
          {action.label}
        </Button>
      ) : undefined,
    })
  },

  warning: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 5000 } = options
    
    toast({
      title: (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          {title}
        </div>
      ) as any,
      description,
      duration,
      action: action ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="border-amber-200 hover:bg-amber-50"
        >
          {action.label}
        </Button>
      ) : undefined,
    })
  },

  info: (options: EnhancedToastOptions) => {
    const { title, description, action, duration = 4000 } = options
    
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          {title}
        </div>
      ) as any,
      description,
      duration,
      action: action ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="border-blue-200 hover:bg-blue-50"
        >
          {action.label}
        </Button>
      ) : undefined,
    })
  },

  loading: (options: { title: string; description?: string }) => {
    const { title, description } = options
    
    return toast({
      title: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          {title}
        </div>
      ) as any,
      description,
      duration: Infinity, // Keep until dismissed
    })
  },

  download: (options: EnhancedToastOptions & { fileUrl?: string }) => {
    const { title, description, fileUrl, duration = 8000 } = options
    
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-green-600" />
          {title}
        </div>
      ) as any,
      description,
      duration,
      action: fileUrl ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(fileUrl, '_blank')}
          className="border-green-200 hover:bg-green-50"
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      ) : undefined,
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