'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Shield, Download, CheckCircle, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')
  const [understood, setUnderstood] = useState({
    dataLoss: false,
    noRecovery: false,
    cancelSubscription: false,
    exportData: false
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const supabase = createClient()

  const allUnderstood = Object.values(understood).every(v => v)
  const confirmationCorrect = confirmationText === 'DELETE MY ACCOUNT'

  const consequences = [
    {
      icon: Trash2,
      title: 'Permanent Data Deletion',
      description: 'All your data including time entries, projects, invoices, and reports will be permanently deleted.',
      color: 'text-red-600'
    },
    {
      icon: X,
      title: 'No Recovery Possible',
      description: 'This action cannot be undone. We cannot recover your account or data once deleted.',
      color: 'text-orange-600'
    },
    {
      icon: Shield,
      title: 'Active Subscriptions',
      description: 'Any active subscriptions will be cancelled and you will lose access to premium features.',
      color: 'text-yellow-600'
    },
    {
      icon: Download,
      title: 'Export Your Data First',
      description: 'Make sure to export all your important data before proceeding with account deletion.',
      color: 'text-blue-600'
    }
  ]

  const sendVerificationCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Send verification code to user's email
      await fetch('/api/account/send-deletion-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      })

      setCodeSent(true)
      toast({
        title: 'Verification Code Sent',
        description: 'Check your email for the verification code'
      })
    } catch (error) {
      console.error('Error sending verification code:', error)
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive'
      })
    }
  }

  const deleteAccount = async () => {
    if (!allUnderstood || !confirmationCorrect || !password || !verificationCode) {
      return
    }

    setDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password
      })

      if (signInError) {
        throw new Error('Invalid password')
      }

      // Delete account via API
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode,
          confirmation: confirmationText
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete account')
      }

      // Sign out
      await supabase.auth.signOut()

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted'
      })

      // Redirect to homepage
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600">Delete Account</h1>
        <p className="text-muted-foreground mt-2">
          Permanently delete your account and all associated data
        </p>
      </div>

      {/* Warning Alert */}
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Danger Zone</AlertTitle>
        <AlertDescription>
          Account deletion is permanent and cannot be undone. Please read all information carefully before proceeding.
        </AlertDescription>
      </Alert>

      {/* Consequences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What Happens When You Delete Your Account</CardTitle>
          <CardDescription>
            Please understand the following consequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consequences.map((consequence, index) => {
              const Icon = consequence.icon
              return (
                <div key={index} className="flex gap-4">
                  <div className={`mt-1 ${consequence.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{consequence.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {consequence.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Export Reminder */}
      <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data First
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Before deleting your account, we recommend exporting all your data for your records.
          </p>
          <Button variant="outline" onClick={() => router.push('/settings/export')}>
            Go to Data Export
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Confirm Account Deletion</CardTitle>
          <CardDescription>
            Complete all steps to delete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Acknowledge Understanding */}
          <div className="space-y-3">
            <Label>Step 1: I understand that...</Label>
            <div className="space-y-3 pl-4">
              <Label className="flex items-start gap-2 font-normal">
                <Checkbox
                  checked={understood.dataLoss}
                  onCheckedChange={(checked) => 
                    setUnderstood({ ...understood, dataLoss: checked as boolean })
                  }
                />
                <span className="text-sm">
                  All my data will be permanently deleted and cannot be recovered
                </span>
              </Label>
              <Label className="flex items-start gap-2 font-normal">
                <Checkbox
                  checked={understood.noRecovery}
                  onCheckedChange={(checked) => 
                    setUnderstood({ ...understood, noRecovery: checked as boolean })
                  }
                />
                <span className="text-sm">
                  This action is irreversible and my account cannot be restored
                </span>
              </Label>
              <Label className="flex items-start gap-2 font-normal">
                <Checkbox
                  checked={understood.cancelSubscription}
                  onCheckedChange={(checked) => 
                    setUnderstood({ ...understood, cancelSubscription: checked as boolean })
                  }
                />
                <span className="text-sm">
                  Any active subscriptions will be cancelled immediately
                </span>
              </Label>
              <Label className="flex items-start gap-2 font-normal">
                <Checkbox
                  checked={understood.exportData}
                  onCheckedChange={(checked) => 
                    setUnderstood({ ...understood, exportData: checked as boolean })
                  }
                />
                <span className="text-sm">
                  I have exported any data I want to keep
                </span>
              </Label>
            </div>
          </div>

          {/* Step 2: Type Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Step 2: Type "DELETE MY ACCOUNT" to confirm
            </Label>
            <Input
              id="confirmation"
              placeholder="Type the confirmation text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={confirmationCorrect ? 'border-green-500' : ''}
            />
            {confirmationText && !confirmationCorrect && (
              <p className="text-sm text-red-600">
                Text doesn't match. Please type exactly: DELETE MY ACCOUNT
              </p>
            )}
          </div>

          {/* Step 3: Enter Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Step 3: Enter your password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Step 4: Verification Code */}
          <div className="space-y-2">
            <Label>Step 4: Email Verification</Label>
            {!codeSent ? (
              <Button
                variant="outline"
                onClick={sendVerificationCode}
                disabled={!allUnderstood || !confirmationCorrect || !password}
              >
                Send Verification Code
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter verification code from email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sendVerificationCode}
                >
                  Resend Code
                </Button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!allUnderstood || !confirmationCorrect || !password || !verificationCode}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Permanently Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Final Confirmation
            </DialogTitle>
            <DialogDescription>
              This is your last chance to cancel. Are you absolutely sure you want to delete your account?
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This action cannot be undone</AlertTitle>
            <AlertDescription>
              Your account and all data will be permanently deleted in 10 seconds after confirmation.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, Delete Everything
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

