import { AccountPage } from '../../src/screens/AccountPage'

export const metadata = {
  title: 'My Account - AGRENES',
  robots: { index: false, follow: false },
}

export default function AccountRoute() {
  return <AccountPage />
}