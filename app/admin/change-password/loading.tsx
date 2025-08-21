import AdminLayout from "@/components/layout/admin-layout"

export default function ChangePasswordLoading() {
  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>

          {/* Header Skeleton */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            </div>

            <div className="space-y-6">
              {/* Current Password Field */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Requirements Box */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded flex-1 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Security Tips Skeleton */}
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full mt-0.5 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
