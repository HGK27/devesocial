import type { Metadata } from "next";
import "../../styles/main.scss";
import styles from "./signupStyle.module.scss";

export const metadata: Metadata = {
  title: "signup",
  description: "signup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
