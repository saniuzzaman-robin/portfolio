'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  fadeInScale,
  staggerContainer,
  staggerItem,
} from '@/hooks/use-scroll-reveal';

type Props = HTMLMotionProps<'div'> & { as?: 'div' | 'section' | 'article' | 'header' | 'footer' };

export function FadeInUp(props: Props) {
  const { as = 'div', ...rest } = props;
  const Component = motion[as];
  return <Component variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} {...rest} />;
}

export function FadeInLeft(props: Props) {
  const { as = 'div', ...rest } = props;
  const Component = motion[as];
  return <Component variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} {...rest} />;
}

export function FadeInRight(props: Props) {
  const { as = 'div', ...rest } = props;
  const Component = motion[as];
  return <Component variants={fadeInRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} {...rest} />;
}

export function FadeInScale(props: Props) {
  const { as = 'div', ...rest } = props;
  const Component = motion[as];
  return <Component variants={fadeInScale} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} {...rest} />;
}

export function StaggerContainer(props: Props) {
  const { as = 'div', ...rest } = props;
  const Component = motion[as];
  return <Component variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} {...rest} />;
}

export function StaggerItem(props: Props) {
  const { as = 'div', ...rest } = props;
  const Component = motion[as];
  return <Component variants={staggerItem} {...rest} />;
}
