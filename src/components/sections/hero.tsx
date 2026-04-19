import Link from 'next/link';

export function Hero() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-primary-50 text-xs font-space-grotesk mb-6 uppercase tracking-widest animate-slide-down">
            Software Engineer
          </p>
          <h1 className="font-space-grotesk font-bold text-5xl md:text-6xl mb-4 leading-tight animate-slide-up [animation-delay:100ms]">
            Md. Saniuzzaman
          </h1>
          <h2 className="text-primary-50 text-4xl md:text-5xl font-space-grotesk mb-12 animate-slide-up [animation-delay:200ms]">
            Robin
          </h2>

          {/* Description Box with Left Border */}
          <div className="border-l-4 border-primary-50 pl-8 bg-neutral-10 p-8 rounded-lg mb-8 animate-scale-in [animation-delay:300ms] hover:shadow-lg hover:shadow-primary-50/20 transition-shadow duration-500">
            <p className="text-neutral-70 leading-relaxed text-sm">
              Software engineer with 5 years of experience building
              production-grade web applications and backend systems. Specialized
              in NestJS for scalable APIs, and Next.js & Angular for performant
              frontends. Passionate about creating elegant solutions that
              support millions of users globally.
            </p>
          </div>

          <div className="flex gap-4 items-center animate-fade-in [animation-delay:400ms] flex-wrap">
            <Link
              href="/projects"
              className="bg-primary-50 text-neutral-0 px-6 py-3 rounded-lg font-space-grotesk font-semibold text-sm uppercase tracking-wider hover:bg-primary-60 transition hover:scale-105 duration-300 hover:shadow-lg hover:shadow-primary-50/50"
            >
              View Portfolio
            </Link>
            <Link
              href="/resume"
              className="border border-neutral-40 px-6 py-3 rounded-lg font-space-grotesk text-sm uppercase tracking-wider hover:border-primary-50 hover:text-primary-50 transition hover:scale-105 duration-300"
            >
              Read Resume
            </Link>
          </div>
        </div>

        {/* 3D Geometric Shape */}
        <div className="hidden lg:block relative h-96 animate-slide-left">
          <div className="absolute inset-0 bg-linear-to-br from-primary-50/30 via-secondary-50/20 to-tertiary-50/30 rounded-3xl transform perspective animate-float"></div>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Geometric 3D shape */}
            <g opacity="0.6">
              <polygon
                points="150,50 250,150 250,300 150,350 50,300 50,150"
                fill="url(#grad1)"
                stroke="rgba(37,164,117,0.3)"
                strokeWidth="2"
              />
              <polygon
                points="150,50 250,150 200,120 100,80"
                fill="rgba(37,164,117,0.4)"
              />
              <polygon
                points="250,150 250,300 200,280 200,150"
                fill="rgba(37,164,117,0.2)"
              />
            </g>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: '#25a475', stopOpacity: 0.3 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#af8d11', stopOpacity: 0.2 }}
                />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
