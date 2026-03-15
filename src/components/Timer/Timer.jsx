import React from 'react';
import styles from './Timer.module.css';

export default function Timer({ secondsLeft }) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= 60;
  const isDanger = secondsLeft <= 30;

  return (
    <div
      className={`${styles.timer} ${isWarning ? styles.warning : ''} ${isDanger ? styles.danger : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={`Tempo rimasto: ${minutes} minuti e ${seconds} secondi`}
    >
      ⏱ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
