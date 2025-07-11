import type { Metadata } from "next";
import "../../styles/main.scss";

export const metadata: Metadata = {
  title: "login",
  description: "login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
