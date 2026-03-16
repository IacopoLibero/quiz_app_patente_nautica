// Parse range string: "lat.42°48'.2÷48'.8 N  long.010°08'.1÷08'.7 E"
export function parseCoordRange(valore) {
  const latMatch = valore.match(/lat\.(\d+)°(\d+)'\.(\d+)÷(\d+)'\.(\d+)\s*([NS])/i);
  const lonMatch = valore.match(/long\.(\d+)°(\d+)'\.(\d+)÷(\d+)'\.(\d+)\s*([EW])/i);
  if (!latMatch || !lonMatch) return null;
  return {
    lat: {
      deg: parseInt(latMatch[1]),
      minMin: parseFloat(`${latMatch[2]}.${latMatch[3]}`),
      minMax: parseFloat(`${latMatch[4]}.${latMatch[5]}`),
      dir: latMatch[6].toUpperCase(),
    },
    lon: {
      deg: parseInt(lonMatch[1]),
      minMin: parseFloat(`${lonMatch[2]}.${lonMatch[3]}`),
      minMax: parseFloat(`${lonMatch[4]}.${lonMatch[5]}`),
      dir: lonMatch[6].toUpperCase(),
    },
  };
}

const toMinutes = (timeStr) => {
  const [h, m] = String(timeStr).split(':').map(Number);
  return h * 60 + m;
};

export function validateQuesito(quesito, userValue) {
  switch (quesito.tipo) {
    case 'distanza':
    case 'velocita':
    case 'carburante': {
      const v = parseFloat(String(userValue ?? '').replace(',', '.'));
      if (isNaN(v)) return false;
      return v >= quesito.min && v <= quesito.max;
    }
    case 'ora_arrivo': {
      const s = String(userValue ?? '');
      if (!s.includes(':')) return false;
      const userMins = toMinutes(s);
      return userMins >= toMinutes(quesito.min) && userMins <= toMinutes(quesito.max);
    }
    case 'coord_partenza':
    case 'coord_arrivo': {
      if (!userValue || typeof userValue !== 'object') return false;
      const range = parseCoordRange(quesito.valore);
      if (!range) return false;
      const { latDeg, latMin, latDir, lonDeg, lonMin, lonDir } = userValue;
      const latMinF = parseFloat(String(latMin ?? '').replace(',', '.'));
      const lonMinF = parseFloat(String(lonMin ?? '').replace(',', '.'));
      if (isNaN(latMinF) || isNaN(lonMinF)) return false;
      if (parseInt(latDeg) !== range.lat.deg) return false;
      if (String(latDir).toUpperCase() !== range.lat.dir) return false;
      if (latMinF < range.lat.minMin || latMinF > range.lat.minMax) return false;
      if (parseInt(lonDeg) !== range.lon.deg) return false;
      if (String(lonDir).toUpperCase() !== range.lon.dir) return false;
      if (lonMinF < range.lon.minMin || lonMinF > range.lon.minMax) return false;
      return true;
    }
    default:
      return false;
  }
}

export function formatCorrectAnswer(quesito) {
  switch (quesito.tipo) {
    case 'distanza': return `${quesito.min} ÷ ${quesito.max} M`;
    case 'velocita': return `${quesito.min} ÷ ${quesito.max} nodi`;
    case 'carburante':
      return quesito.min === quesito.max
        ? `${quesito.min} lt`
        : `${quesito.min} ÷ ${quesito.max} lt`;
    case 'ora_arrivo': return `${quesito.min} ÷ ${quesito.max}`;
    case 'coord_partenza':
    case 'coord_arrivo': return quesito.valore;
    default: return '';
  }
}
