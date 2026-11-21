"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { AttendanceSummary } from "@/components/attendance-summary";
import {
  DeleteConfirmModal,
  PesertaFormModal,
} from "@/components/peserta-modals";
import { PesertaTable } from "@/components/peserta-table";
import { ToastStack } from "@/components/toast-stack";
import type { Peserta, PesertaFormInput, ToastItem } from "@/types/peserta";

type StatusFilter = "all" | "pending" | "checked-in";

export default function EventCheckInPage() {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [checkingInId, setCheckingInId] = useState<number | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingPeserta, setEditingPeserta] = useState<Peserta | null>(null);
  const [walkInPrefill, setWalkInPrefill] = useState("");
  const [deletingPeserta, setDeletingPeserta] = useState<Peserta | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pushToast = useCallback(
    (type: "success" | "error", title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadPeserta = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      const res = await fetch("/api/peserta", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(
          payload?.error || "Gagal memuatkan senarai peserta daripada pelayan."
        );
      }
      setPesertaList(Array.isArray(payload.data) ? payload.data : []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ralat rangkaian semasa menyambung ke pelayan.";
      setFetchError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/peserta", { cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(
            payload?.error || "Gagal memuatkan senarai peserta daripada pelayan."
          );
        }
        if (!cancelled) {
          setPesertaList(Array.isArray(payload.data) ? payload.data : []);
          setFetchError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchError(
            err instanceof Error
              ? err.message
              : "Ralat rangkaian semasa menyambung ke pelayan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const { totalCount, checkedInCount, pendingCount } = useMemo(() => {
    const total = pesertaList.length;
    const checkedIn = pesertaList.filter(
      (p) => p.status_hadir === "Sudah Daftar Masuk"
    ).length;
    return {
      totalCount: total,
      checkedInCount: checkedIn,
      pendingCount: total - checkedIn,
    };
  }, [pesertaList]);

  const filteredPeserta = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pesertaList.filter((item) => {
      if (statusFilter === "pending" && item.status_hadir === "Sudah Daftar Masuk") {
        return false;
      }
      if (
        statusFilter === "checked-in" &&
        item.status_hadir !== "Sudah Daftar Masuk"
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.nama_peserta.toLowerCase().includes(q) ||
        item.emel.toLowerCase().includes(q) ||
        item.organisasi_atau_fakulti.toLowerCase().includes(q)
      );
    });
  }, [pesertaList, searchQuery, statusFilter]);

  const handleOpenCreateModal = (prefillName = "") => {
    setFormMode("create");
    setEditingPeserta(null);
    setWalkInPrefill(prefillName);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (peserta: Peserta) => {
    setFormMode("edit");
    setEditingPeserta(peserta);
    setWalkInPrefill("");
    setFormModalOpen(true);
  };

  const handleCheckIn = async (peserta: Peserta) => {
    setCheckingInId(peserta.id);
    try {
      const res = await fetch(`/api/peserta/${peserta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin" }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal merekodkan check-in.");
      }
      const updated: Peserta = payload.data;
      setPesertaList((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      pushToast(
        "success",
        "Check-in berjaya",
        `${updated.nama_peserta} disahkan hadir.`
      );
    } catch (err) {
      pushToast(
        "error",
        "Check-in gagal",
        err instanceof Error ? err.message : "Sila cuba sebentar lagi."
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const handleUndoCheckIn = async (peserta: Peserta) => {
    setCheckingInId(peserta.id);
    try {
      const res = await fetch(`/api/peserta/${peserta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal mengemaskini status.");
      }
      const updated: Peserta = payload.data;
      setPesertaList((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      pushToast(
        "success",
        "Status ditetapkan semula",
        `${updated.nama_peserta} ditukar kepada Belum Hadir.`
      );
    } catch (err) {
      pushToast(
        "error",
        "Gagal mengemaskini status",
        err instanceof Error ? err.message : "Sila cuba sebentar lagi."
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const handleFormSubmit = async (input: PesertaFormInput) => {
    if (formMode === "create") {
      const res = await fetch("/api/peserta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal mendaftarkan peserta.");
      }
      const created: Peserta = payload.data;
      setPesertaList((prev) => [created, ...prev]);
      setFormModalOpen(false);
      pushToast(
        "success",
        "Peserta baharu didaftarkan",
        `${created.nama_peserta} telah ditambah ke dalam senarai.`
      );
    } else if (editingPeserta) {
      const res = await fetch(`/api/peserta/${editingPeserta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal mengemaskini rekod.");
      }
      const updated: Peserta = payload.data;
      setPesertaList((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setFormModalOpen(false);
      pushToast(
        "success",
        "Rekod dikemaskini",
        `Maklumat ${updated.nama_peserta} berjaya disimpan.`
      );
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    try {
      const res = await fetch(`/api/peserta/${id}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal memadam rekod peserta.");
      }
      const targetName =
        pesertaList.find((p) => p.id === id)?.nama_peserta ?? "Peserta";
      setPesertaList((prev) => prev.filter((item) => item.id !== id));
      setDeletingPeserta(null);
      pushToast(
        "success",
        "Rekod dipadam",
        `${targetName} telah dikeluarkan daripada senarai.`
      );
    } catch (err) {
      pushToast(
        "error",
        "Gagal memadam rekod",
        err instanceof Error ? err.message : "Sila cuba sebentar lagi."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          <a
            href="#kaunter"
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-lg"
          >
            Event Check-In
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#ringkasan"
              className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#kaunter"
              className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Kaunter Carian
            </a>
            <a
              href="#senarai"
              className="transition-colors hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Senarai Peserta
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleOpenCreateModal("")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span>Daftar Walk-In</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 sm:py-9">
        {/* Hero / Desk Title */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-700">
              Kaunter Pendaftaran Utama · Bengkel &amp; Seminar
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
              Sistem Pendaftaran Acara &amp; Kehadiran
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Cari nama peserta dengan pantas di pintu masuk, sahkan kehadiran
              dengan satu klik, atau daftarkan peserta walk-in baharu secara
              langsung.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => loadPeserta(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>Muat Semula</span>
            </button>
          </div>
        </section>

        {/* Live Attendance Counter & Progress Bar */}
        <AttendanceSummary
          totalCount={totalCount}
          checkedInCount={checkedInCount}
          pendingCount={pendingCount}
          isLoading={isLoading}
        />

        {/* Database Error Banner (if DB not connected yet) */}
        {fetchError && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold">
                  Sambungan pangkalan data tidak tersedia
                </p>
                <p className="mt-0.5 text-xs text-red-800">{fetchError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadPeserta(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 whitespace-nowrap shrink-0"
            >
              Cuba Semula
            </button>
          </div>
        )}

        {/* Fast Search Desk & Filter Controls */}
        <section id="kaunter" aria-label="Carian dan penapis peserta" className="space-y-4">
          <div className="relative">
            <label htmlFor="search-peserta" className="sr-only">
              Cari nama peserta, e-mel, atau organisasi
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="search-peserta"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Taip nama peserta, e-mel, atau fakulti/organisasi untuk semakan pantas..."
              className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-24 text-base text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Kosongkan carian"
                className="absolute right-3 top-1/2 inline-flex h-9 items-center gap-1 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Kosongkan</span>
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-400 sm:inline-block">
                /
              </kbd>
            )}
          </div>

          <div
            id="senarai"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div
              role="tablist"
              aria-label="Tapis mengikut status kehadiran"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 self-start"
            >
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua (<span className="font-mono tabular-nums">{totalCount}</span>)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "pending"}
                onClick={() => setStatusFilter("pending")}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === "pending"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Belum Hadir (
                <span className="font-mono tabular-nums">{pendingCount}</span>)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "checked-in"}
                onClick={() => setStatusFilter("checked-in")}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === "checked-in"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sudah Hadir (
                <span className="font-mono tabular-nums">{checkedInCount}</span>)
              </button>
            </div>

            <p className="text-xs text-slate-500 tabular-nums">
              Memaparkan{" "}
              <span className="font-mono font-semibold text-slate-700">
                {filteredPeserta.length}
              </span>{" "}
              daripada{" "}
              <span className="font-mono font-semibold text-slate-700">
                {totalCount}
              </span>{" "}
              rekod peserta
            </p>
          </div>
        </section>

        {/* Participant Table */}
        <PesertaTable
          pesertaList={filteredPeserta}
          totalRegisteredCount={totalCount}
          searchQuery={searchQuery}
          isLoading={isLoading}
          checkingInId={checkingInId}
          onCheckIn={handleCheckIn}
          onUndoCheckIn={handleUndoCheckIn}
          onEdit={handleOpenEditModal}
          onDelete={(p) => setDeletingPeserta(p)}
          onClearSearch={() => setSearchQuery("")}
          onOpenWalkInWithSearch={(name) => handleOpenCreateModal(name)}
        />
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-500 sm:px-6">
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span>Event Check-In App · Sistem Pendaftaran Acara &amp; Kehadiran</span>
          <span>Tekan kekunci &quot;/&quot; untuk fokus terus ke kotak carian kaunter</span>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      <PesertaFormModal
        isOpen={formModalOpen}
        mode={formMode}
        initialPeserta={editingPeserta}
        prefillName={walkInPrefill}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        peserta={deletingPeserta}
        onClose={() => setDeletingPeserta(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Floating Toasts */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
