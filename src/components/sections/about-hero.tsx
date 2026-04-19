export function AboutHero() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 bg-linear-to-br from-neutral-10 to-neutral-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 animate-slide-right">
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            About Me
          </h1>
          <div className="w-24 h-1 bg-linear-to-r from-primary-50 via-secondary-50 to-tertiary-50 rounded-full mb-8 animate-fade-in [animation-delay:200ms]"></div>
        </div>

        <div className="space-y-8">
          <div className="animate-slide-up [animation-delay:100ms]">
            <h2 className="font-space-grotesk text-2xl font-bold text-primary-50 mb-4">
              Software Engineer with 5+ Years Experience
            </h2>
            <p className="text-neutral-70 text-lg leading-relaxed">
              I specialize in building production-grade web applications and
              backend systems. My expertise spans full-stack development with
              NestJS for scalable APIs, microservices, and Next.js & Angular for
              performant frontend experiences. Passionate about clean code,
              system architecture, and solving complex problems.
            </p>
          </div>

          <div className="animate-slide-up [animation-delay:200ms]">
            <h2 className="font-space-grotesk text-2xl font-bold text-secondary-50 mb-4">
              Competitive Programming Background
            </h2>
            <p className="text-neutral-70 text-lg leading-relaxed">
              Solved 1700+ problems across multiple online judges including
              Codeforces, Codechef, LightOJ, and UVA. Led competitive
              programming teams and participated in 10+ national level contests
              including ICPC Dhaka Regional and NCPC. Judge and problem setter
              for university programming contests.
            </p>
          </div>

          <div className="animate-slide-up [animation-delay:300ms]">
            <h2 className="font-space-grotesk text-2xl font-bold text-tertiary-50 mb-4">
              Beyond Development
            </h2>
            <p className="text-neutral-70 text-lg leading-relaxed">
              Passionate about sharing knowledge and mentoring developers.
              Experienced in code reviews, architectural planning, and building
              scalable systems. Fluent in Agile methodologies with expertise in
              Git, testing frameworks, and DevOps practices. Continuous learner
              exploring emerging technologies and best practices.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-neutral-5 rounded-xl p-8 border border-primary-50/30 hover:border-primary-50 transition duration-300 animate-scale-in [animation-delay:400ms]">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-space-grotesk font-bold text-lg mb-2">
              Problem Solver
            </h3>
            <p className="text-neutral-70 text-sm">
              Tackling complex challenges with creative solutions
            </p>
          </div>
          <div className="bg-neutral-5 rounded-xl p-8 border border-secondary-50/30 hover:border-secondary-50 transition duration-300 animate-scale-in [animation-delay:500ms]">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-space-grotesk font-bold text-lg mb-2">
              Performance Driven
            </h3>
            <p className="text-neutral-70 text-sm">
              Building fast, responsive, and scalable systems
            </p>
          </div>
          <div className="bg-neutral-5 rounded-xl p-8 border border-tertiary-50/30 hover:border-tertiary-50 transition duration-300 animate-scale-in [animation-delay:600ms]">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="font-space-grotesk font-bold text-lg mb-2">
              Innovator
            </h3>
            <p className="text-neutral-70 text-sm">
              Exploring new technologies and methodologies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
