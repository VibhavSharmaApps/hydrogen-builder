import { EditorLayout, ShopifyCredentialsProvider } from './editor'

export default function App() {
  return (
    <ShopifyCredentialsProvider>
      <EditorLayout />
    </ShopifyCredentialsProvider>
  )
}
