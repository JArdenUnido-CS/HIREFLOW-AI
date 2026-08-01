import { motion } from 'framer-motion';

export function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-400/10 dark:bg-brand-400/5 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -20, 30, 0],
          y: [0, 20, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-violet-400/10 dark:bg-violet-400/5 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -20, 10, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-40 right-1/3 w-72 h-72 rounded-full bg-cyan-400/8 dark:bg-cyan-400/3 blur-3xl"
      />
    </div>
  );
}
