import { useState } from 'react'
import type { MenuItem } from './types'

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
      <a href={item.href} className="text-xs tracking-widest uppercase text-neutral-600 hover:text-neutral-950 transition-colors">
        {item.label}
      </a>
      {item.children && (
        <div className="absolute top-full left-0 pt-3 hidden group-hover:block z-50">
          <div className="bg-white border border-neutral-100 shadow-sm py-6 px-8 flex flex-col gap-3 min-w-48">
            {item.children.map((child) => (
              <a key={child.href} href={child.href} className="text-xs tracking-wide text-zinc-500 hover:text-neutral-950 transition-colors whitespace-nowrap">
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
    <div className="fixed inset-0 z-40 bg-white flex flex-col pt-16 px-8 gap-1">
      <button onClick={onClose} className="absolute top-5 right-6 text-neutral-400 hover:text-neutral-950 text-2xl leading-none" aria-label="Close menu">×</button>
      {items.map((item) => (
        <div key={item.href} className="py-3 border-b border-neutral-100">
          <a href={item.href} className="text-sm tracking-widest uppercase text-neutral-950">{item.label}</a>
          {item.children && (
            <div className="mt-3 flex flex-col gap-2 pl-4">
              {item.children.map((child) => (
                <a key={child.href} href={child.href} className="text-xs tracking-wide text-zinc-500">{child.label}</a>
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
      <nav className={`w-full bg-white border-b border-neutral-100 ${sticky ? 'sticky top-0 z-50' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-sm tracking-widest font-medium text-neutral-950">{logo}</a>
          <ul className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => <MegaMenuItem key={item.href} item={item} />)}
          </ul>
          <button onClick={() => setIsOpen(true)} className="md:hidden text-neutral-950 text-xs tracking-widest uppercase" aria-label="Open menu">
            Menu
          </button>
        </div>
      </nav>
      {isOpen && <MobileMenu items={menuItems} onClose={() => setIsOpen(false)} />}
    </>
  )
}
