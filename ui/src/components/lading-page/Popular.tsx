import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";

export default function PopularSkills() {
  const skills = [
    "Web Development",
    "Guitar",
    "Photography",
    "Cooking",
    "Piano",
    "Digital Marketing",
    "French",
    "Yoga",
    "Spanish",
    "Graphic Design",
    "Public Speaking",
    "Data Science",
    "Hindi",
  ];

  return (
    <section className='py-24 px-6 bg-white dark:bg-zinc-950' id="explore-skills">
      <div className='max-w-5xl mx-auto text-center'>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-3xl md:text-4xl font-bold mb-12 text-zinc-900 dark:text-white'
        >
          Popular Skills
        </motion.h2>

        <div className='flex flex-wrap justify-center gap-4'>
          {skills.map((skill, index) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className='px-6 py-3 rounded-full text-sm md:text-base font-medium 
                         bg-zinc-100 text-zinc-800 
                         dark:bg-zinc-800 dark:text-zinc-300 
                         hover:bg-zinc-200 dark:hover:bg-zinc-700 
                         cursor-pointer transition-colors'
            >
              {skill}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className='mt-12'
        >
          <button className='text-zinc-900 dark:text-white font-semibold hover:underline flex items-center justify-center gap-2 mx-auto'>
            View All 20+ Skills <ArrowRight className='w-4 h-4' />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
