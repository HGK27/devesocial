// social-media-analytics/src/app/dashboard/layout.tsx
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "2rem" }}>
      <header>
        <h1>Dashboard</h1>
        {/* Add navigation or user info here */}
      </header>
      <main>{children}</main>
    </div>
  );
}
