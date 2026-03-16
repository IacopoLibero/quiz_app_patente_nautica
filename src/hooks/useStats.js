import { useCallback } from 'react';
import {
  getNauticaStats,
  getVelaStats,
  saveNauticaStats,
  saveVelaStats,
  getD1Stats,
  saveD1Stats,
} from '../utils/localStorage';

export function useNauticaStats() {
  const saveSessione = useCallback((sessione, domandeSbagliate, domandeTotali) => {
    const stats = getNauticaStats();

    // Add session
    stats.sessioni.push({
      ...sessione,
      data: new Date().toISOString(),
    });

    // Update wrong/correct questions
    const sbagliateSet = new Set(stats.domandeSbagliate);
    const corretteSet = new Set(stats.domandeCorrette || []);
    const corretteConsecutive = { ...stats.corretteConsecutive };

    for (const q of domandeTotali) {
      const wasSbagliata = domandeSbagliate.includes(q.id);
      if (wasSbagliata) {
        sbagliateSet.add(q.id);
        corretteConsecutive[q.id] = 0;
      } else {
        corretteSet.add(q.id);
        corretteConsecutive[q.id] = (corretteConsecutive[q.id] || 0) + 1;
        if (corretteConsecutive[q.id] >= 2) {
          sbagliateSet.delete(q.id);
        }
      }
    }

    stats.domandeSbagliate = [...sbagliateSet];
    stats.domandeCorrette = [...corretteSet];
    stats.corretteConsecutive = corretteConsecutive;

    // Update per-category stats
    for (const q of domandeTotali) {
      const cat = q.categoria;
      if (!cat) continue;
      if (!stats.rispostePerCategoria[cat]) {
        stats.rispostePerCategoria[cat] = { corrette: 0, totale: 0 };
      }
      stats.rispostePerCategoria[cat].totale += 1;
      if (!domandeSbagliate.includes(q.id)) {
        stats.rispostePerCategoria[cat].corrette += 1;
      }
    }

    saveNauticaStats(stats);
  }, []);

  const resetStats = useCallback(() => {
    saveNauticaStats({
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
    });
  }, []);

  return { getNauticaStats, saveSessione, resetStats };
}

export function useVelaStats() {
  const saveSessione = useCallback((sessione, domandeSbagliate, domandeTotali) => {
    const stats = getVelaStats();

    stats.sessioni.push({
      ...sessione,
      data: new Date().toISOString(),
    });

    const sbagliateSet = new Set(stats.domandeSbagliate);
    const corretteSet = new Set(stats.domandeCorrette || []);
    const corretteConsecutive = { ...stats.corretteConsecutive };

    for (const q of domandeTotali) {
      const wasSbagliata = domandeSbagliate.includes(q.id);
      if (wasSbagliata) {
        sbagliateSet.add(q.id);
        corretteConsecutive[q.id] = 0;
      } else {
        corretteSet.add(q.id);
        corretteConsecutive[q.id] = (corretteConsecutive[q.id] || 0) + 1;
        if (corretteConsecutive[q.id] >= 2) {
          sbagliateSet.delete(q.id);
        }
      }
    }

    stats.domandeSbagliate = [...sbagliateSet];
    stats.domandeCorrette = [...corretteSet];
    stats.corretteConsecutive = corretteConsecutive;

    saveVelaStats(stats);
  }, []);

  const resetStats = useCallback(() => {
    saveVelaStats({
      sessioni: [],
      domandeSbagliate: [],
      domandeCorrette: [],
      corretteConsecutive: {},
    });
  }, []);

  return { getVelaStats, saveSessione, resetStats };
}

export function useD1Stats() {
  const saveSessione = useCallback((sessione, domandeSbagliate, domandeTotali) => {
    const stats = getD1Stats();

    stats.sessioni.push({
      ...sessione,
      data: new Date().toISOString(),
    });

    const sbagliateSet = new Set(stats.domandeSbagliate);
    const corretteSet = new Set(stats.domandeCorrette || []);
    const corretteConsecutive = { ...stats.corretteConsecutive };

    for (const q of domandeTotali) {
      const wasSbagliata = domandeSbagliate.includes(q.id);
      if (wasSbagliata) {
        sbagliateSet.add(q.id);
        corretteConsecutive[q.id] = 0;
      } else {
        corretteSet.add(q.id);
        corretteConsecutive[q.id] = (corretteConsecutive[q.id] || 0) + 1;
        if (corretteConsecutive[q.id] >= 2) {
          sbagliateSet.delete(q.id);
        }
      }
    }

    stats.domandeSbagliate = [...sbagliateSet];
    stats.domandeCorrette = [...corretteSet];
    stats.corretteConsecutive = corretteConsecutive;

    for (const q of domandeTotali) {
      const cat = q.categoria;
      if (!cat) continue;
      if (!stats.rispostePerCategoria[cat]) {
        stats.rispostePerCategoria[cat] = { corrette: 0, totale: 0 };
      }
      stats.rispostePerCategoria[cat].totale += 1;
      if (!domandeSbagliate.includes(q.id)) {
        stats.rispostePerCategoria[cat].corrette += 1;
      }
    }

    saveD1Stats(stats);
  }, []);

  const resetStats = useCallback(() => {
    saveD1Stats({
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
    });
  }, []);

  return { getD1Stats, saveSessione, resetStats };
}
