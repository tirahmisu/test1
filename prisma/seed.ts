import { prisma } from "../lib/prisma";

async function main() {
  await prisma.peserta.deleteMany();

  const now = new Date();
  const minutesAgo = (mins: number) =>
    new Date(now.getTime() - mins * 60 * 1000);

  await prisma.peserta.createMany({
    data: [
      {
        nama_peserta: "Ahmad Danial Hakim bin Roslan",
        emel: "danial.hakim@student.utem.edu.my",
        organisasi_atau_fakulti: "Fakulti Teknologi Maklumat dan Komunikasi (FTMK), UTeM",
        status_hadir: "Sudah Daftar Masuk",
        masa_checkin: minutesAgo(42),
      },
      {
        nama_peserta: "Nurul Ain Syuhada binti Mohd Fauzi",
        emel: "ain.syuhada@ukm.edu.my",
        organisasi_atau_fakulti: "Fakulti Teknologi dan Sains Maklumat, UKM",
        status_hadir: "Sudah Daftar Masuk",
        masa_checkin: minutesAgo(35),
      },
      {
        nama_peserta: "Muhammad Irfan Zaki bin Kamarulzaman",
        emel: "irfan.zaki@utm.my",
        organisasi_atau_fakulti: "Fakulti Komputeran, UTM Skudai",
        status_hadir: "Sudah Daftar Masuk",
        masa_checkin: minutesAgo(28),
      },
      {
        nama_peserta: "Tan Wei Ming",
        emel: "weiming.tan@mdec.com.my",
        organisasi_atau_fakulti: "Perbadanan Ekonomi Digital Malaysia (MDEC)",
        status_hadir: "Sudah Daftar Masuk",
        masa_checkin: minutesAgo(19),
      },
      {
        nama_peserta: "Siti Hajar binti Abdul Rahman",
        emel: "siti.hajar@uitm.edu.my",
        organisasi_atau_fakulti: "Kolej Pengkomputeran, Informatik dan Matematik, UiTM",
        status_hadir: "Belum Hadir",
        masa_checkin: null,
      },
      {
        nama_peserta: "Kavitha a/p Subramaniam",
        emel: "kavitha.s@um.edu.my",
        organisasi_atau_fakulti: "Fakulti Sains Komputer dan Teknologi Maklumat, UM",
        status_hadir: "Sudah Daftar Masuk",
        masa_checkin: minutesAgo(12),
      },
      {
        nama_peserta: "Amirul Afiq bin Norazman",
        emel: "amirul.afiq@petronas.com.my",
        organisasi_atau_fakulti: "Petronas Digital Sdn Bhd",
        status_hadir: "Belum Hadir",
        masa_checkin: null,
      },
      {
        nama_peserta: "Nur Farhana binti Ismail",
        emel: "farhana.ismail@upm.edu.my",
        organisasi_atau_fakulti: "Fakulti Sains Komputer dan Teknologi Maklumat, UPM",
        status_hadir: "Belum Hadir",
        masa_checkin: null,
      },
      {
        nama_peserta: "Jason Lim Yong Sheng",
        emel: "jason.lim@sarawakdigital.my",
        organisasi_atau_fakulti: "Sarawak Digital Economy Corporation",
        status_hadir: "Sudah Daftar Masuk",
        masa_checkin: minutesAgo(6),
      },
      {
        nama_peserta: "Dayangku Nabilah binti Awangku Zaidi",
        emel: "nabilah.zaidi@unimas.my",
        organisasi_atau_fakulti: "Fakulti Sains Komputer dan Teknologi Maklumat, UNIMAS",
        status_hadir: "Belum Hadir",
        masa_checkin: null,
      },
    ],
  });

  console.log("Berjaya menyemai 10 rekod peserta ke dalam pangkalan data.");
}

main()
  .catch((error) => {
    console.error("Ralat semasa menyemai data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
