'use client'

import { useAuth } from '@/firebase'
import { getRedirectResult } from 'firebase/auth'
import { useEffect, useState } from 'react'

export function LoginHandler() {
  const auth = useAuth()
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!auth) return
    getRedirectResult(auth).catch((e) => setError(e))
  }, [auth])

  if (error) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-md bg-destructive p-4 text-destructive-foreground">
        <p>Login failed: {error.message}</p>
      </div>
    )
  }

  return null
}
