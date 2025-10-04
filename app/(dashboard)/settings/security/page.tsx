'use client';

import { log } from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone,
  Monitor,
  Globe,
  AlertTriangle,
  CheckCircle,
  X,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  Lock,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import type { UserSession } from '@/types/team';

// Mock data
const mockSessions: UserSession[] = [
  {
    id: '1',
    userId: '1',
    deviceName: 'Chrome on Windows',
    browser: 'Chrome 119',
    os: 'Windows 11',
    ipAddress: '192.168.1.100',
    location: 'New York, USA',
    lastActive: new Date(),
    createdAt: new Date(Date.now() - 86400000),
    isCurrent: true
  },
  {
    id: '2',
    userId: '1',
    deviceName: 'Safari on iPhone',
    browser: 'Safari 17',
    os: 'iOS 17.1',
    ipAddress: '192.168.1.101',
    location: 'New York, USA',
    lastActive: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 172800000),
    isCurrent: false
  },
  {
    id: '3',
    userId: '1',
    deviceName: 'Chrome on MacBook',
    browser: 'Chrome 119',
    os: 'macOS Sonoma',
    ipAddress: '192.168.1.102',
    location: 'Boston, USA',
    lastActive: new Date(Date.now() - 7200000),
    createdAt: new Date(Date.now() - 604800000),
    isCurrent: false
  }
];

interface TwoFactorStatus {
  enabled: boolean;
  enabledAt: string | null;
  lastUsed: string | null;
  backupCodesRemaining: number;
}

interface TwoFactorSetupState {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>(mockSessions);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupState | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isDisableLoading, setIsDisableLoading] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 25) return { label: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { label: 'Fair', color: 'bg-orange-500' };
    if (strength <= 75) return { label: 'Good', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  const loadTwoFactorStatus = useCallback(async () => {
    try {
      setIsTwoFactorLoading(true);
      const response = await fetch('/api/settings/security/2fa/status', { cache: 'no-store' })

      if (response.status === 401) {
        setTwoFactorStatus(null)
        setTwoFactorEnabled(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const body = await response.json()
      setTwoFactorStatus(body.data)
      setTwoFactorEnabled(body.data?.enabled ?? false)
    } catch (error) {
      log.error('Failed to load 2FA status:', error)
      toast({
        title: 'Error',
        description: 'Unable to load two-factor status.',
        variant: 'destructive',
      })
    } finally {
      setIsTwoFactorLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadTwoFactorStatus()
  }, [loadTwoFactorStatus])

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 50) {
      toast({
        title: "Error",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA setup
  const handle2FASetup = async () => {
    setIsSetupLoading(true)
    try {
      const response = await fetch('/api/settings/security/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to configure two-factor authentication.',
          variant: 'destructive',
        })
        return
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const body = await response.json()
      setSetupData(body.data)
      setBackupCodes(body.data?.backupCodes ?? [])
      setVerificationCode('')
      setShowQrCode(true)
    } catch (error) {
      log.error('Failed to start 2FA setup:', error)
      toast({
        title: 'Error',
        description: 'Failed to start two-factor setup. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSetupLoading(false)
    }
  }

  // Verify 2FA code
  const verify2FACode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      })
      return
    }

    setIsVerifyLoading(true)
    try {
      const response = await fetch('/api/settings/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to configure two-factor authentication.',
            variant: 'destructive',
          })
          return
        }
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || `Request failed with status ${response.status}`)
      }

      const body = await response.json()
      const codesFromSetup = setupData?.backupCodes ?? []
      setTwoFactorEnabled(true)
      setTwoFactorStatus(body.status)
      setShowQrCode(false)
      setShowBackupCodes(true)
      setVerificationCode('')
      setSetupData(null)
      if (codesFromSetup.length) {
        setBackupCodes(codesFromSetup)
      }
      toast({
        title: 'Two-factor enabled',
        description: 'Authentication codes are now required when signing in.',
      })
      await loadTwoFactorStatus()
    } catch (error) {
      log.error('Failed to verify 2FA code:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid verification code. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsVerifyLoading(false)
    }
  }

