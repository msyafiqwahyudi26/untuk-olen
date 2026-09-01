/**
 * Daftar aset 3D — satu-satunya tempat yang tahu ada aset apa saja.
 *
 * Halaman /aset membaca daftar ini, jadi setiap aset baru otomatis muncul di
 * pratinjau tanpa mengedit halamannya. `tinggi` dipakai pratinjau untuk
 * menaruh kamera; isi dengan ukuran nyata benda itu dalam satuan dunia
 * (1 satuan = 30 cm).
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export type AssetEntry = {
  id: string;
  nama: string;
  catatan: string;
  /** ukuran terbesar benda, dalam satuan dunia — dipakai menaruh kamera */
  tinggi: number;
  /**
   * Sudut pandang pratinjau. Benda pipih (bintang laut, piring, tikar) harus
   * dilihat dari atas; dilihat mendatar mereka cuma tampak seperti kubah dan
   * bentuknya tidak bisa dinilai sama sekali.
   */
  pandang?: "samping" | "miring" | "atas";
  /**
   * Geser ke atas di pratinjau. Untuk benda yang titik nolnya di TENGAH,
   * bukan di dasar — paus berputar di sumbu tengah badannya, jadi tanpa ini
   * separuhnya tenggelam di bawah lantai panggung.
   */
  angkat?: number;
  /**
   * Ruang pratinjau. Bakunya `darat`: latar terang, cahaya matahari.
   *
   * Makhluk laut harus dinilai di ruang `laut` — gelap, cahaya dari atas,
   * kabut biru. Alasannya sama dengan alasan bintang laut harus dilihat dari
   * atas: ubur-ubur yang menyala dinilai di ruang putih terang tidak
   * menunjukkan apa pun yang perlu dinilai. Pendarnya hilang, badan tembus
   * cahayanya jadi buram, dan yang tersisa cuma siluet.
   */
  ruang?: "darat" | "laut";
  Comp: ComponentType<{ animate?: boolean }>;
};

const load = (p: () => Promise<{ default: ComponentType<{ animate?: boolean }> }>) =>
  dynamic(p, { ssr: false });

