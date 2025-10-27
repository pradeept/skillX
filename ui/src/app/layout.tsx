import type { Metadata } from "next";
import "./globals.css";


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
  applicationName: 'SkillBull',
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={` antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
