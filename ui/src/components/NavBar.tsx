"use client";

import { ArrowRight } from "lucide-react";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();
  console.log(path);
  console.log(path);
  return (
    <nav className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800'>
      <div className='flex items-center gap-2'>
        <Link href={"/"}>
          <Logo />
        </Link>
        <span className='font-bold text-xl tracking-tight hidden sm:block text-zinc-900 dark:text-white'>
          SkillX
        </span>
      </div>
      {path === "/" && (
        <Link
          className='bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2'
          href={"/login"}
        >
          Get Started
          <ArrowRight className='w-4 h-4' />
        </Link>
      )}
    </nav>
  );
}
