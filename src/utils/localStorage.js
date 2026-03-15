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
