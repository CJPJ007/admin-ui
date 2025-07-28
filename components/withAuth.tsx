'use client'

import { useEffect, useState } from 'react'
import SkeletonLoader from './SkeletonLoader'
import { useRouter } from 'next/navigation'

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/admin/auth/status')
          if (response.ok) {
            setIsAuthenticated(true)
          } else {
            router.push('/login')
          }
        } catch (error) {
          router.push('/login')
        }
      }

      checkAuth()
    }, [router])

    if (!isAuthenticated) {
      return <SkeletonLoader />
    }

    return <WrappedComponent {...props} />
  }

  return Wrapper
}

export default withAuth
