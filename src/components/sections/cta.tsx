import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="px-6 py-32 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-primary-50/5 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-50/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-tertiary-50/5 rounded-full blur-3xl animate-float" />
      </div>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 cyber-grid-dense opacity-30 pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Decorative corner brackets */}
        <div className="absolute -top-6 -left-6 w-10 h-10 border-l-2 border-t-2 border-primary-50/30 animate-fade-in" />
        <div className="absolute -bottom-6 -right-6 w-10 h-10 border-r-2 border-b-2 border-secondary-50/30 animate-fade-in" />

        {/* Label */}
        <p className="section-label mb-6 animate-slide-up">Let&apos;s Collaborate</p>

        {/* Heading */}
        <h2 className="font-space-grotesk font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight animate-slide-up [animation-delay:100ms]">
          Ready to build <span className="neon-green">something</span>
          <br />
          <span className="neon-cyan">extraordinary?</span>
        </h2>

        <p className="text-neutral-70 mb-12 text-sm leading-relaxed max-w-xl mx-auto animate-slide-up [animation-delay:200ms]">
          I&apos;m open to new projects, full-time roles, and exciting collaborations. If you have
          an idea that needs a battle-tested full-stack engineer — let&apos;s talk.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-slide-up [animation-delay:300ms]">
          <a
            href="mailto:saniuzzamanrobin07@gmail.com"
            className="group inline-flex items-center gap-3 btn-neon-green px-10 py-4 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest w-full sm:w-auto justify-center"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Get In Touch</span>
            <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://linkedin.com/in/saniuzzaman-robin"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 btn-neon-cyan px-10 py-4 rounded-sm font-space-grotesk font-bold text-sm uppercase tracking-widest w-full sm:w-auto justify-center"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>LinkedIn</span>
            <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
