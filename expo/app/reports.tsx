import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function ReportsRoute() {
  const { profile } = useAuth();
  return <Redirect href={profile?.role === 'partner' ? '/partner' : '/admin'} />;
}
