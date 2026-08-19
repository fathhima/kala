import { useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { getMe, refreshSession } from './api'
import { useAuthStore } from './store'

interface AuthBootstrapProps {
    children: React.ReactNode
}

export function AuthBootsrap({ children }: AuthBootstrapProps) {
    const setAuth = useAuthStore((state) => state.setAuth)
    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const markAuthResolved = useAuthStore((state) => state.markAuthResolved)
    const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const accessToken = useAuthStore((state) => state.accessToken)

    useEffect(() => {
        let mounted = true

        const bootstrapAuth = async () => {
            try {
                const token = await refreshSession()

                if (!mounted) return
                setAccessToken(token)

                const user = await getMe()

                if (!mounted) return
                setAuth(user, token)
            } catch {
                if (!mounted) return
                clearAuth()
            } finally {
                if (mounted) markAuthResolved()
            }
        }

        void bootstrapAuth()

        return () => {
            mounted = false
        }
    }, [clearAuth, markAuthResolved, setAccessToken, setAuth])

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return

        let active = true

        const refreshCurrentUser = async () => {
            try {
                const user = await getMe()
                const latestToken = useAuthStore.getState().accessToken

                if (active && latestToken) {
                    setAuth(user, latestToken)
                }
            } catch {
                // The Axios interceptor tries refresh first.
                // Do not force logout for a temporary network error.
            }
        }

        const onFocus = () => void refreshCurrentUser()
        const intervalId = window.setInterval(() => {
            void refreshCurrentUser()
        }, 60_000)

        window.addEventListener('focus', onFocus)

        return () => {
            active = false
            window.clearInterval(intervalId)
            window.removeEventListener('focus', onFocus)
        }
    }, [accessToken, isAuthenticated, setAuth])

    if (!isAuthResolved) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return <>{children}</>
}