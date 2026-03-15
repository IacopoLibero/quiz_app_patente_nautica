import React from 'react';
import styles from './BarChart.module.css';

export default function BarChart({ data }) {
  // data: [{ label, corrette, totale }]
  return (
    <div className={styles.chart}>
      {data.map(({ label, corrette, totale }) => {
        const pct = totale > 0 ? Math.round((corrette / totale) * 100) : 0;
        const color = pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--error)';
        return (
          <div key={label} className={styles.row}>
            <span className={styles.label}>{label}</span>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: `${pct}%`, background: color }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${pct}%`}
              />
            </div>
            <span className={styles.value}>{pct}% ({corrette}/{totale})</span>
          </div>
        );
      })}
    </div>
  );
}
