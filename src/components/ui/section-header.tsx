'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

interface SectionHeaderProps {
  label: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

const headerVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function SectionHeader({ label, title, description, align = 'center' }: SectionHeaderProps) {
  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`mb-16 ${align === 'center' ? 'text-center' : ''}`}
    >
      <motion.p variants={itemVariants} className="section-label mb-4 inline-block">
        {label}
      </motion.p>
      <motion.h2
        variants={itemVariants}
        className="font-poppins text-4xl font-bold md:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p variants={itemVariants} className="text-neutral-70 mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-base">
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
