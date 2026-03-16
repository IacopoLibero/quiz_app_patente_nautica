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
  const saveSessione = useCallback((sessione, domandeSbagliate, domandeTotali, skipSession = false) => {
    const stats = getNauticaStats();

    if (!skipSession) {
      stats.sessioni.push({ ...sessione, data: new Date().toISOString() });
    }

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

    // Build/update question→category map, then recompute per-category from current sets
    const qMap = { ...(stats.questionCategories || {}) };
    for (const q of domandeTotali) { if (q.categoria) qMap[q.id] = q.categoria; }
    stats.questionCategories = qMap;

    const rpc = {};
    for (const [idKey, cat] of Object.entries(qMap)) {
      // Object.entries always returns string keys; IDs in Sets may be numbers
      const idNum = Number(idKey);
      const inSbagl = sbagliateSet.has(idKey) || sbagliateSet.has(idNum);
      const inCorr  = corretteSet.has(idKey)  || corretteSet.has(idNum);
      if (!rpc[cat]) rpc[cat] = { corrette: 0, totale: 0 };
      if (inSbagl || inCorr) {
        rpc[cat].totale += 1;
        if (inCorr && !inSbagl) rpc[cat].corrette += 1;
      }
    }
    stats.rispostePerCategoria = rpc;

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
  const saveSessione = useCallback((sessione, domandeSbagliate, domandeTotali, skipSession = false) => {
    const stats = getVelaStats();

    if (!skipSession) {
      stats.sessioni.push({ ...sessione, data: new Date().toISOString() });
    }

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
  const saveSessione = useCallback((sessione, domandeSbagliate, domandeTotali, skipSession = false) => {
    const stats = getD1Stats();

    if (!skipSession) {
      stats.sessioni.push({ ...sessione, data: new Date().toISOString() });
    }

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

    const qMap = { ...(stats.questionCategories || {}) };
    for (const q of domandeTotali) { if (q.categoria) qMap[q.id] = q.categoria; }
    stats.questionCategories = qMap;

    const rpc = {};
    for (const [idKey, cat] of Object.entries(qMap)) {
      const idNum = Number(idKey);
      const inSbagl = sbagliateSet.has(idKey) || sbagliateSet.has(idNum);
      const inCorr  = corretteSet.has(idKey)  || corretteSet.has(idNum);
      if (!rpc[cat]) rpc[cat] = { corrette: 0, totale: 0 };
      if (inSbagl || inCorr) {
        rpc[cat].totale += 1;
        if (inCorr && !inSbagl) rpc[cat].corrette += 1;
      }
    }
    stats.rispostePerCategoria = rpc;

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
