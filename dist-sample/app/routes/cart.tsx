import { CartForm } from '@shopify/hydrogen'
import type { ActionFunctionArgs } from '@shopify/remix-oxygen'

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = context
  const formData = await request.formData()
  const { action, inputs } = CartForm.getFormInput(formData)

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      return cart.addLines(inputs.lines)
    case CartForm.ACTIONS.LinesUpdate:
      return cart.updateLines(inputs.lines)
    case CartForm.ACTIONS.LinesRemove:
      return cart.removeLines(inputs.lineIds)
    default:
      throw new Error('Unhandled cart action: ' + action)
  }
}

export default function CartRoute() {
  return null
}
