"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Trash2, UserPlus, X } from "lucide-react";
import type { Peserta, PesertaFormInput, StatusHadir } from "@/types/peserta";

interface PesertaFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialPeserta?: Peserta | null;
  prefillName?: string;
  onClose: () => void;
  onSubmit: (data: PesertaFormInput) => Promise<void>;
}

interface InnerFormProps {
  mode: "create" | "edit";
  initialPeserta?: Peserta | null;
  prefillName: string;
  onClose: () => void;
  onSubmit: (data: PesertaFormInput) => Promise<void>;
}

function PesertaFormDialogContent({
  mode,
  initialPeserta,
  prefillName,
  onClose,
  onSubmit,
}: InnerFormProps) {
  const [namaPeserta, setNamaPeserta] = useState(
    mode === "edit" && initialPeserta
      ? initialPeserta.nama_peserta
      : prefillName
  );
  const [emel, setEmel] = useState(
    mode === "edit" && initialPeserta ? initialPeserta.emel : ""
  );
  const [organisasi, setOrganisasi] = useState(
    mode === "edit" && initialPeserta
      ? initialPeserta.organisasi_atau_fakulti
      : ""
  );
  const [statusHadir, setStatusHadir] = useState<StatusHadir>(
    mode === "edit" && initialPeserta?.status_hadir === "Sudah Daftar Masuk"
      ? "Sudah Daftar Masuk"
      : "Belum Hadir"
  );
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = namaPeserta.trim();
    const trimmedEmail = emel.trim();
    const trimmedOrg = organisasi.trim();

    if (trimmedName.length < 2) {
      setFormError("Sila masukkan nama penuh peserta (min. 2 aksara).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Sila masukkan format alamat e-mel yang sah.");
      return;
    }
    if (trimmedOrg.length < 2) {
      setFormError("Sila nyatakan organisasi atau fakulti peserta.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmit({
          nama_peserta: trimmedName,
          emel: trimmedEmail,
          organisasi_atau_fakulti: trimmedOrg,
          autoCheckIn,
        });
      } else {
        await onSubmit({
          nama_peserta: trimmedName,
          emel: trimmedEmail,
          organisasi_atau_fakulti: trimmedOrg,
          status_hadir: statusHadir,
        });
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Ralat semasa menyimpan rekod."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="peserta-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => !submitting && onClose()}
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3
              id="peserta-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {mode === "create"
                ? "Daftar Peserta Walk-In"
                : "Kemaskini Maklumat Peserta"}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {mode === "create"
                ? "Masukkan butiran peserta baharu yang hadir di kaunter."
                : "Ubah butiran pendaftaran atau status kehadiran peserta."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup borang"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="nama_peserta"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Penuh Peserta
            </label>
            <input
              id="nama_peserta"
              name="nama_peserta"
              type="text"
              required
              autoFocus
              value={namaPeserta}
              onChange={(e) => setNamaPeserta(e.target.value)}
              placeholder="Contoh: Nurul Aina binti Zulkifli"
              className="mt-1.5 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label
              htmlFor="emel"
              className="block text-sm font-medium text-slate-700"
            >
              Alamat E-mel
            </label>
            <input
              id="emel"
              name="emel"
              type="email"
              required
              value={emel}
              onChange={(e) => setEmel(e.target.value)}
              placeholder="Contoh: aina.zulkifli@utem.edu.my"
              className="mt-1.5 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label
              htmlFor="organisasi_atau_fakulti"
              className="block text-sm font-medium text-slate-700"
            >
              Organisasi atau Fakulti
            </label>
            <input
              id="organisasi_atau_fakulti"
              name="organisasi_atau_fakulti"
              type="text"
              required
              value={organisasi}
              onChange={(e) => setOrganisasi(e.target.value)}
              placeholder="Contoh: Fakulti Teknologi Maklumat (FTMK), UTeM"
              className="mt-1.5 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {mode === "create" ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
              <input
                type="checkbox"
                checked={autoCheckIn}
                onChange={(e) => setAutoCheckIn(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-slate-700">
                Terus rekod kehadiran ({" "}
                <span className="font-medium text-emerald-700">
                  Sudah Daftar Masuk
                </span>{" "}
                ) sekarang
              </span>
            </label>
          ) : (
            <div>
              <label
                htmlFor="status_hadir"
                className="block text-sm font-medium text-slate-700"
              >
                Status Kehadiran
              </label>
              <select
                id="status_hadir"
                value={statusHadir}
                onChange={(e) => setStatusHadir(e.target.value as StatusHadir)}
                className="mt-1.5 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="Belum Hadir">Belum Hadir</option>
                <option value="Sudah Daftar Masuk">Sudah Daftar Masuk</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Menyimpan...</span>
                </>
              ) : mode === "create" ? (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span>Daftar Peserta</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function PesertaFormModal({
  isOpen,
  mode,
  initialPeserta,
  prefillName = "",
  onClose,
  onSubmit,
}: PesertaFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <PesertaFormDialogContent
          key={`${mode}-${initialPeserta?.id ?? "new"}-${prefillName}`}
          mode={mode}
          initialPeserta={initialPeserta}
          prefillName={prefillName}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </AnimatePresence>
  );
}

interface DeleteConfirmModalProps {
  peserta: Peserta | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteConfirmModal({
  peserta,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!peserta) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [peserta, deleting, onClose]);

  const handleConfirm = async () => {
    if (!peserta) return;
    setDeleting(true);
    try {
      await onConfirm(peserta.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {peserta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !deleting && onClose()}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="delete-modal-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Padam Rekod Peserta?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Anda pasti mahu memadam rekod pendaftaran untuk{" "}
                  <strong className="font-semibold text-slate-900">
                    {peserta.nama_peserta}
                  </strong>{" "}
                  ({peserta.emel})? Tindakan ini tidak boleh dibatalkan.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {deleting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Memadam...</span>
                  </>
                ) : (
                  <span>Ya, Padam Rekod</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
