import { Metadata } from 'next';
import PrivacyAppsClient from './PrivacyAppsClient';

export const metadata: Metadata = {
  title: 'Privacy Policy - SlowMan Studios Apps',
  description: 'Privacy policy for Piano Hero, KindWords, SubTracker and other SlowMan Studios applications.',
};

export default function PrivacyAppsPage() {
  return <PrivacyAppsClient />;
}
