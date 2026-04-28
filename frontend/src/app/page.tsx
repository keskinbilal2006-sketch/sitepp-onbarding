import { redirect } from 'next/navigation';

/**
 * Ana sayfada direkt login ekranina yonlendiriyoruz.
 */
export default function HomePage() {
  redirect('/login');
}
