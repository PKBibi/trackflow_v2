// Loading skeleton for marketing pages to improve perceived performance
export default function Loading() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Minimal hero skeleton optimized for LCP */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge skeleton */}
          <div className="w-64 h-8 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-8" />

          {/* Title skeleton - optimized sizing */}
          <div className="space-y-4 mb-12">
            <div className="h-12 md:h-16 bg-gray-100 dark:bg-gray-800 rounded max-w-2xl mx-auto" />
            <div className="h-12 md:h-16 bg-gray-100 dark:bg-gray-800 rounded max-w-xl mx-auto" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-3 mb-12 max-w-2xl mx-auto">
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mx-auto" />
          </div>

          {/* Button skeleton */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="w-48 h-12 bg-gray-100 dark:bg-gray-800 rounded mx-auto" />
            <div className="w-40 h-12 bg-gray-100 dark:bg-gray-800 rounded mx-auto" />
          </div>
        </div>
      </section>
    </div>
  )
}