import type { ProjectFiles } from './types'

const CART_TSX = `import { CartForm, Money } from '@shopify/hydrogen'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import CartLineItem from './CartLineItem'
import { theme } from '~/config/theme'

interface CartProps {
  cart: CartApiQueryFragment | null
  open: boolean
  onClose: () => void
}

export default function Cart({ cart, open, onClose }: CartProps) {
  const lines = cart?.lines?.nodes ?? []

  return (
    <>
      {open && (
        <div className={'fixed inset-0 z-40 ' + theme.bg.overlay} onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={'fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ' + theme.bg.white + ' ' + (open ? 'translate-x-0' : 'translate-x-full')}
        aria-label="Cart"
      >
        <div className={'flex items-center justify-between px-6 py-5 border-b ' + theme.border.light}>
          <p className="text-xs tracking-widest uppercase">Your Bag ({cart?.totalQuantity ?? 0})</p>
          <button onClick={onClose} className={'text-xl leading-none ' + theme.text.muted + ' ' + theme.hover.textPrimary} aria-label="Close cart">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className={'text-sm mt-8 text-center tracking-wide ' + theme.text.accent}>Your bag is empty</p>
          ) : (
            lines.map((line) => <CartLineItem key={line.id} line={line} />)
          )}
        </div>
        {lines.length > 0 && (
          <div className={'border-t px-6 py-6 flex flex-col gap-4 ' + theme.border.light}>
            <div className="flex justify-between text-xs tracking-widest uppercase">
              <span>Subtotal</span>
              {cart?.cost?.subtotalAmount && <Money data={cart.cost.subtotalAmount} />}
            </div>
            <a
              href={cart?.checkoutUrl ?? '#'}
              className={'block w-full text-center py-4 text-xs tracking-widest uppercase transition-colors ' + theme.bg.dark + ' ' + theme.text.white + ' ' + theme.hover.bgMid}
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </>
  )
}
`

const CART_LINE_ITEM_TSX = `import { CartForm, Money } from '@shopify/hydrogen'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import { theme } from '~/config/theme'

type CartLine = CartApiQueryFragment['lines']['nodes'][number]

export default function CartLineItem({ line }: { line: CartLine }) {
  const { merchandise, quantity } = line
  if (merchandise.__typename !== 'ProductVariant') return null

  return (
    <div className={'flex gap-4 py-4 border-b last:border-0 ' + theme.border.light}>
      {merchandise.image && (
        <img
          src={merchandise.image.url}
          alt={merchandise.image.altText ?? merchandise.product.title}
          className={'w-20 h-24 object-cover ' + theme.bg.light}
        />
      )}
      <div className="flex-1 flex flex-col gap-1">
        <p className={'text-xs tracking-wide ' + theme.text.primary}>{merchandise.product.title}</p>
        <p className={'text-xs ' + theme.text.accent}>{merchandise.title}</p>
        <Money data={merchandise.price} className={'text-xs mt-1 ' + theme.text.accent} />
        <div className="flex items-center gap-3 mt-2">
          {quantity > 1 ? (
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{ lines: [{ id: line.id, quantity: quantity - 1 }] }}>
              <button type="submit" className={'w-6 h-6 border text-xs flex items-center justify-center ' + theme.border.subtle + ' ' + theme.hover.borderPrimary} aria-label="Decrease">−</button>
            </CartForm>
          ) : (
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{ lineIds: [line.id] }}>
              <button type="submit" className={'w-6 h-6 border text-xs flex items-center justify-center ' + theme.border.subtle + ' ' + theme.hover.borderPrimary} aria-label="Remove">−</button>
            </CartForm>
          )}
          <span className="text-xs tabular-nums">{quantity}</span>
          <CartForm route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{ lines: [{ id: line.id, quantity: quantity + 1 }] }}>
            <button type="submit" className={'w-6 h-6 border text-xs flex items-center justify-center ' + theme.border.subtle + ' ' + theme.hover.borderPrimary} aria-label="Increase">+</button>
          </CartForm>
          <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{ lineIds: [line.id] }}>
            <button type="submit" className={'ml-auto text-xs ' + theme.text.accent + ' ' + theme.hover.textPrimary}>Remove</button>
          </CartForm>
        </div>
      </div>
    </div>
  )
}
`

export function generateCartFiles(): ProjectFiles {
  return {
    'app/components/Cart.tsx': CART_TSX,
    'app/components/CartLineItem.tsx': CART_LINE_ITEM_TSX,
  }
}
