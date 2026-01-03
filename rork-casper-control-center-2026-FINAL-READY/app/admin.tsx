import React from "react";
import { Redirect } from "expo-router";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminPage() {
  const { isBooting, userId, profile } = useAuth();
  if (isBooting) return null;
  if (!userId) return <Redirect href="/login" />;
  if (!profile || profile.role !== "admin") return <Redirect href="/" />;
  return <AdminDashboard />;
}
