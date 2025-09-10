import dynamic from 'next/dynamic'
import { LucideProps } from 'lucide-react'
import { LoadingSpinner } from './loading'

// Dynamically import Lucide icons to reduce bundle size
export const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const Icon = dynamic(
    () => import('lucide-react').then((mod) => ({ default: mod[name as keyof typeof mod] })),
    {
      loading: () => <LoadingSpinner size="sm" />,
      ssr: false,
    }
  )
  
  return <Icon {...props} />
}

// Pre-loaded common icons for better performance
import { 
  Home,
  User,
  Settings,
  Timer,
  Calendar,
  ChevronRight,
  Menu,
  Search,
  Bell,
  Plus,
  Save,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'

export const Icons = {
  home: Home,
  user: User,
  settings: Settings,
  timer: Timer,
  calendar: Calendar,
  chevronRight: ChevronRight,
  menu: Menu,
  search: Search,
  bell: Bell,
  plus: Plus,
  save: Save,
  edit: Edit,
  trash: Trash2,
  eye: Eye,
  eyeOff: EyeOff,
  check: Check,
  x: X,
  alertTriangle: AlertTriangle,
  info: Info,
  chevronDown: ChevronDown,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  loader: Loader2,
} as const

export type IconName = keyof typeof Icons