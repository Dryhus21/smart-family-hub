import { Spinner } from "./SubmitButton";

export function PageLoading({ title }: { title?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-64 animate-pulse rounded-lg bg-surface-container" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-surface-container-low" />
      </div>
      <div className="flex items-center justify-center py-10">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Memuat {title ?? "halaman"}...</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-surface-container" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-surface-container-low" />
            <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-container-low" />
          </div>
        ))}
      </div>
    </div>
  );
}
