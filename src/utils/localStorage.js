export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const DEFAULT_NAUTICA_STATS = {
  sessioni: [],
  domandeSbagliate: [],
  domandeCorrette: [],
  rispostePerCategoria: {
    scafo: { corrette: 0, totale: 0 },
    motori: { corrette: 0, totale: 0 },
    sicurezza: { corrette: 0, totale: 0 },
    manovre: { corrette: 0, totale: 0 },
    colreg: { corrette: 0, totale: 0 },
    meteorologia: { corrette: 0, totale: 0 },
    navigazione: { corrette: 0, totale: 0 },
    normativa: { corrette: 0, totale: 0 },
  },
  corretteConsecutive: {},
};

const DEFAULT_VELA_STATS = {
  sessioni: [],
  domandeSbagliate: [],
  domandeCorrette: [],
  corretteConsecutive: {},
};

export function getNauticaStats() {
  return getItem('nautica_stats', DEFAULT_NAUTICA_STATS);
}

export function getVelaStats() {
  return getItem('vela_stats', DEFAULT_VELA_STATS);
}

export function saveNauticaStats(stats) {
  setItem('nautica_stats', stats);
}

export function saveVelaStats(stats) {
  setItem('vela_stats', stats);
}

const DEFAULT_D1_STATS = {
  sessioni: [],
  domandeSbagliate: [],
  domandeCorrette: [],
  rispostePerCategoria: {
    scafo: { corrette: 0, totale: 0 },
    motori: { corrette: 0, totale: 0 },
    sicurezza: { corrette: 0, totale: 0 },
    manovre: { corrette: 0, totale: 0 },
    colreg: { corrette: 0, totale: 0 },
    meteorologia: { corrette: 0, totale: 0 },
    navigazione: { corrette: 0, totale: 0 },
    normativa: { corrette: 0, totale: 0 },
  },
  corretteConsecutive: {},
};

export function getD1Stats() {
  return getItem('d1_stats', DEFAULT_D1_STATS);
}

export function saveD1Stats(stats) {
  setItem('d1_stats', stats);
}

const DEFAULT_CARTEGGIO_OLTRE_STATS = {
  sessioni: [],
  perCarta: {},
};

export function getCarteggioOltreStats() {
  return getItem('carteggio_oltre_stats', DEFAULT_CARTEGGIO_OLTRE_STATS);
}

export function saveCarteggioOltreStats(stats) {
  setItem('carteggio_oltre_stats', stats);
}

export function addCarteggioOltreResult({ carta, settore, argomento, progressivo, passed }) {
  const stats = getCarteggioOltreStats();
  stats.sessioni.push({ carta, settore, argomento, progressivo, passed, data: new Date().toISOString() });
  if (!stats.perCarta[carta]) stats.perCarta[carta] = { totale: 0, corrette: 0 };
  stats.perCarta[carta].totale += 1;
  if (passed) stats.perCarta[carta].corrette += 1;
  saveCarteggioOltreStats(stats);
}

const DEFAULT_CARTEGGIO_STATS = {
  sessioni: [],
  rispostePerSettore: {},
};

export function getCarteggioStats() {
  return getItem('carteggio_stats', DEFAULT_CARTEGGIO_STATS);
}

export function saveCarteggioStats(stats) {
  setItem('carteggio_stats', stats);
}

export function addCarteggioSession({ score, totale, settore, progressivo, passed }) {
  const stats = getCarteggioStats();
  stats.sessioni.push({ score, totale, settore, progressivo, passed, data: new Date().toISOString() });
  if (!stats.rispostePerSettore[settore]) {
    stats.rispostePerSettore[settore] = { sessioni: 0, promossi: 0 };
  }
  stats.rispostePerSettore[settore].sessioni += 1;
  if (passed) stats.rispostePerSettore[settore].promossi += 1;
  saveCarteggioStats(stats);
}