export const ASSETS: AssetEntry[] = [
  {
    id: "flamingo",
    nama: "Flamingo",
    catatan: "Dua kaki menapak, sendi pergelangan menekuk ke belakang, paruh membelok tajam ke bawah.",
    tinggi: 4.1,
    Comp: load(() => import("./Flamingo")),
  },
  {
    id: "paus",
    nama: "Paus",
    catatan: "Moncong tumpul, sirip punggung menyapu, badan 2:1 supaya terbaca dari jauh.",
    tinggi: 6.6,
    angkat: 1.9,
    Comp: load(() => import("./Paus")),
  },
  {
    id: "lumba-lumba",
    nama: "Lumba-lumba",
    catatan:
      "Bukan paus yang dikecilkan. Tiga hal yang membedakan: lekuk antara jidat dan moncong, sirip punggung berbentuk sabit (tepi belakang CEKUNG, kalau lurus jadi hiu), dan badan 5,6:1 bukan 2:1. Ekornya mengayun naik-turun, bukan ke samping.",
    tinggi: 9.5,
    angkat: 1.4,
    ruang: "laut",
    Comp: load(() => import("./LumbaLumba")),
  },
  {
    id: "ubur-ubur",
    nama: "Ubur-ubur",
    catatan:
      "Denyutnya tidak simetris (mengatup cepat, mengembang pelan) dan tentakelnya tertinggal 0,18 periode di belakang payung. Dua hal itu yang membuatnya berenang, bukan bernapas. Empat tapal kuda di dalam payung yang membuatnya terbaca sebagai ubur-ubur.",
    tinggi: 4.6,
    ruang: "laut",
    Comp: load(() => import("./UburUbur")),
  },
  {
    id: "kepiting",
    nama: "Kepiting",
    catatan: "Delapan kaki dua sendi, mata bertangkai, capit bisa melambai.",
    tinggi: 1.5,
    Comp: load(() => import("./Kepiting")),
  },
  {
    id: "bintang-laut",
    nama: "Bintang Laut",
    catatan: "Permukaan parametrik, bukan hasil extrude. Lengannya gemuk dan lembahnya tetap terbuka.",
    tinggi: 2.2,
    pandang: "atas",
    Comp: load(() => import("./BintangLaut")),
  },
  {
    id: "camar",
    nama: "Camar",
    catatan: "Belum dipakai di scene. Disimpan karena bentuknya sudah dekat.",
    tinggi: 6.2,
    Comp: load(() => import("./Camar")),
  },
  {
    id: "awan",
    nama: "Awan",
    catatan: "Gumpalan bola yang tiap butirnya bernapas sendiri.",
    tinggi: 5.5,
    angkat: 1.6,
    Comp: load(() => import("./Awan")),
  },
  {
    id: "matahari",
    nama: "Matahari",
    catatan: "Bola bercahaya berlapis, bukan cakram datar.",
    tinggi: 6,
    angkat: 3.2,
    Comp: load(() => import("./Matahari")),
  },
  {
    id: "bulan",
    nama: "Bulan",
    catatan: "Memantulkan cahaya, bukan memancarkan: ada sisi terang, sisi redup, dan kawah. Matahari yang diputihkan cuma jadi lubang putih di langit malam.",
    tinggi: 5,
    angkat: 2.6,
    Comp: load(() => import("./Bulan")),
  },
  {
    id: "keranjang",
    nama: "Keranjang Piknik",
    catatan: "Anyaman melingkar, gagang berdiri, kain menjuntai keluar.",
    tinggi: 1.6,
    Comp: load(() => import("./Keranjang")),
  },
  {
    id: "piring",
    nama: "Piring & Cookies",
    catatan: "Bibir piring direbahkan. Kalau tidak, torus-nya berdiri dan piringnya jadi mirip tas.",
    tinggi: 1.3,
    pandang: "atas",
    Comp: load(() => import("./Piring")),
  },
  {
    id: "cangkir",
    nama: "Cangkir",
    catatan: "Telinga cangkir justru TIDAK dirotasi; torus lahir berdiri dan memang begitu seharusnya.",
    tinggi: 0.8,
    pandang: "miring",
    Comp: load(() => import("./Cangkir")),
  },
  {
    id: "tikar",
    nama: "Tikar Piknik",
    catatan: "Kain kotak-kotak yang tepinya bergerak tertiup angin.",
    tinggi: 7,
    pandang: "atas",
    Comp: load(() => import("./Tikar")),
  },
  {
    id: "bunga",
    nama: "Bunga Tergeletak",
    catatan: "Diletakkan rebah di atas kain, bukan tumbuh berdiri.",
    tinggi: 1.4,
    pandang: "atas",
    Comp: load(() => import("./Bunga")),
  },
  {
    id: "bunga-kecil",
    nama: "Bunga Kecil Putih",
    catatan: "Daisy yang tergeletak di sudut tikar. Kelopaknya ramping dan banyak, itu yang membedakannya dari bunga matahari yang dicat putih.",
    tinggi: 1.1,
    pandang: "atas",
    Comp: load(() => import("./BungaKecil")),
  },
  {
    id: "buah",
    nama: "Buah",
    catatan: "Apel, jeruk, pisang. Menggantikan piring di sisi kiri tikar. Piring selalu bersinggungan dengan keranjang karena sama-sama lebar dan datar.",
    tinggi: 0.8,
    pandang: "miring",
    Comp: load(() => import("./Buah")),
  },
  {
    id: "kerang",
    nama: "Kerang & Kerikil",
    catatan: "Benda kecil yang memberi ukuran pada pasir.",
    tinggi: 0.7,
    pandang: "miring",
    Comp: load(() => import("./Kerang")),
  },
];
