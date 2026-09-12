import { WishlistPage } from '../../src/screens/AccountPage'

export const metadata = {
  title: 'My Wishlist - AGRENES',
  robots: { index: false, follow: false },
}

export default function WishlistRoute() {
  return <WishlistPage />
}