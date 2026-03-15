import React from 'react';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div
      className={styles.container}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Domanda ${current} di ${total}`}
    >
      <div
        className={styles.fill}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
