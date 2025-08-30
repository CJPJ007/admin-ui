'use client'

import { useEffect, useState } from 'react'
import SkeletonLoader from './SkeletonLoader'
import { usePathname, useRouter } from 'next/navigation'

const withAuth = (WrappedComponent: React.ComponentType) => {
  const unAuthenticatedRoutes = ['/login', '/admin/recover-password']
  const Wrapper = (props: any) => {
    const router = useRouter()
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/admin/auth/status')
          if (response.ok) {
            const data = response.json();
          
            setIsAuthenticated(true)
          } else {
            if(!unAuthenticatedRoutes.includes(pathname))
            router.push('/login')
            else router.push(pathname)
          }
        } catch (error) {
          router.push('/login');
        }
      }
      if (!unAuthenticatedRoutes.includes(pathname))
      checkAuth()
      else setIsAuthenticated(true)
    }, [router])

    if (!isAuthenticated) {
      return <SkeletonLoader />
    }

    return <WrappedComponent {...props} />
  }

  return Wrapper
}

export default withAuth
