import { Github, Linkedin, Twitter } from "lucide-react";
import Logo from "./Logo";
import { ModeToggle } from "./ModeToggle";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          © 2025 SkillX. All rights reserved.
        </div>

        <div className="flex gap-6 items-center ">
          <ModeToggle />
          <a
            href="https://x.com/ob2_17"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/pradeept/skillX"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
