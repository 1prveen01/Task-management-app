"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useTheme } from "@/lib/context/theme-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, LayoutDashboard, Users, Zap, Moon, Sun } from "lucide-react"

export default function Home() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">TaskFlow</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="transition-transform hover:scale-110">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/register")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Zap className="h-4 w-4" />
              Modern Task Management
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Manage Tasks with <span className="text-primary">Efficiency</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            A powerful task management system designed for teams. Assign tasks, track progress, and collaborate
            seamlessly.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={() => router.push("/register")}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Demo credentials: admin@example.com / admin123 or user@example.com / user123
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Admin Dashboard</h3>
              <p className="text-muted-foreground">
                Complete control over tasks and users. Create, assign, and manage everything from one place.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">User Dashboard</h3>
              <p className="text-muted-foreground">
                View assigned tasks, update status, and track your progress with an intuitive interface.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Stay in sync with instant updates. See changes as they happen across all devices.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features List */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Create and assign tasks",
              "Set priorities and due dates",
              "Track task progress",
              "Manage team members",
              "Dark and light theme",
              "User profile management",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground">Join TaskFlow today and experience seamless task management.</p>
          <Button size="lg" onClick={() => router.push("/register")}>
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 TaskFlow. Built with Next.js and modern web technologies.</p>
        </div>
      </footer>
    </div>
  )
}
