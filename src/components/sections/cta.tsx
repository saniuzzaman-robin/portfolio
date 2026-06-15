import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/5 animate-glow-pulse absolute top-1/2 left-1/2 h-75 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-secondary-50/5 animate-float-slow absolute top-1/2 left-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-tertiary-50/5 animate-float absolute top-1/2 right-1/3 h-80 w-80 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      {/* Decorative grid lines */}
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Decorative corner brackets */}
        <div className="border-primary-50/30 animate-fade-in absolute -top-6 -left-6 h-10 w-10 border-t-2 border-l-2" />
        <div className="border-secondary-50/30 animate-fade-in absolute -right-6 -bottom-6 h-10 w-10 border-r-2 border-b-2" />

        {/* Label */}
        <p className="section-label animate-slide-up mb-6">Let&apos;s Collaborate</p>

        {/* Heading */}
        <h2 className="font-poppins animate-slide-up mb-6 text-4xl leading-tight font-bold [animation-delay:100ms] md:text-5xl lg:text-6xl">
          Ready to build <span className="neon-green">something</span>
          <br />
          <span className="neon-cyan">extraordinary?</span>
        </h2>

        <p className="text-neutral-70 animate-slide-up mx-auto mb-12 max-w-xl text-sm leading-relaxed [animation-delay:200ms]">
          I&apos;m open to new projects, full-time roles, and exciting collaborations. If you have
          an idea that needs a battle-tested full-stack engineer — let&apos;s talk.
        </p>

        {/* CTA Buttons */}
        <div className="animate-slide-up flex flex-col items-center justify-center gap-4 [animation-delay:300ms] sm:flex-row">
          <a
            href="mailto:saniuzzamanrobin07@gmail.com"
            className="group btn-neon-green font-poppins inline-flex w-full items-center justify-center gap-3 rounded-sm px-10 py-4 text-sm font-bold tracking-widest uppercase sm:w-auto"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span>Get In Touch</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="https://linkedin.com/in/saniuzzaman-robin"
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-neon-cyan font-poppins inline-flex w-full items-center justify-center gap-3 rounded-sm px-10 py-4 text-sm font-bold tracking-widest uppercase sm:w-auto"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>LinkedIn</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
