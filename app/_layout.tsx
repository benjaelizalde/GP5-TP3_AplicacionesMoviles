import { supabase } from '@/constants/supabaseClient';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && pathname !== '/login') {
        router.replace('/login');
      }
      setLoading(false);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/login') {
        router.replace('/login');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [pathname]);

  if (loading) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}