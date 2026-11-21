export type StatusHadir = "Belum Hadir" | "Sudah Daftar Masuk";

export interface Peserta {
  id: number;
  nama_peserta: string;
  emel: string;
  organisasi_atau_fakulti: string;
  status_hadir: string;
  masa_checkin: string | null;
  createdAt: string;
}

export interface PesertaFormInput {
  nama_peserta: string;
  emel: string;
  organisasi_atau_fakulti: string;
  status_hadir?: StatusHadir;
  autoCheckIn?: boolean;
}

export interface ToastItem {
  id: string;
  type: "success" | "error";
  title: string;
  description?: string;
}
