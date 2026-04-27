'use client';

export function ComputationalArtifacts() {
  const artifacts = [
    {
      icon: '🏆',
      title: '10+ National Contests',
      label: 'Competitive Programmer',
      description:
        'Actively participated in ICPC, NCPC, and university-level programming competitions across Bangladesh.',
      color: 'green',
      accent: '#00ff87',
      borderClass: 'border-primary-50/30 hover:border-primary-50/70',
      glowClass: 'hover:neon-box-green',
    },
    {
      icon: '📊',
      title: '1700+ Problems',
      label: 'Problem Solver',
      description:
        'Solved across Codeforces, Codechef, LightOJ, UVA and other competitive programming platforms.',
      color: 'cyan',
      accent: '#00d4ff',
      borderClass: 'border-secondary-50/30 hover:border-secondary-50/70',
      glowClass: 'hover:neon-box-cyan',
    },
    {
      icon: '⚖️',
      title: 'Problem Setter',
      label: 'Judge & Organizer',
      description: 'Organized and judged several Intra and Inter-University programming contests.',
      color: 'purple',
      accent: '#a476ff',
      borderClass: 'border-tertiary-50/30 hover:border-tertiary-50/70',
      glowClass: 'hover:neon-box-purple',
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative">
      {/* Section header */}
      <div className="mb-16 animate-slide-right">
        <p className="section-label mb-3">Competitive Programming</p>
        <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold">
          Computational <span className="neon-cyan">Artifacts</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map((artifact, index) => (
          <div
            key={index}
            className={`relative glass rounded-sm border ${artifact.borderClass} p-8 transition-all duration-500 group card-3d animate-scale-in overflow-hidden`}
            style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
          >
            {/* Holographic sweep on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none rounded-sm" />

            {/* Corner accent */}
            <div
              className="absolute top-0 left-0 w-12 h-12 opacity-20 group-hover:opacity-60 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${artifact.accent} 0%, transparent 60%)`,
              }}
            />

            {/* Icon */}
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
              {artifact.icon}
            </div>

            {/* Title */}
            <h3 className="font-space-grotesk font-bold text-xl mb-1 text-neutral-90 group-hover:text-neutral-100 transition-colors relative z-10">
              {artifact.title}
            </h3>

            {/* Label */}
            <p
              className="text-xs uppercase tracking-widest font-space-grotesk font-bold mb-4 relative z-10"
              style={{ color: artifact.accent }}
            >
              {artifact.label}
            </p>

            {/* Description */}
            <p className="text-neutral-70 text-sm leading-relaxed relative z-10">
              {artifact.description}
            </p>

            {/* Bottom line */}
            <div
              className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
              style={{ background: `linear-gradient(to right, ${artifact.accent}, transparent)` }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