  // Disable 2FA
  const disable2FA = async () => {
    setIsDisableLoading(true)
    try {
      const response = await fetch('/api/settings/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to configure two-factor authentication.',
          variant: 'destructive',
        })
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || `Request failed with status ${response.status}`)
      }

      const body = await response.json()
      setTwoFactorEnabled(false)
      setTwoFactorStatus(body.status)
      setSetupData(null)
      setBackupCodes([])
      setShowBackupCodes(false)
      toast({
        title: 'Two-factor disabled',
        description: 'Two-factor authentication has been disabled.',
      })
    } catch (error) {
      log.error('Failed to disable 2FA:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disable two-factor authentication.',
        variant: 'destructive',
      })
    } finally {
      await loadTwoFactorStatus()
      setIsDisableLoading(false)
    }
  }

  // End session
  const endSession = async (sessionId: string) => {
    try {
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      toast({
        title: "Session ended",
        description: "The session has been terminated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session.",
        variant: "destructive",
      });
    }
  };

  // End all other sessions
  const endAllOtherSessions = async () => {
    try {
      setSessions(sessions.filter(s => s.isCurrent));
      
      toast({
        title: "Sessions ended",
        description: "All other sessions have been terminated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end sessions.",
        variant: "destructive",
      });
    }
  };

  const generateBackupCodes = async () => {
    if (!twoFactorEnabled) {
      toast({
        title: 'Two-factor not enabled',
        description: 'Enable two-factor authentication before generating backup codes.',
        variant: 'destructive',
      })
      return
    }

    setIsBackupLoading(true)
    try {
      const response = await fetch('/api/settings/security/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to manage backup codes.',
          variant: 'destructive',
        })
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || `Request failed with status ${response.status}`)
      }

      const body = await response.json()
      setBackupCodes(body.backupCodes || [])
      setShowBackupCodes(true)
      if (body.status) {
        setTwoFactorStatus(body.status)
        setTwoFactorEnabled(body.status.enabled)
      }
      toast({
        title: 'Backup codes refreshed',
        description: 'Store these new backup codes in a secure location.',
      })
    } catch (error) {
      log.error('Failed to generate backup codes:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate backup codes.',
        variant: 'destructive',
      })
    } finally {
      await loadTwoFactorStatus()
      setIsBackupLoading(false)
    }
  }

  // Copy backup codes
  const copyBackupCodes = () => {
    if (!backupCodes.length) {
      toast({
        title: 'No backup codes available',
        description: 'Generate backup codes before copying.',
        variant: 'destructive',
      })
      return
    }

    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast({
      title: 'Copied',
      description: 'Backup codes copied to clipboard.',
    })
  }

  // Download backup codes
  const downloadBackupCodes = () => {
    if (!backupCodes.length) {
      toast({
        title: 'No backup codes available',
        description: 'Generate backup codes before downloading.',
        variant: 'destructive',
      })
      return
    }

    const element = document.createElement('a')
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'trackflow-backup-codes.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: 'Downloaded',
      description: 'Backup codes saved to file.',
    })
  }

  const formatLastActive = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Active now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and authentication settings
        </p>
      </div>

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password regularly to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {passwordForm.newPassword && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className={`font-medium ${
                        passwordStrength <= 25 ? 'text-red-500' :
                        passwordStrength <= 50 ? 'text-orange-500' :
                        passwordStrength <= 75 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                        • At least 8 characters
                      </p>
                      <p className={/[a-z]/.test(passwordForm.newPassword) && /[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        • Mix of uppercase and lowercase letters
                      </p>
                      <p className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        • Include numbers
                      </p>
                      <p className={/[^a-zA-Z0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        • Include special characters
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Confirm your new password"
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords don't match</p>
                )}
              </div>

              <Button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Tips</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>• Use a unique password that you don't use elsewhere</p>
                  <p>• Consider using a password manager</p>
                  <p>• Change your password if you suspect it's been compromised</p>
                  <p>• Never share your password with anyone</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTwoFactorLoading ? (
                <div className="py-6 text-center text-muted-foreground">
                  Checking two-factor status…
                </div>
              ) : !twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                        <Smartphone className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                      </div>
                      <div>
                        <p className="font-medium">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Use an authenticator app to generate verification codes
                        </p>
                      </div>
                    </div>
                    <Button onClick={handle2FASetup} disabled={isSetupLoading}>
                      {isSetupLoading ? 'Preparing…' : 'Set Up'}
                    </Button>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Why use 2FA?</AlertTitle>
                    <AlertDescription className="mt-2">
                      Two-factor authentication adds an extra layer of security by requiring a verification code
                      in addition to your password when signing in from a new device.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication Enabled</p>
                        <p className="text-sm text-muted-foreground">
                          Your account is protected with 2FA
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Backup codes remaining: {twoFactorStatus?.backupCodesRemaining ?? 0}
                        </p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={isDisableLoading}>
                          {isDisableLoading ? 'Disabling…' : 'Disable 2FA'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to disable 2FA? This will make your account less secure.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive" onClick={disable2FA}>
                            Disable 2FA
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Backup Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use these codes to access your account if you lose access to your authenticator app
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={generateBackupCodes} disabled={isBackupLoading}>
                          {isBackupLoading ? 'Generating…' : 'View Backup Codes'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={generateBackupCodes} disabled={isBackupLoading}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {isBackupLoading ? 'Refreshing…' : 'Regenerate Codes'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Devices and locations where you're currently signed in
                  </CardDescription>
                </div>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={endAllOtherSessions}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out all other sessions
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        session.isCurrent ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Monitor className={`h-5 w-5 ${
                          session.isCurrent ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.deviceName}</p>
                          {session.isCurrent && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.ipAddress}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatLastActive(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => endSession(session.id)}
                      >
                        End Session
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unrecognized session?</AlertTitle>
            <AlertDescription>
              If you see a session you don't recognize, end it immediately and change your password.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog for 2FA Setup */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg flex justify-center">
              {setupData?.qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={setupData.qrCode} alt="Two-factor authentication QR code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  Preparing…
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Can't scan? Enter this code manually:</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {setupData?.secret ? setupData.secret.match(/.{1,4}/g)?.join(' ') : 'Loading secret…'}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (!setupData?.secret) return
                    navigator.clipboard.writeText(setupData.secret)
                    toast({ title: 'Copied', description: 'Secret key copied to clipboard.' })
                  }}
                  disabled={!setupData?.secret}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enter verification code</Label>
              <Input
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <Button 
              className="w-full"
              onClick={verify2FACode}
              disabled={verificationCode.length !== 6 || isVerifyLoading}
            >
              {isVerifyLoading ? 'Verifying…' : 'Verify and Enable 2FA'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Recovery Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Store these codes securely. You'll need them if you lose access to your authenticator app.
              </AlertDescription>
            </Alert>
            
            {backupCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Generate new backup codes to display them here.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded">
                    {code}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyBackupCodes}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadBackupCodes}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Button className="w-full" onClick={() => setShowBackupCodes(false)}>
              I've Saved My Codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
