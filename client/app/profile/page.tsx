"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, ImageIcon, Save, Lock } from "lucide-react"
export default function ProfilePage() {
  const { user, updateProfile, updateChangePassword } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar || "",
      })
    }
  }, [user, router])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateProfile(formData)
      setIsEditing(false)
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    // Validate passwords
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords don't match")
      return
    }

    if (passwords.newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    try {
      setIsSaving(true)
      await updateChangePassword({
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsChangingPassword(false)
      alert("Password changed successfully")
    } catch (error: any) {
      console.error("Error changing password:", error)
      alert(error.response?.data?.message || "Failed to change password")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* USER INFO */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.fullName} />
                <AvatarFallback className="text-2xl">
                  {formData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-xl font-semibold">{formData.fullName}</h3>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                <p className="text-sm text-primary capitalize mt-1">{user.role} Account</p>
              </div>
            </div>

            {/* EDIT PROFILE FIELDS */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com/avatar.jpg"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        fullName: user.fullName,
                        email: user.email,
                        avatar: user.avatar || "",
                      })
                    }} 
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Edit Profile
                </Button>
              )}
            </div>

            {/* ---------------------------- */}
            {/* CHANGE PASSWORD SECTION */}
            {/* ---------------------------- */}

            <div className="pt-6 border-t space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </h3>

              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  disabled={!isChangingPassword}
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPassword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  disabled={!isChangingPassword}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  disabled={!isChangingPassword}
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                {isChangingPassword ? (
                  <>
                    <Button 
                      className="flex-1" 
                      onClick={handlePasswordChange}
                      disabled={isSaving}
                    >
                      {isSaving ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => setIsChangingPassword(true)}>
                    Change Password
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}