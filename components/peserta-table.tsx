"use client";

import {
  Check,
  Loader2,
  Pencil,
  RotateCcw,
  SearchX,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { Peserta } from "@/types/peserta";

interface PesertaTableProps {
  pesertaList: Peserta[];
  totalRegisteredCount: number;
  searchQuery: string;
  isLoading: boolean;
  checkingInId: number | null;
  onCheckIn: (peserta: Peserta) => void;
  onUndoCheckIn: (peserta: Peserta) => void;
  onEdit: (peserta: Peserta) => void;
  onDelete: (peserta: Peserta) => void;
  onClearSearch: () => void;
  onOpenWalkInWithSearch: (prefillName: string) => void;
}

function formatCheckInTime(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ms-MY", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    hour12: true,
  }).format(date);
}

export function PesertaTable({
  pesertaList,
  totalRegisteredCount,
  searchQuery,
  isLoading,
  checkingInId,
  onCheckIn,
  onUndoCheckIn,
  onEdit,
  onDelete,
  onClearSearch,
  onOpenWalkInWithSearch,
}: PesertaTableProps) {
  if (isLoading) {
    return (
      <div
        aria-label="Memuatkan senarai peserta"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
                <div className="h-3.5 w-72 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pesertaList.length === 0) {
    const hasSearch = searchQuery.trim().length > 0;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <SearchX className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {hasSearch
            ? `Tiada peserta ditemui untuk "${searchQuery.trim()}"`
            : totalRegisteredCount === 0
              ? "Belum ada peserta berdaftar"
              : "Tiada peserta dalam penapis ini"}
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          {hasSearch
            ? "Semak semula ejaan nama atau daftarkan individu ini terus sebagai peserta walk-in di kaunter."
            : totalRegisteredCount === 0
              ? "Mulakan dengan mendaftarkan peserta pertama atau peserta walk-in di kaunter pendaftaran."
              : "Tukar penapis status di atas untuk melihat peserta lain."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {hasSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
            >
              Kosongkan Carian
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenWalkInWithSearch(searchQuery.trim())}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span>
              {hasSearch
                ? `Daftar "${searchQuery.trim()}" sebagai Walk-In`
                : "Daftar Peserta Pertama"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Desktop Data Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
              <th scope="col" className="w-20 px-5 py-3.5 font-mono">
                ID
              </th>
              <th scope="col" className="px-5 py-3.5">
                Peserta
              </th>
              <th scope="col" className="px-5 py-3.5">
                Organisasi / Fakulti
              </th>
              <th scope="col" className="px-5 py-3.5">
                Status Kehadiran
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {pesertaList.map((peserta) => {
              const isCheckedIn =
                peserta.status_hadir === "Sudah Daftar Masuk";
              const isBusy = checkingInId === peserta.id;
              const formattedTime = formatCheckInTime(peserta.masa_checkin);

              return (
                <tr
                  key={peserta.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 tabular-nums">
                    #{String(peserta.id).padStart(3, "0")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">
                      {peserta.nama_peserta}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {peserta.emel}
                    </div>
                  </td>
                  <td className="max-w-xs px-5 py-3.5 text-slate-600">
                    <span className="line-clamp-2">
                      {peserta.organisasi_atau_fakulti}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {isCheckedIn ? (
                      <div className="text-xs">
                        <span className="font-medium text-emerald-700">
                          Sudah Daftar Masuk
                        </span>
                        {formattedTime && (
                          <div className="mt-0.5 font-mono text-slate-500 tabular-nums">
                            {formattedTime}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Belum Hadir
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {isCheckedIn ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 tabular-nums whitespace-nowrap shrink-0">
                            <Check
                              className="h-3.5 w-3.5 text-emerald-700"
                              aria-hidden="true"
                            />
                            <span>Hadir ✓</span>
                            {formattedTime && (
                              <span className="font-mono font-normal text-emerald-700">
                                · {formattedTime}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUndoCheckIn(peserta)}
                            disabled={isBusy}
                            title="Tetapkan semula kepada Belum Hadir"
                            aria-label={`Batal check-in untuk ${peserta.nama_peserta}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
                          >
                            {isBusy ? (
                              <Loader2
                                className="h-4 w-4 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <RotateCcw
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCheckIn(peserta)}
                          disabled={isBusy}
                          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 whitespace-nowrap shrink-0"
                        >
                          {isBusy ? (
                            <>
                              <Loader2
                                className="h-3.5 w-3.5 animate-spin"
                                aria-hidden="true"
                              />
                              <span>Menyemak...</span>
                            </>
                          ) : (
                            <span>Check-In</span>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onEdit(peserta)}
                        aria-label={`Edit maklumat ${peserta.nama_peserta}`}
                        title="Edit peserta"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(peserta)}
                        aria-label={`Padam rekod ${peserta.nama_peserta}`}
                        title="Padam peserta"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive List */}
      <div className="divide-y divide-slate-100 md:hidden">
        {pesertaList.map((peserta) => {
          const isCheckedIn = peserta.status_hadir === "Sudah Daftar Masuk";
          const isBusy = checkingInId === peserta.id;
          const formattedTime = formatCheckInTime(peserta.masa_checkin);

          return (
            <div key={peserta.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      #{String(peserta.id).padStart(3, "0")}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        isCheckedIn
                          ? "font-medium text-emerald-700"
                          : "font-medium text-slate-500"
                      }
                    >
                      {peserta.status_hadir}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {peserta.nama_peserta}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {peserta.emel}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {peserta.organisasi_atau_fakulti}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {isCheckedIn ? (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 tabular-nums whitespace-nowrap shrink-0">
                      <Check
                        className="h-3.5 w-3.5 text-emerald-700"
                        aria-hidden="true"
                      />
                      <span>Hadir ✓</span>
                      {formattedTime && (
                        <span className="font-mono font-normal text-emerald-700">
                          · {formattedTime}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUndoCheckIn(peserta)}
                      disabled={isBusy}
                      aria-label={`Batal check-in untuk ${peserta.nama_peserta}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCheckIn(peserta)}
                    disabled={isBusy}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                  >
                    {isBusy ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        <span>Menyemak...</span>
                      </>
                    ) : (
                      <span>Check-In</span>
                    )}
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(peserta)}
                    aria-label={`Edit ${peserta.nama_peserta}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(peserta)}
                    aria-label={`Padam ${peserta.nama_peserta}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
