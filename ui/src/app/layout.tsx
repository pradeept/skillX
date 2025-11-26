import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "../components/LenisProvider";

export const metadata: Metadata = {
  title: "SkillBull",
  description:
    "SkillBull is a skill exchange platform. Here users can barter their skills or share their skills as a community service.",
  keywords: [
    "skillbull",
    "skillswap",
    "skill exchange platform",
    "skill barter",
  ],
  applicationName: "SkillBull",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={` antialiased`}>
        <LenisProvider />
        {children}
      </body>
    </html>
  );
}
