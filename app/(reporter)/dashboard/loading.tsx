export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6 pb-24 md:pb-6">
      {/* Greeting skeleton */}
      <div className="h-8 w-56 rounded-xl skeleton-shimmer" />

      {/* Quick actions skeleton */}
      <div className="h-28 rounded-2xl skeleton-shimmer" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
        ))}
      </div>

      {/* Recent reports skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-36 rounded-lg skeleton-shimmer" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}
