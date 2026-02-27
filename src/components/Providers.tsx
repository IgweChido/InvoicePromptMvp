'use client';

import { DemoProvider } from '@/context/DemoContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}
