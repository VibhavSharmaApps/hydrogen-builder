import { theme } from '~/config/theme'

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
  backgroundColor: theme.bg.light,
}

export default function CTABlock({ heading, body, buttonText, buttonLink, backgroundColor }: CTABlockProps) {
  return (
    <section className={`w-full py-24 md:py-36 px-6 ${backgroundColor}`}>
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
        <h2 className={`text-4xl md:text-6xl ${theme.font.heading} tracking-tight ${theme.text.primary}`}>{heading}</h2>
        <p className={`text-sm ${theme.font.body} tracking-wide ${theme.text.body} max-w-md`}>{body}</p>
        <a
          href={buttonLink}
          className={`inline-block border ${theme.border.primary} px-8 py-3 text-xs tracking-widest uppercase ${theme.text.primary} ${theme.hover.bgDark} ${theme.hover.textWhite} transition-colors duration-300`}
        >
          {buttonText}
        </a>
      </div>
    </section>
  )
}
