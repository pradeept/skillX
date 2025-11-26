import * as motion from "motion/react-client";

export default function HowItWorks() {
  const steps = [
    {
      id: "1",
      title: "Create Profile",
      desc: "Sign up and tell us what skills you can teach and what you want to learn.",
    },
    {
      id: "2",
      title: "Find & Connect",
      desc: "Browse teachers, request sessions, and get matched with the perfect fit.",
    },
    {
      id: "3",
      title: "Learn & Grow",
      desc: "Attend sessions, leave reviews, and continue your learning journey.",
    },
  ];

  return (
    <section className='py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50'>
      <div className='max-w-6xl mx-auto text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='mb-16'
        >
          <h2 className='text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white'>
            How It Works ?
          </h2>
          <p className='text-zinc-500 dark:text-zinc-400'>
            Get started in minutes with our simple three-step process
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-12 relative'>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className='flex flex-col items-center group'
            >
              <div className='w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-900 dark:text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg dark:shadow-zinc-950/50'>
                {step.id}
              </div>
              <h3 className='text-xl font-bold mb-3 text-zinc-900 dark:text-white'>
                {step.title}
              </h3>
              <p className='text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed'>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
