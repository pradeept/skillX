import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "../components/misc/LenisProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "../providers/queryProvider";
import { NotificationProvider } from "@/providers/notificationProvider";

export const metadata: Metadata = {
  title: "SkillX",
  description:
    "SkillX is a skill exchange platform. Here users can barter their skills or share their skills as a community service.",
  keywords: [
    "skillbull",
    "skillswap",
    "skill exchange platform",
    "skill barter",
  ],
  applicationName: "SkillX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NotificationProvider>
              <LenisProvider />
              {children}
              <Toaster />
            </NotificationProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
