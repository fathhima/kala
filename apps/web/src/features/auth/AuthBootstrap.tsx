import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "./store";
import { useEffect } from "react";
import { getMe, refreshSession } from "./api";

interface AuthBootsrapProps {
    children: React.ReactNode
}

export function AuthBootsrap({ children }: AuthBootsrapProps) {
    const setAuth = useAuthStore((state) => state.setAuth)
    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const markAuthResolved = useAuthStore((state) => state.markAuthResolved)
    const isAuthResolved = useAuthStore((state) => state.isAuthResolved)

    useEffect(() => {
        let mounted = true

        const bootstrapAuth = async () => {
            try {
                const accessToken = await refreshSession()

                if (!mounted) return
                setAccessToken(accessToken)

                const user = await getMe()

                if (!mounted) return
                setAuth(user, accessToken)

            } catch (error) {
                if (!mounted) return
                clearAuth()
            } finally {
                if (!mounted) return
                markAuthResolved()
            }
        }

        bootstrapAuth()

        return () => {
            mounted = false
        }
    }, [setAuth, setAccessToken, clearAuth, markAuthResolved])

    if (!isAuthResolved) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return <>{children}</>
}
