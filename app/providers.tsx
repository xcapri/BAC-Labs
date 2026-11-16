'use client';

import { GuideProvider } from '@/contexts/GuideContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <GuideProvider>{children}</GuideProvider>;
}
