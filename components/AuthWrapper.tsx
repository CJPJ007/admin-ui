'use client'

import SkeletonLoader from './SkeletonLoader'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Allow access to /login without authentication check
      if (pathname === '/login') {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/auth/status');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/login');
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null; // Don't render anything if not authenticated and not on login page
  }

  return <>{children}</>;
};

export default AuthWrapper;
