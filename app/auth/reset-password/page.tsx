'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code') || ''
  const supabase = useMemo(() => createClient(), [])

  const [status, setStatus] = useState<'exchanging' | 'ready' | 'updating' | 'success' | 'error'>('exchanging')
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!code) {
        setError('Invalid or missing reset code.')
        setStatus('error')
        return
      }
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          setError(error.message || 'Failed to validate reset link.')
          setStatus('error')
        } else {
          setStatus('ready')
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to validate reset link.')
          setStatus('error')
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [code, supabase])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setStatus('updating')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setStatus('ready')
      return
    }
    setStatus('success')
    // After a brief pause, send user to login
    setTimeout(() => router.replace('/login'), 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Choose a new password to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'exchanging' && (
            <p className="text-sm text-muted-foreground">Validating reset link…</p>
          )}

          {(status === 'ready' || status === 'updating') && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={status === 'updating'}>
                {status === 'updating' ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          )}

          {status === 'success' && (
            <p className="text-sm text-green-700">Password updated. Redirecting to login…</p>
          )}

          {status === 'error' && (
            <div>
              <p className="text-sm text-red-600 mb-3">{error || 'This reset link is invalid or expired.'}</p>
              <Button onClick={() => router.replace('/forgot-password')} className="w-full" variant="outline">
                Request a New Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

