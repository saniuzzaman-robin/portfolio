export function SkillsShowcase() {
  const skillCategories = [
    {
      category: 'Frontend Development',
      color: 'primary',
      icon: '⚡',
      skills: [
        { name: 'Next.js', level: 95 },
        { name: 'Angular', level: 90 },
        { name: 'React', level: 85 },
        { name: 'TypeScript', level: 90 },
        { name: 'Tailwind CSS', level: 95 },
        { name: 'RxJS / Zustand', level: 85 },
      ],
    },
    {
      category: 'Backend Development',
      color: 'secondary',
      icon: '🚀',
      skills: [
        { name: 'NestJS', level: 95 },
        { name: '.NET (C#)', level: 80 },
        { name: 'REST APIs', level: 95 },
        { name: 'MongoDB', level: 85 },
        { name: 'Redis', level: 85 },
        { name: 'RabbitMQ', level: 80 },
      ],
    },
    {
      category: 'Tools & Others',
      color: 'tertiary',
      icon: '🔧',
      skills: [
        { name: 'Git', level: 95 },
        { name: 'Jest / TDD', level: 85 },
        { name: 'Selenium', level: 85 },
        { name: 'JMeter', level: 80 },
        { name: 'GCP / Cloud', level: 75 },
        { name: 'Agile / Scrum', level: 90 },
      ],
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 bg-linear-to-br from-neutral-10 to-neutral-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 animate-slide-right">
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            Skills & Expertise
          </h1>
          <p className="text-neutral-70 text-lg max-w-2xl">
            A comprehensive overview of technical skills and proficiencies developed through years
            of hands-on experience.
          </p>
        </div>

        <div className="space-y-16">
          {skillCategories.map((category, catIndex) => (
            <div
              key={catIndex}
              className="animate-slide-up"
              style={{ animationDelay: `${catIndex * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl">{category.icon}</span>
                <h2 className={`font-space-grotesk text-3xl font-bold text-${category.color}-50`}>
                  {category.category}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-neutral-5 rounded-xl p-6 border border-neutral-20 hover:border-neutral-30 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-space-grotesk font-bold text-lg">{skill.name}</h3>
                      <span className={`text-${category.color}-50 font-space-grotesk font-bold`}>
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-20 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-linear-to-r from-${category.color}-50 to-${category.color}-60 rounded-full transition-all duration-1000`}
                        style={{
                          width: `${skill.level}%`,
                          animation: `slideRight 1s ease-out ${index * 100}ms forwards`,
                          animationFillMode: 'both',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <div className="bg-neutral-5 rounded-2xl p-8 border border-primary-50/30 hover:border-primary-50 transition duration-300 animate-scale-in [animation-delay:600ms]">
            <h3 className="font-space-grotesk text-2xl font-bold text-primary-50 mb-4">
              � Competitive Programming
            </h3>
            <p className="text-neutral-70 mb-4">
              Strong foundation in algorithms and data structures from competitive programming.
            </p>
            <ul className="space-y-2 text-neutral-70 text-sm">
              <li>✓ Solved 1700+ problems across multiple judges</li>
              <li>✓ Participated in 10+ national level contests</li>
              <li>✓ ICPC Regional Finalist</li>
              <li>✓ Problem setter & judge for university contests</li>
            </ul>
          </div>

          <div className="bg-neutral-5 rounded-2xl p-8 border border-secondary-50/30 hover:border-secondary-50 transition duration-300 animate-scale-in [animation-delay:700ms]">
            <h3 className="font-space-grotesk text-2xl font-bold text-secondary-50 mb-4">
              🎯 Core Expertise
            </h3>
            <p className="text-neutral-70 mb-4">
              Full-stack development with focus on scalability, performance, and code quality.
            </p>
            <ul className="space-y-2 text-neutral-70 text-sm">
              <li>✓ System Architecture & Design</li>
              <li>✓ Performance Optimization (Redis, Caching)</li>
              <li>✓ Testing & Quality Assurance (Jest, Selenium)</li>
              <li>✓ Team Leadership & Code Reviews</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
