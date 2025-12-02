"use client";

import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "../../components/navbar";
import { AdminDashboard } from "../../components/admin-dashboard";
import { UserDashboard } from "../../components/user-dashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // While loading user data, show nothing or loader
  if (loading) return <div>Loading...</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
