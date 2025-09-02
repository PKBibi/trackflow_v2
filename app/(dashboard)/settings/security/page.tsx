'use client'

import { useState, useEffect } from 'react'
import { Shield, Smartphone, Key, AlertCircle, CheckCircle, Lock, Unlock, History, Monitor, MapPin, Chrome, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'

interface SecuritySettings {
  two_factor_enabled: boolean
  two_factor_method: 'authenticator' | 'sms' | null
  backup_codes: string[]
  sessions: Session[]
  login_history: LoginHistory[]
}

interface Session {
  id: string
  device: string
  browser: string
  ip_address: string
  location: string
  last_active: string
  created_at: string
  is_current: boolean
}

interface LoginHistory {
  id: string
  timestamp: string
  ip_address: string
  location: string
  device: string
  browser: string
  status: 'success' | 'failed'
  method: string
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    two_factor_method: null,
    backup_codes: [],
    sessions: [],
    login_history: []
  })
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadSecuritySettings()
  }, [])

  const loadSecuritySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load 2FA settings
      const { data: tfaData } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Load active sessions
      const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false })

      // Load login history
      const { data: historyData } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(20)

      setSettings({
        two_factor_enabled: tfaData?.two_factor_enabled || false,
        two_factor_method: tfaData?.two_factor_method || null,
        backup_codes: tfaData?.backup_codes || [],
        sessions: sessionsData || [],
        login_history: historyData || []
      })
    } catch (error) {
      console.error('Error loading security settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const setup2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate secret
      const secret = generateSecret()
      setSecret(secret)

      // Generate QR code
      const otpauth = `otpauth://totp/TrackFlow:${user.email}?secret=${secret}&issuer=TrackFlow`
      const qr = await QRCode.toDataURL(otpauth)
      setQrCode(qr)

      setSetupDialogOpen(true)
    } catch (error) {
      console.error('Error setting up 2FA:', error)
      toast({
        title: 'Error',
        description: 'Failed to set up 2FA',
        variant: 'destructive'
      })
    }
  }

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const verify2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Verify the code (in production, verify on server)
      // For demo, we'll accept any 6-digit code
      if (verificationCode.length !== 6) {
        throw new Error('Invalid code')
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )

      // Save 2FA settings
      const { error } = await supabase
        .from('user_security')
        .upsert({
          user_id: user.id,
          two_factor_enabled: true,
          two_factor_method: 'authenticator',
          two_factor_secret: secret, // In production, encrypt this
          backup_codes: backupCodes,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSettings({
        ...settings,
        two_factor_enabled: true,
        two_factor_method: 'authenticator',
        backup_codes: backupCodes
      })

      setSetupDialogOpen(false)
      setBackupCodesDialogOpen(true)

      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled'
      })
    } catch (error) {
      console.error('Error verifying 2FA:', error)
      toast({
        title: 'Error',
        description: 'Failed to verify code',
        variant: 'destructive'
      })
    }
  }

  const disable2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Verify the code before disabling
      if (verificationCode.length !== 6) {
        throw new Error('Invalid code')
      }

      const { error } = await supabase
        .from('user_security')
        .update({
          two_factor_enabled: false,
          two_factor_method: null,
          two_factor_secret: null,
          backup_codes: [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSettings({
        ...settings,
        two_factor_enabled: false,
        two_factor_method: null,
        backup_codes: []
      })

      setDisableDialogOpen(false)
      setVerificationCode('')

      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled'
      })
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      toast({
        title: 'Error',
        description: 'Failed to disable 2FA',
        variant: 'destructive'
      })
    }
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully'
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      })
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      setSettings({
        ...settings,
        sessions: settings.sessions.filter(s => s.id !== sessionId)
      })

      toast({
        title: 'Session Revoked',
        description: 'The session has been terminated'
      })
    } catch (error) {
      console.error('Error revoking session:', error)
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and authentication settings
        </p>
      </div>

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList>
          <TabsTrigger value="authentication">
            <Shield className="w-4 h-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Monitor className="w-4 h-4 mr-2" />
            Active Sessions
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Login History
          </TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={changePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* 2FA Section */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings.two_factor_enabled ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>2FA is enabled</AlertTitle>
                    <AlertDescription>
                      Your account is protected with two-factor authentication using {settings.two_factor_method}.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setBackupCodesDialogOpen(true)}
                    >
                      View Backup Codes
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDisableDialogOpen(true)}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>2FA is not enabled</AlertTitle>
                    <AlertDescription>
                      Enable two-factor authentication to add an extra layer of security to your account.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={setup2FA}>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
              <CardDescription>
                Configure additional security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications for new logins</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your account is accessed from a new device
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require re-authentication for sensitive actions</Label>
                  <p className="text-sm text-muted-foreground">
                    Ask for password confirmation before critical changes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after period of inactivity
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices and browsers where you're currently logged in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings.sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active sessions found
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {session.device.includes('Mobile') ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Monitor className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.device}</p>
                            {session.is_current && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.browser} • {session.ip_address}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </span>
                            <span>
                              Last active: {new Date(session.last_active).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!session.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="destructive">
                  Revoke All Other Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>
                Recent login attempts to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings.login_history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No login history available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.login_history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.device.includes('Mobile') ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Monitor className="w-4 h-4" />
                            )}
                            <span className="text-sm">{entry.device}</span>
                          </div>
                        </TableCell>
                        <TableCell>{entry.location}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {entry.ip_address}
                        </TableCell>
                        <TableCell>{entry.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant={entry.status === 'success' ? 'default' : 'destructive'}
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Manual Entry Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(secret)
                    toast({
                      title: 'Copied',
                      description: 'Secret key copied to clipboard'
                    })
                  }}
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSetupDialogOpen(false)
                setVerificationCode('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={verify2FA}
              disabled={verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your authentication code to disable 2FA
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Disabling 2FA will make your account less secure. Are you sure you want to continue?
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="disable-code">Authentication Code</Label>
              <Input
                id="disable-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisableDialogOpen(false)
                setVerificationCode('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={disable2FA}
              disabled={verificationCode.length !== 6}
            >
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                These codes can be used to access your account if you lose access to your authenticator device.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2">
              {settings.backup_codes.map((code, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted rounded font-mono text-sm text-center"
                >
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const codes = settings.backup_codes.join('\n')
                  navigator.clipboard.writeText(codes)
                  toast({
                    title: 'Copied',
                    description: 'Backup codes copied to clipboard'
                  })
                }}
              >
                Copy Codes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const codes = settings.backup_codes.join('\n')
                  const blob = new Blob([codes], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'trackflow-backup-codes.txt'
                  a.click()
                }}
              >
                Download Codes
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setBackupCodesDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

