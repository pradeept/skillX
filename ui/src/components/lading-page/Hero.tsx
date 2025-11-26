import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";

export default function Hero() {
  return (
    <section className='relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 text-center'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className='max-w-4xl mx-auto space-y-6'
      >
        <h1 className='text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white'>
          Learn Anything. <br />
          <span className='text-zinc-500 dark:text-zinc-400'>
            Teach Everything.
          </span>
        </h1>

        <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
          Connect with passionate teachers and eager learners. Share your
          skills, learn new ones, and grow together in a community-driven
          platform.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-8'>
          <Link
            className='w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full font-semibold hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2'
            href={"/login"}
          >
            Get Started <ArrowRight className='w-4 h-4' />
          </Link>
          <Link
            className='w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300 rounded-full font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200'
            href={"/#explore-skills"}
          >
            Explore Skills
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
