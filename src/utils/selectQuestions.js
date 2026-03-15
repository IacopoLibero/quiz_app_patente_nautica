// Shuffle array (Fisher-Yates)
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Select N questions spread across the full range (for vela exam)
export function selectSpread(array, count) {
  if (array.length <= count) return shuffle(array);
  const sorted = [...array].sort((a, b) => a.id - b.id);
  const segmentSize = Math.floor(sorted.length / count);
  const result = [];
  for (let i = 0; i < count; i++) {
    const start = i * segmentSize;
    const end = i === count - 1 ? sorted.length : start + segmentSize;
    const segment = sorted.slice(start, end);
    const randomIndex = Math.floor(Math.random() * segment.length);
    result.push(segment[randomIndex]);
  }
  return result;
}

// Select questions for patente nautica exam (fixed distribution)
export function selectEsameNautica(allQuestions) {
  const distribution = {
    navigazione: 4,
    manovre: 4,
    normativa: 3,
    sicurezza: 3,
    colreg: 2,
    meteorologia: 2,
    motori: 1,
    scafo: 1,
  };

  const grouped = {};
  for (const q of allQuestions) {
    if (!grouped[q.categoria]) grouped[q.categoria] = [];
    grouped[q.categoria].push(q);
  }

  const selected = [];
  for (const [cat, count] of Object.entries(distribution)) {
    const available = grouped[cat] || [];
    const shuffled = shuffle(available);
    selected.push(...shuffled.slice(0, count));
  }

  return shuffle(selected);
}

// Select random questions
export function selectShuffle(array, count = null) {
  const shuffled = shuffle(array);
  return count ? shuffled.slice(0, count) : shuffled;
}

// Select 20 questions distributed evenly across selected categories (shuffle mode)
// categorieData: [{ key, data: [] }, ...]
export function selectShuffleCategorie(categorieData, total = 20) {
  const n = categorieData.length;
  if (n === 0) return [];
  const base = Math.floor(total / n);
  const extra = total % n;
  const result = [];
  categorieData.forEach(({ data }, i) => {
    const count = base + (i < extra ? 1 : 0);
    result.push(...shuffle(data).slice(0, count));
  });
  return shuffle(result);
}

// Select 20 questions from a single category in sequential order (by id)
export function selectCategoria(catData, total = 20) {
  const sorted = [...catData].sort((a, b) => a.id - b.id);
  return sorted.slice(0, total);
}

// Select wrong questions from stats (shuffled, max count)
export function selectSbagliate(allQuestions, wrongIds, count = 20) {
  if (!wrongIds || wrongIds.length === 0) return [];
  const wrongSet = new Set(wrongIds);
  const filtered = allQuestions.filter(q => wrongSet.has(q.id));
  const shuffled = shuffle(filtered);
  return count ? shuffled.slice(0, count) : shuffled;
}
