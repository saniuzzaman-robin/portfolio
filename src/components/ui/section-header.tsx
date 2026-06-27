'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

interface SectionHeaderProps {
  label?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function SectionHeader({ label, title, description, align = 'center' }: SectionHeaderProps) {
  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}
    >
      {label && (
        <motion.p variants={itemVariants} className="section-label mb-4 inline-block">
          {label}
        </motion.p>
      )}
      <motion.h2
        variants={itemVariants}
        className="font-heading text-4xl font-extrabold tracking-tight text-midnight-950 md:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={itemVariants}
          className={`mt-4 max-w-2xl text-base leading-relaxed text-midnight-500 ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
