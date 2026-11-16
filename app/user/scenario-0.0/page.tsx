'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the vulnerable SSR page
export default function Scenario00Page() {
  const router = useRouter();

  useEffect(() => {
    router.push('/be/v0.0/users');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to vulnerable page...</p>
    </div>
  );
}
