import { theme } from '~/config/theme'

export interface HeroSectionProps {
  heading: string
  subheading: string
  ctaText: string
  ctaLink: string
  backgroundImage: string
  overlayOpacity: number
  variant: 'full-bleed' | 'split'
}

export const defaultProps: HeroSectionProps = {
  heading: 'The Quietude Collection',
  subheading: 'Autumn / Winter 2026',
  ctaText: 'Discover',
  ctaLink: '/collections/quietude',
  backgroundImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400',
  overlayOpacity: 0.25,
  variant: 'full-bleed',
}

function FullBleedLayout({ heading, subheading, ctaText, ctaLink, backgroundImage, overlayOpacity }: Omit<HeroSectionProps, 'variant'>) {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* overlay opacity is a dynamic decimal — cannot use Tailwind class without safelisting */}
      <div className={`absolute inset-0 ${theme.bg.dark}`} style={{ opacity: overlayOpacity }} />
      <div className="absolute bottom-12 left-8 md:left-16 flex flex-col gap-4">
        <p className={`text-xs tracking-widest uppercase ${theme.text.footerLink}`}>{subheading}</p>
        <h1 className={`text-5xl md:text-7xl ${theme.font.heading} ${theme.text.white} max-w-lg leading-none`}>{heading}</h1>
        <a
          href={ctaLink}
          className={`self-start border ${theme.border.white} px-8 py-3 text-xs tracking-widest uppercase ${theme.text.white} ${theme.hover.bgWhite} ${theme.hover.textPrimary} transition-colors duration-300`}
        >
          {ctaText}
        </a>
      </div>
    </section>
  )
}

function SplitLayout({ heading, subheading, ctaText, ctaLink, backgroundImage, overlayOpacity }: Omit<HeroSectionProps, 'variant'>) {
  return (
    <section className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="relative w-full md:w-1/2 h-72 md:h-auto overflow-hidden">
        <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 ${theme.bg.dark}`} style={{ opacity: overlayOpacity }} />
      </div>
      <div className={`w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-16 gap-6 ${theme.bg.light}`}>
        <p className={`text-xs tracking-widest uppercase ${theme.text.accent}`}>{subheading}</p>
        <h1 className={`text-4xl md:text-6xl ${theme.font.heading} ${theme.text.primary} leading-none`}>{heading}</h1>
        <a
          href={ctaLink}
          className={`self-start border ${theme.border.primary} px-8 py-3 text-xs tracking-widest uppercase ${theme.text.primary} ${theme.hover.bgDark} ${theme.hover.textWhite} transition-colors duration-300`}
        >
          {ctaText}
        </a>
      </div>
    </section>
  )
}

export default function HeroSection(props: HeroSectionProps) {
  return props.variant === 'split'
    ? <SplitLayout {...props} />
    : <FullBleedLayout {...props} />
}
