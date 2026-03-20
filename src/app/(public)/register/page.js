'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page — it handles both Sign In & Sign Up
    router.replace('/login?mode=signup');
  }, [router]);

  return null;
}
