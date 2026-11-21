import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = new Set(["Belum Hadir", "Sudah Daftar Masuk"]);

function parseId(rawId: string): number | null {
  const num = Number(rawId);
  if (!Number.isInteger(num) || num <= 0) {
    return null;
  }
  return num;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json(
        { error: "ID peserta tidak sah." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Format permintaan JSON tidak sah." },
        { status: 400 }
      );
    }

    const existing = await prisma.peserta.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Rekod peserta tidak ditemui." },
        { status: 404 }
      );
    }

    const updateData: {
      nama_peserta?: string;
      emel?: string;
      organisasi_atau_fakulti?: string;
      status_hadir?: string;
      masa_checkin?: Date | null;
    } = {};

    if (body.nama_peserta !== undefined) {
      const nama =
        typeof body.nama_peserta === "string" ? body.nama_peserta.trim() : "";
      if (nama.length < 2) {
        return NextResponse.json(
          { error: "Nama peserta wajib diisi (sekurang-kurangnya 2 aksara)." },
          { status: 400 }
        );
      }
      updateData.nama_peserta = nama;
    }

    if (body.emel !== undefined) {
      const emel = typeof body.emel === "string" ? body.emel.trim() : "";
      if (!EMAIL_REGEX.test(emel)) {
        return NextResponse.json(
          { error: "Sila masukkan alamat e-mel yang sah." },
          { status: 400 }
        );
      }
      updateData.emel = emel;
    }

    if (body.organisasi_atau_fakulti !== undefined) {
      const org =
        typeof body.organisasi_atau_fakulti === "string"
          ? body.organisasi_atau_fakulti.trim()
          : "";
      if (org.length < 2) {
        return NextResponse.json(
          { error: "Organisasi atau fakulti wajib diisi." },
          { status: 400 }
        );
      }
      updateData.organisasi_atau_fakulti = org;
    }

    if (body.action === "checkin") {
      updateData.status_hadir = "Sudah Daftar Masuk";
      updateData.masa_checkin = existing.masa_checkin ?? new Date();
    } else if (body.action === "checkout") {
      updateData.status_hadir = "Belum Hadir";
      updateData.masa_checkin = null;
    } else if (body.status_hadir !== undefined) {
      if (
        typeof body.status_hadir !== "string" ||
        !VALID_STATUSES.has(body.status_hadir)
      ) {
        return NextResponse.json(
          {
            error:
              "Status hadir tidak sah. Gunakan 'Belum Hadir' atau 'Sudah Daftar Masuk'.",
          },
          { status: 400 }
        );
      }
      updateData.status_hadir = body.status_hadir;
      if (body.status_hadir === "Sudah Daftar Masuk") {
        updateData.masa_checkin = existing.masa_checkin ?? new Date();
      } else {
        updateData.masa_checkin = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tiada medan sah untuk dikemaskini." },
        { status: 400 }
      );
    }

    const updated = await prisma.peserta.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Rekod peserta tidak ditemui." },
        { status: 404 }
      );
    }
    console.error("PATCH /api/peserta/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengemaskini rekod peserta." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json(
        { error: "ID peserta tidak sah." },
        { status: 400 }
      );
    }

    await prisma.peserta.delete({ where: { id } });

    return NextResponse.json(
      { message: "Rekod peserta berjaya dipadam." },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Rekod peserta tidak ditemui." },
        { status: 404 }
      );
    }
    console.error("DELETE /api/peserta/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memadam rekod peserta." },
      { status: 500 }
    );
  }
}
