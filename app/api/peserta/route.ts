import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const peserta = await prisma.peserta.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ data: peserta }, { status: 200 });
  } catch (error) {
    console.error("GET /api/peserta error:", error);
    return NextResponse.json(
      {
        error:
          "Gagal menyambung ke pangkalan data PostgreSQL. Sila pastikan DATABASE_URL dikonfigurasi dengan betul.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Format permintaan JSON tidak sah." },
        { status: 400 }
      );
    }

    const nama_peserta =
      typeof body.nama_peserta === "string" ? body.nama_peserta.trim() : "";
    const emel = typeof body.emel === "string" ? body.emel.trim() : "";
    const organisasi_atau_fakulti =
      typeof body.organisasi_atau_fakulti === "string"
        ? body.organisasi_atau_fakulti.trim()
        : "";
    const autoCheckIn = Boolean(body.autoCheckIn);

    if (!nama_peserta || nama_peserta.length < 2) {
      return NextResponse.json(
        { error: "Nama peserta wajib diisi (sekurang-kurangnya 2 aksara)." },
        { status: 400 }
      );
    }

    if (!emel || !EMAIL_REGEX.test(emel)) {
      return NextResponse.json(
        { error: "Sila masukkan alamat e-mel yang sah." },
        { status: 400 }
      );
    }

    if (!organisasi_atau_fakulti || organisasi_atau_fakulti.length < 2) {
      return NextResponse.json(
        { error: "Organisasi atau fakulti wajib diisi." },
        { status: 400 }
      );
    }

    const status_hadir =
      body.status_hadir === "Sudah Daftar Masuk" || autoCheckIn
        ? "Sudah Daftar Masuk"
        : "Belum Hadir";

    const masa_checkin =
      status_hadir === "Sudah Daftar Masuk" ? new Date() : null;

    const created = await prisma.peserta.create({
      data: {
        nama_peserta,
        emel,
        organisasi_atau_fakulti,
        status_hadir,
        masa_checkin,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/peserta error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftarkan peserta baharu ke dalam pangkalan data." },
      { status: 500 }
    );
  }
}
