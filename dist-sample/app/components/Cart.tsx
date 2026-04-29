import { CartForm, Money } from '@shopify/hydrogen'
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
