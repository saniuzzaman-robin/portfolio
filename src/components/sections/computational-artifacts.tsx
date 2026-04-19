export function ComputationalArtifacts() {
  const artifacts = [
    {
      emoji: '🏆',
      title: '10+ National Contests',
      label: 'Participant',
      description:
        'Actively participated in major competitive programming contests including ICPC, NCPC, and university-level competitions.',
      borderColor: 'border-primary-50',
    },
    {
      emoji: '📊',
      title: '1700+',
      label: 'Problems Solved',
      description:
        'Solved across Codeforces, Codechef, LightOJ, UVA and other competitive programming platforms.',
      borderColor: 'border-secondary-50',
    },
    {
      emoji: '⚖️',
      title: 'Problem Setter',
      label: 'Judge & Organizer',
      description: 'Organized and judged several Intra and Inter-University programming contests.',
      borderColor: 'border-tertiary-50',
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 bg-neutral-10">
      <div className="mb-16 animate-slide-right">
        <h2 className="font-space-grotesk text-4xl font-bold border-l-4 border-white pl-6">
          Computational
          <br />
          Artifacts
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {artifacts.map((artifact, index) => (
          <div
            key={index}
            className={`bg-neutral-5 rounded-xl p-10 border ${artifact.borderColor} hover:${artifact.borderColor} transition animate-scale-in hover:shadow-lg hover:shadow-${artifact.borderColor}/20 duration-500`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl mb-6 hover:scale-125 transition duration-300">
              {artifact.emoji}
            </div>
            <h3 className="font-space-grotesk font-bold text-lg mb-2">{artifact.title}</h3>
            {artifact.label && (
              <p className="text-neutral-70 text-xs uppercase tracking-wider mb-4">
                {artifact.label}
              </p>
            )}
            <p className="text-neutral-70 text-sm leading-relaxed mb-6">{artifact.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
