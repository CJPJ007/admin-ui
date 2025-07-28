import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CacheManagementLoading() {
  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Cache Items Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>

                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Card Skeleton */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
