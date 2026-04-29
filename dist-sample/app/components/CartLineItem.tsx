import { CartForm, Money } from '@shopify/hydrogen'
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
