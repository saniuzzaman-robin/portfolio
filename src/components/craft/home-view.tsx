'use client';

import { HeroStudio } from '@/components/craft/hero-studio';
import { ExperienceShowcase } from '@/components/craft/experience-showcase';
import { PlatformsBento } from '@/components/craft/platforms-bento';
import { SkillsMatrix } from '@/components/craft/skills-matrix';
import { ContactCard } from '@/components/craft/contact-card';
import { FooterColophon } from '@/components/craft/footer-colophon';

export function HomeView() {
  return (
    <>
      <HeroStudio />
      <ExperienceShowcase />
      <PlatformsBento limit={4} />
      <SkillsMatrix />
      <ContactCard />
      <FooterColophon />
    </>
  );
}
