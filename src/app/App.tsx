import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { wakeBackend } from '../lib/wakeBackend'
import { router } from './router'
import { AuthProvider } from './auth/AuthProvider'

export default function App() {
  // Once, on open: the backend sleeps, and waking it here spends the minute
  // while the login is still being read instead of after a button is pressed.
  useEffect(wakeBackend, [])
  return <AuthProvider><RouterProvider router={router} /></AuthProvider>
}
