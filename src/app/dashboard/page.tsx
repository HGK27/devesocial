"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // token yoksa login'e yönlendir
    }
  }, [router]);

  return <div>Welcome to the dashboard!</div>;
}
