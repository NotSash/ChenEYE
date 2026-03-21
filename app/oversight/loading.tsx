export default function OversightLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-5 p-4 md:p-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 rounded-xl skeleton-shimmer" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-64 rounded-2xl skeleton-shimmer" />
    </div>
  );
}
