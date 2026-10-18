export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Chargement">
      <div className="skeleton h-9 w-64 rounded-[10px]" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[16px] border border-line">
            <div className="skeleton aspect-[4/3]" />
            <div className="space-y-2 p-3.5">
              <div className="skeleton h-5 w-20 rounded-md" />
              <div className="skeleton h-4 w-full rounded-md" />
              <div className="skeleton h-3 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
