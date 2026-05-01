// Adapted Navigation for generated Hydrogen projects.
// Changes from builder template:
//   - Type import path updated to ~/components/types
//   - Theme import added; all hardcoded colours replaced with theme references
//   - Cart button dispatches 'open-cart' custom event (root.tsx listens) instead of prop callback
//   - Template literal className replaced with string concat (no ${} in generated source)
export const ADAPTED_NAVIGATION = `import { useState } from 'react'
import type { MenuItem } from '~/components/types'
import { theme } from '~/config/theme'

export interface NavigationProps {
  logo: string
  menuItems: MenuItem[]
  sticky: boolean
}

export const defaultProps: NavigationProps = {
  logo: 'MAISON',
  menuItems: [
    { label: 'Women', href: '/collections/women', children: [
      { label: 'Ready-to-Wear', href: '/collections/rtw' },
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Shoes', href: '/collections/shoes' },
    ]},
    { label: 'Men', href: '/collections/men', children: [
      { label: 'Ready-to-Wear', href: '/collections/men-rtw' },
      { label: 'Accessories', href: '/collections/men-accessories' },
    ]},
    { label: 'New Arrivals', href: '/collections/new' },
    { label: 'Sale', href: '/collections/sale' },
  ],
  sticky: true,
}

function MegaMenuItem({ item }: { item: MenuItem }) {
  return (
    <li className="relative group">
      <a href={item.href} className={'text-xs tracking-widest uppercase ' + theme.text.link + ' ' + theme.hover.textPrimary + ' transition-colors'}>
        {item.label}
      </a>
      {item.children && (
        <div className="absolute top-full left-0 pt-3 hidden group-hover:block z-50">
          <div className={'border shadow-sm py-6 px-8 flex flex-col gap-3 min-w-48 ' + theme.bg.white + ' ' + theme.border.light}>
            {item.children.map((child) => (
              <a key={child.href} href={child.href} className={'text-xs tracking-wide transition-colors whitespace-nowrap ' + theme.text.body + ' ' + theme.hover.textPrimary}>
                {child.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

function MobileMenu({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <div className={'fixed inset-0 z-40 flex flex-col pt-16 px-8 gap-1 ' + theme.bg.white}>
      <button onClick={onClose} className={'absolute top-5 right-6 text-2xl leading-none ' + theme.text.muted + ' ' + theme.hover.textPrimary} aria-label="Close menu">×</button>
      {items.map((item) => (
        <div key={item.href} className={'py-3 border-b ' + theme.border.light}>
          <a href={item.href} className={'text-sm tracking-widest uppercase ' + theme.text.primary}>{item.label}</a>
          {item.children && (
            <div className="mt-3 flex flex-col gap-2 pl-4">
              {item.children.map((child) => (
                <a key={child.href} href={child.href} className={'text-xs tracking-wide ' + theme.text.body}>{child.label}</a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Navigation({ logo, menuItems, sticky }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className={'w-full border-b ' + theme.bg.white + ' ' + theme.border.light + ' ' + (sticky ? 'sticky top-0 z-50' : '')}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className={'text-sm tracking-widest font-medium ' + theme.text.primary}>{logo}</a>
          <ul className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => <MegaMenuItem key={item.href} item={item} />)}
          </ul>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
              className={'hidden md:block text-xs tracking-widest uppercase transition-colors ' + theme.text.link + ' ' + theme.hover.textPrimary}
              aria-label="Open cart"
            >
              Bag
            </button>
            <button onClick={() => setIsOpen(true)} className={'md:hidden text-xs tracking-widest uppercase ' + theme.text.primary} aria-label="Open menu">
              Menu
            </button>
          </div>
        </div>
      </nav>
      {isOpen && <MobileMenu items={menuItems} onClose={() => setIsOpen(false)} />}
    </>
  )
}
`
