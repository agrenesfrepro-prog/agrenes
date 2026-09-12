import OrdersPage from '../../src/screens/OrdersPage'

export const metadata = {
  title: 'My Orders - AGRENES',
  robots: { index: false, follow: false },
}

export default function OrdersRoute() {
  return <OrdersPage />
}