import type { FooterColumn, SocialLink, SocialPlatform } from '~/components/types'
import { theme } from '~/config/theme'

export interface FooterProps {
  columns: FooterColumn[]
  socialIcons: SocialLink[]
  showNewsletter: boolean
}

export const defaultProps: FooterProps = {
  columns: [
    { heading: 'Collections', links: [
      { label: 'Women', href: '/collections/women' },
      { label: 'Men', href: '/collections/men' },
      { label: 'New Arrivals', href: '/collections/new' },
    ]},
    { heading: 'House', links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ]},
    { heading: 'Support', links: [
      { label: 'Shipping & Returns', href: '/shipping' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Contact', href: '/contact' },
    ]},
  ],
  socialIcons: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'pinterest', href: 'https://pinterest.com' },
  ],
  showNewsletter: true,
}

const SOCIAL_SYMBOLS: Record<SocialPlatform, string> = {
  instagram: '◉',
  pinterest: '◈',
  twitter: '◇',
  tiktok: '◆',
}

function FooterColumnBlock({ column }: { column: FooterColumn }) {
  return (
    <div>
      <p className={`text-xs tracking-widest uppercase ${theme.text.muted} mb-6`}>{column.heading}</p>
      {column.links.map((link) => (
        <a key={link.href} href={link.href} className={`block text-sm ${theme.font.body} ${theme.text.footerLink} ${theme.hover.textWhite} transition-colors mb-2`}>
          {link.label}
        </a>
      ))}
    </div>
  )
}

function SocialIconLink({ link }: { link: SocialLink }) {
  return (
    <a href={link.href} className={`${theme.text.muted} ${theme.hover.textWhite} transition-colors text-lg`} aria-label={link.platform}>
      {SOCIAL_SYMBOLS[link.platform]}
    </a>
  )
}

export default function Footer({ columns, socialIcons, showNewsletter }: FooterProps) {
  return (
    <footer className={`${theme.bg.dark} ${theme.text.onDark}`}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="flex flex-col gap-6">
          <p className="text-sm tracking-widest font-medium">MAISON</p>
          <div className="flex gap-4">
            {socialIcons.map((link) => <SocialIconLink key={link.platform} link={link} />)}
          </div>
        </div>
        {columns.map((col) => <FooterColumnBlock key={col.heading} column={col} />)}
      </div>

      {showNewsletter && (
        <div className={`border-t ${theme.border.divider} max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
          <p className={`text-xs tracking-widest uppercase ${theme.text.muted}`}>Subscribe to the journal</p>
          <div className="flex gap-6 items-end w-full md:w-auto">
            <input
              type="email"
              placeholder="Your email address"
              className={`bg-transparent border-b ${theme.border.input} ${theme.focus.borderWhite} outline-none text-sm ${theme.text.onDark} ${theme.placeholder.muted} pb-1 w-full md:w-64 transition-colors`}
            />
            <button className={`text-xs tracking-widest uppercase ${theme.text.muted} ${theme.hover.textWhite} shrink-0 transition-colors`}>
              Subscribe
            </button>
          </div>
        </div>
      )}

      <div className={`border-t ${theme.border.divider} max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${theme.text.meta} tracking-wide`}>
        <p>© 2026 Maison. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/privacy" className={`${theme.hover.textFooter} transition-colors`}>Privacy</a>
          <a href="/terms" className={`${theme.hover.textFooter} transition-colors`}>Terms</a>
        </div>
      </div>
    </footer>
  )
}
