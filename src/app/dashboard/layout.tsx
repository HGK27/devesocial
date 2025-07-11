// social-media-analytics/src/app/dashboard/layout.tsx
import React from "react";
import Providers from "./providers";

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
      <Providers>
        <main>{children}</main>
      </Providers>
    </div>
  );
}
