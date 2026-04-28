export interface CTABlockProps {
  heading: string
  body: string
  buttonText: string
  buttonLink: string
  backgroundColor: string
}

export const defaultProps: CTABlockProps = {
  heading: 'The New Collection',
  body: 'Considered design. Exceptional materials. Available now.',
  buttonText: 'Explore',
  buttonLink: '/collections/new',
  backgroundColor: 'bg-neutral-100',
}

export default function CTABlock({ heading, body, buttonText, buttonLink, backgroundColor }: CTABlockProps) {
  return (
    <section className={`w-full py-24 md:py-36 px-6 ${backgroundColor}`}>
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
        <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-neutral-950">{heading}</h2>
        <p className="text-sm font-light tracking-wide text-zinc-500 max-w-md">{body}</p>
        <a
          href={buttonLink}
          className="inline-block border border-neutral-950 px-8 py-3 text-xs tracking-widest uppercase text-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors duration-300"
        >
          {buttonText}
        </a>
      </div>
    </section>
  )
}
