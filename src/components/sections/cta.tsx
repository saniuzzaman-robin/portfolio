export function CTA() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 bg-neutral-10">
      <div className="max-w-3xl mx-auto text-center animate-slide-up">
        <h2 className="font-space-grotesk font-bold text-3xl md:text-4xl mb-8 animate-slide-down">
          Ready to build something great?
        </h2>
        <p className="text-neutral-70 mb-12 text-sm leading-relaxed animate-fade-in [animation-delay:200ms]">
          I'm always interested in hearing about new projects and opportunities. Get in touch to
          discuss how we can collaborate.
        </p>
        <a
          href="mailto:saniuzzamanrobin07@gmail.com"
          className="inline-block bg-primary-50 text-neutral-0 px-8 py-3 rounded-lg font-space-grotesk font-semibold text-sm uppercase tracking-wider hover:bg-primary-60 transition hover:scale-110 duration-300 hover:shadow-lg hover:shadow-primary-50/50 animate-fade-in [animation-delay:300ms]"
        >
          Get In Touch
        </a>
      </div>
    </section>
  );
}
