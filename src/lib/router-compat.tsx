'use client';

import React, { useEffect, useState } from 'react';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import NextLink from 'next/link';

export function useNavigate() {
  const router = useNextRouter();

  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to === -1) {
        if (typeof window !== 'undefined') window.history.back();
        else router.back();
      } else if (to === 1) {
        if (typeof window !== 'undefined') window.history.forward();
        else router.forward();
      }
    } else if (typeof to === 'string') {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  };
}

export function useLocation() {
  const pathname = useNextPathname() || '/';
  const searchParams = useNextSearchParams();
  const search = searchParams ? (searchParams.toString() ? `?${searchParams.toString()}` : '') : '';
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHash(window.location.hash);
      const handleHashChange = () => setHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  return {
    pathname,
    search,
    hash,
    state: null,
    key: pathname,
  };
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string | undefined>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export const Link = React.forwardRef<HTMLAnchorElement, any>(function Link(
  { to, href, children, ...props },
  ref
) {
  const target = to || href || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useNextRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);

  return null;
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route(_props: any) {
  return null;
}

export function Outlet() {
  return null;
}

export default {
  useNavigate,
  useLocation,
  useParams,
  Link,
  Navigate,
  BrowserRouter,
  Routes,
  Route,
  Outlet,
};
