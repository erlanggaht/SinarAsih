export const BRAND_NAME = "Sinar Asih Sumedang";

const PANEL_BASE = "/sa933k-panel";
const API_BASE = `/api${PANEL_BASE}`;

export const ROUTES = {
  home: "/",
  catalog: "/catalog",
  team: "/team",
  gallery: "/gallery",
  panel: {
    dashboard: PANEL_BASE,
    login: `${PANEL_BASE}/login`,
    products: `${PANEL_BASE}/products`,
    categories: `${PANEL_BASE}/categories`,
    stock: `${PANEL_BASE}/stock`,
    profile: `${PANEL_BASE}/profile`,
    admins: `${PANEL_BASE}/admins`,
  },
} as const;

export const API_ROUTES = {
  products: `${API_BASE}/products`,
  categories: `${API_BASE}/categories`,
  stock: `${API_BASE}/stock`,
  profile: `${API_BASE}/profile`,
  admins: `${API_BASE}/admins`,
} as const;

export const ANCHORS = {
  top: "#",
  mainContent: "#main-content",
  categories: "#categories",
  products: "#products",
} as const;

export const EXTERNAL_LINKS = {
  email: "admin@sinarasihgadgetcentre.com",
  whatsappBase: "https://wa.me",
  whatsappNumber: "6281313555545",
  maps: {
    search: "https://maps.app.goo.gl/fks4FPQcnmvZKj2G9",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=Sinar%20Asih%20Gadget%Center%20Sumedang",
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1980.6521609711647!2d107.9213973388073!3d-6.854079185244184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68d186c37e5c53%3A0xd86d1db22e04b6fa!2sSinar%20Asih%20Gadget%20Center%20Sumedang!5e0!3m2!1sid!2sid!4v1791881599402!5m2!1sid!2sid",
  },
  brands: {
    oppo: "https://www.oppo.com/id/",
    vivo: "https://www.vivo.com/id",
    samsung: "https://www.samsung.com/id/",
    realme: "https://www.realme.com/id/",
    xiaomi: "https://www.mi.co.id/id/",
    infinix: "https://id.infinixmobility.com/",
    tecno: "https://www.tecno-mobile.com/id/",
    asus: "https://www.asus.com/id/",
    lenovo: "https://www.lenovo.com/id/id/",
  },
} as const;

export function getWhatsAppUrl(message?: string, number: string = EXTERNAL_LINKS.whatsappNumber) {
  const url = `${EXTERNAL_LINKS.whatsappBase}/${number}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export const PANEL_MENU = [
  {
    id: "products",
    label: "Produk",
    description: "Kelola informasi, harga, kategori, dan status produk.",
    href: ROUTES.panel.products,
  },
  {
    id: "categories",
    label: "Kategori",
    description: "Atur pengelompokan produk dan status kategori.",
    href: ROUTES.panel.categories,
  },
  {
    id: "stock",
    label: "Stok",
    description: "Catat barang masuk, barang keluar, dan riwayat stok.",
    href: ROUTES.panel.stock,
  },
  {
    id: "profile",
    label: "Profil saya",
    description: "Kelola nama, username, dan informasi akun sendiri.",
    href: ROUTES.panel.profile,
  },
  {
    id: "admins",
    label: "Akun pengelola",
    description: "Kelola akun, peran, dan status pengelola toko.",
    href: ROUTES.panel.admins,
  },
] as const;
