# Sinar Asih

Next.js App Router dengan TypeScript strict, Tailwind CSS, Roboto, dan tema light/dark/system.

## Development

Gunakan Node.js >=22.13.0 dan pnpm 12.10.1. Dependency belum diinstal dalam proses setup.
Developer dapat menjalankan `pnpm i`, kemudian `pnpm dev`.

| Script | Fungsi |
| ------------------- | --------------------------------------------------------------- |
| `pnpm dev` | Development dengan tooling default Next.js (Turbopack) |
| `pnpm dev:webpack` | Development alternatif jika watcher Turbopack bermasalah |
| `pnpm build` | Production build |
| `pnpm start` | Menjalankan hasil production build |
| `pnpm lint` | ESLint CLI, tanpa warning |
| `pnpm lint:fix` | Perbaikan otomatis ESLint |
| `pnpm format` | Prettier dan pengurutan class Tailwind |
| `pnpm format:check` | Memeriksa formatting |
| `pnpm typecheck` | Generate route types Next.js, lalu TypeScript tanpa emit |

`typecheck` membuat route types di `.next`, tetapi tidak menghasilkan build aplikasi.
Roboto menggunakan `next/font/google`; build pertama membutuhkan akses ke Google Fonts.

Jika Turbopack terus menampilkan `waiting for the filesystem to settle`, hentikan server
dengan Ctrl+C dan pastikan proses instalasi dependency sudah selesai sebelum menjalankan ulang.
Jika pesan tetap berulang, gunakan `pnpm dev:webpack` sebagai workaround.
Pesan tersebut menunjukkan aktivitas watcher filesystem; penyebab proses eksternalnya
tidak dapat dipastikan hanya dari log tersebut.

## Konfigurasi

Header beranda ada di `src/components/home/HomeHeader.tsx`: hero, gambar gadget lokal
dari proyek referensi, pencarian enam kategori, dan tautan konsultasi WhatsApp.
Bar email/subscribe lama diganti pencarian kategori karena subscribe referensi hanya
menampilkan alert tanpa menyimpan email. Kartu kategori membuka percakapan WhatsApp
dengan pesan sesuai kategori. Ikon menggunakan `lucide-react`, termasuk menu navigasi.
Dependency Lucide ditambahkan ke manifest tanpa menjalankan instalasi.

`src/components/AppContainer.tsx` membungkus children dengan navigasi dan elemen `main`.
Root layout memasangnya di dalam ThemeProvider. Halaman cukup mengembalikan isi konten
tanpa menambahkan elemen `main` kedua. Navbar menggunakan Tailwind dengan referensi
proyek Sinar Asih: base #F1F1F1, navbar #373737, action #068DA9, dan aksen #146C94.
Menu mobile mendukung toggle, Escape, dan menutup setelah tautan dipilih.
Tautan Alamat/Produk mengikuti anchor `address`/`products` di beranda; tambahkan ID tersebut
pada bagian konten terkait. Route `/pages/admin` dan `/pages/gallery` mengikuti proyek
referensi, tetapi halaman tersebut belum dimigrasikan ke proyek ini.

- Alias `@/*` mengarah ke `src/*`.
- ESLint menggunakan flat config resmi Next.js Core Web Vitals dan TypeScript.
  Explicit `any` diperbolehkan. Unused variables/imports tetap error;
  argumen dan caught errors dengan prefix `_` diperbolehkan.
- `eslint-config-prettier` mematikan aturan formatting yang konflik.
- Prettier memakai default semicolons, double quotes, dua spasi, dan trailing commas `all`.
  `printWidth` adalah 100. Pengurutan class hanya dilakukan `prettier-plugin-tailwindcss`.
- Tailwind CSS menggunakan PostCSS dan konfigurasi CSS-first di `src/app/globals.css`.
  Ubah branding melalui token semantic light/dark pada stylesheet tersebut.
- `next-themes` mengatur class pada `<html>`, menyimpan pilihan tema, dan mengikuti sistem
  secara default. Pemilih tema menunggu hydration agar nilai server/client konsisten.

## Versi dan validasi

Versi dipin berdasarkan npm registry saat setup. Next.js dan eslint-config-next memakai versi sama.
ESLint 9.39.5 dipilih karena plugin React, import, dan accessibility bawaan Next.js belum
mendukung ESLint 10. TypeScript 6.0.3 dipilih karena typescript-eslint mensyaratkan versi <6.1.0.

Setup telah diperiksa secara statis. Lint, formatting, typecheck, dan build belum dijalankan
karena dependency sengaja belum diinstal. Setelah instalasi manual, jalankan `pnpm format`,
`pnpm lint`, `pnpm typecheck`, dan `pnpm build` untuk validasi runtime/tooling.

Referensi: [Next.js ESLint](https://nextjs.org/docs/app/api-reference/config/eslint),
[Tailwind PostCSS](https://tailwindcss.com/docs/installation/using-postcss),
[Tailwind Prettier](https://github.com/tailwindlabs/prettier-plugin-tailwindcss),
[next-themes](https://github.com/pacocoursey/next-themes).
