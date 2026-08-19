import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useChangeMyPasswordMutation, useUpdateMyProfileMutation, } from '@/features/account/hooks'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorResponse } from '@/lib/api-error'

export function AccountSettings() {
    const user = useAuthStore((state) => state.user)
    const accessToken = useAuthStore((state) => state.accessToken)
    const setAuth = useAuthStore((state) => state.setAuth)
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const navigate = useNavigate()

    const updateProfileMutation = useUpdateMyProfileMutation()
    const changePasswordMutation = useChangeMyPasswordMutation()

    const [name, setName] = useState(user?.name ?? '')
    const [imageUrl, setImageUrl] = useState(user?.imageUrl ?? '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [profileMessage, setProfileMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')

    useEffect(() => {
        setName(user?.name ?? '')
        setImageUrl(user?.imageUrl ?? '')
    }, [user])

    if (!user) return null

    const handleProfileSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setProfileMessage('')

        try {
            const updatedUser = await updateProfileMutation.mutateAsync({
                name: name.trim(),
                imageUrl: imageUrl.trim() || undefined,
            })

            if (accessToken) {
                setAuth(updatedUser, accessToken)
            }

            setProfileMessage('Profile updated successfully.')
        } catch (error) {
            setProfileMessage(
                getApiErrorResponse(error, 'Could not update profile.'),
            )
        }
    }

    const handlePasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setPasswordError('')

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.')
            return
        }

        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: user.hasPassword ? currentPassword : undefined,
                newPassword,
            })

            clearAuth()
            navigate('/login', { replace: true })
        } catch (error) {
            setPasswordError(
                getApiErrorResponse(error, 'Could not update password.'),
            )
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-kala-brown">
                    Account settings
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                    Manage your profile and sign-in security.
                </p>
            </div>

            <Card className="p-6">
                <form className="space-y-4" onSubmit={handleProfileSubmit}>
                    <h2 className="text-lg font-semibold text-stone-800">Profile</h2>

                    <Input
                        label="Email"
                        value={user.email}
                        disabled
                        hint="Email address cannot be changed."
                    />

                    <Input
                        label="Display name"
                        value={name}
                        minLength={2}
                        maxLength={100}
                        required
                        onChange={(event) => setName(event.target.value)}
                    />

                    <Input
                        label="Avatar URL"
                        type="url"
                        value={imageUrl}
                        placeholder="https://example.com/avatar.jpg"
                        onChange={(event) => setImageUrl(event.target.value)}
                    />

                    {profileMessage && (
                        <p className="text-sm text-stone-600">{profileMessage}</p>
                    )}

                    <Button type="submit" loading={updateProfileMutation.isPending}>
                        Save profile
                    </Button>
                </form>
            </Card>

            <Card className="p-6">
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                    <div>
                        <h2 className="text-lg font-semibold text-stone-800">
                            {user.hasPassword ? 'Change password' : 'Set a password'}
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            {user.hasPassword
                                ? 'This signs you out on all devices.'
                                : 'You can continue using Google sign-in after setting a password.'}
                        </p>
                    </div>

                    {user.hasPassword && (
                        <Input
                            label="Current password"
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            required
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    )}

                    <Input
                        label="New password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={50}
                        required
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                    />

                    <Input
                        label="Confirm new password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={50}
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />

                    {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                    )}

                    <Button type="submit" loading={changePasswordMutation.isPending}>
                        {user.hasPassword ? 'Change password' : 'Set password'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}