export function EditorSkeleton() {
  return (
    <div className="h-[calc(100dvh-90px)] lg:h-[calc(100dvh-96px)] bg-gray-900 p-4">
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-700 rounded w-4/5"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-2/5"></div>
      </div>
    </div>
  )
}

export function PreviewSkeleton() {
  return (
    <div className="w-full h-[calc(100dvh-49px)] lg:h-[calc(100dvh-53px)] bg-white flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-56"></div>
      </div>
    </div>
  )
}

