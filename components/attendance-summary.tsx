"use client";

interface AttendanceSummaryProps {
  totalCount: number;
  checkedInCount: number;
  pendingCount: number;
  isLoading: boolean;
}

export function AttendanceSummary({
  totalCount,
  checkedInCount,
  pendingCount,
  isLoading,
}: AttendanceSummaryProps) {
  const percentage =
    totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  return (
    <section
      id="ringkasan"
      aria-label="Statistik Kehadiran Semasa"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Statistik Kehadiran Langsung
          </p>
          {isLoading ? (
            <div className="mt-1.5 h-8 w-64 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <h2 className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-3xl">
              {checkedInCount} / {totalCount} Peserta Hadir ({percentage}%)
            </h2>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 tabular-nums">
          <span>
            Sudah Daftar Masuk:{" "}
            <strong className="font-mono font-semibold text-emerald-700">
              {isLoading ? "–" : checkedInCount}
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            Belum Hadir:{" "}
            <strong className="font-mono font-semibold text-slate-900">
              {isLoading ? "–" : pendingCount}
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            Jumlah Berdaftar:{" "}
            <strong className="font-mono font-semibold text-slate-900">
              {isLoading ? "–" : totalCount}
            </strong>
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Peratus kehadiran peserta: ${percentage}%`}
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full w-full origin-left rounded-full bg-emerald-600 transition-transform duration-300 ease-out"
          style={{
            transform: `scaleX(${isLoading ? 0 : percentage / 100})`,
          }}
        />
      </div>
    </section>
  );
}
