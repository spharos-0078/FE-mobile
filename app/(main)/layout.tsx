'use client';

import React from 'react';
import BottomNavbar from '@/components/layout/BottomNavbar';
import { usePathname } from 'next/navigation';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const hideBottomNavRoutes = [
    '/charge',
    '/withdraw',
    '/other',
    '/profile',
    '/notice',
    '/event',
    '/faq',
    '/sell',
    '/my-products',
    '/contact',
    '/settings',
    '/funding',
  ];
  const shouldHideBottomNav = hideBottomNavRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {children}
      {!shouldHideBottomNav && <BottomNavbar />}
    </>
  );
}
