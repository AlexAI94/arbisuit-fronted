export type EntityType = "bank" | "wallet" | "exchange";

export interface EntityDef {
  name: string;
  type: EntityType;
  domain: string; // para traer el logo
  country?: string;
}

// Logo URL helper — usa Clearbit con fallback a Google favicon
export function logoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export const ENTITIES: EntityDef[] = [
  // ── BANCOS ARGENTINA ──────────────────────────────────────────────────────
  { name: "Banco Galicia",       type: "bank", domain: "galicia.com.ar",        country: "AR" },
  { name: "Banco Nación",        type: "bank", domain: "bna.com.ar",            country: "AR" },
  { name: "Banco Santander",     type: "bank", domain: "santander.com.ar",      country: "AR" },
  { name: "BBVA Argentina",      type: "bank", domain: "bbva.com.ar",           country: "AR" },
  { name: "HSBC Argentina",      type: "bank", domain: "hsbc.com.ar",           country: "AR" },
  { name: "Banco Macro",         type: "bank", domain: "macro.com.ar",          country: "AR" },
  { name: "Banco Provincia",     type: "bank", domain: "bapro.com.ar",          country: "AR" },
  { name: "Banco Ciudad",        type: "bank", domain: "bancociudad.com.ar",    country: "AR" },
  { name: "Banco Patagonia",     type: "bank", domain: "bancopatagonia.com.ar", country: "AR" },
  { name: "ICBC Argentina",      type: "bank", domain: "icbc.com.ar",           country: "AR" },
  { name: "Banco Credicoop",     type: "bank", domain: "credicoop.com.ar",      country: "AR" },
  { name: "Brubank",             type: "bank", domain: "brubank.com",           country: "AR" },
  { name: "Banco Supervielle",   type: "bank", domain: "supervielle.com.ar",    country: "AR" },
  { name: "Banco Comafi",        type: "bank", domain: "comafi.com.ar",         country: "AR" },
  { name: "Banco Columbia",      type: "bank", domain: "columbia.com.ar",       country: "AR" },
  { name: "Banco Hipotecario",   type: "bank", domain: "hipotecario.com.ar",    country: "AR" },

  // ── BILLETERAS / FINTECH ──────────────────────────────────────────────────
  { name: "Mercado Pago",        type: "wallet", domain: "mercadopago.com.ar",  country: "AR" },
  { name: "Ualá",                type: "wallet", domain: "uala.com.ar",         country: "AR" },
  { name: "Personal Pay",        type: "wallet", domain: "personal.com.ar",     country: "AR" },
  { name: "MODO",                type: "wallet", domain: "modo.com.ar",         country: "AR" },
  { name: "Naranja X",           type: "wallet", domain: "naranjax.com",        country: "AR" },
  { name: "Cuenta DNI",          type: "wallet", domain: "bapro.com.ar",        country: "AR" },
  { name: "Belo",                type: "wallet", domain: "belo.app",            country: "AR" },
  { name: "Prex",                type: "wallet", domain: "prexcard.com",        country: "AR" },
  { name: "Pomelo",              type: "wallet", domain: "pomelo.la",           country: "AR" },
  { name: "Bind",                type: "wallet", domain: "bind.com.ar",         country: "AR" },
  { name: "PayPal",              type: "wallet", domain: "paypal.com",          country: "US" },
  { name: "Wise",                type: "wallet", domain: "wise.com",            country: "UK" },

  // ── EXCHANGES LOCALES ─────────────────────────────────────────────────────
  { name: "Lemon Cash",          type: "exchange", domain: "lemon.me",          country: "AR" },
  { name: "Buenbit",             type: "exchange", domain: "buenbit.com",       country: "AR" },
  { name: "Ripio",               type: "exchange", domain: "ripio.com",         country: "AR" },
  { name: "Bitso",               type: "exchange", domain: "bitso.com",         country: "MX" },
  { name: "Fiwind",              type: "exchange", domain: "fiwind.io",         country: "AR" },
  { name: "Saldo",               type: "exchange", domain: "saldo.com.ar",      country: "AR" },
  { name: "Cocos Crypto",        type: "exchange", domain: "cocos.com.ar",      country: "AR" },
  { name: "Decrypto",            type: "exchange", domain: "decrypto.la",       country: "AR" },
  { name: "TiendaCrypto",        type: "exchange", domain: "tiendacrypto.com",  country: "AR" },
  { name: "Criptala",            type: "exchange", domain: "criptala.com",      country: "AR" },

  // ── EXCHANGES INTERNACIONALES ─────────────────────────────────────────────
  { name: "Binance",             type: "exchange", domain: "binance.com",       country: "INT" },
  { name: "Bybit",               type: "exchange", domain: "bybit.com",         country: "INT" },
  { name: "OKX",                 type: "exchange", domain: "okx.com",           country: "INT" },
  { name: "Bitget",              type: "exchange", domain: "bitget.com",        country: "INT" },
  { name: "KuCoin",              type: "exchange", domain: "kucoin.com",        country: "INT" },
  { name: "MEXC",                type: "exchange", domain: "mexc.com",          country: "INT" },
  { name: "Gate.io",             type: "exchange", domain: "gate.io",           country: "INT" },
  { name: "BingX",               type: "exchange", domain: "bingx.com",        country: "INT" },
  { name: "Kraken",              type: "exchange", domain: "kraken.com",        country: "INT" },
  { name: "Coinbase",            type: "exchange", domain: "coinbase.com",      country: "INT" },
  { name: "Bitfinex",            type: "exchange", domain: "bitfinex.com",      country: "INT" },
  { name: "Huobi / HTX",        type: "exchange", domain: "htx.com",           country: "INT" },
];

export const BANKS    = ENTITIES.filter(e => e.type === "bank");
export const WALLETS  = ENTITIES.filter(e => e.type === "wallet");
export const EXCHANGES = ENTITIES.filter(e => e.type === "exchange");
