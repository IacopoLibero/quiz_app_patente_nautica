import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header({ title, showBack = true, current, total, errori, maxErrori }) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && (
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Torna indietro"
          >
            <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
        <span className={styles.title}>{title}</span>
      </div>
      {current !== undefined && total !== undefined && (
        <div className={styles.progress} aria-label={`Domanda ${current} di ${total}`}>
          <span aria-hidden="true">{current}/{total}</span>
          {errori !== undefined && maxErrori !== undefined && (
            <span
              className={styles.errori}
              aria-live="polite"
              aria-label={`Errori: ${errori} su ${maxErrori}`}
            >
              <X size={13} strokeWidth={2.5} aria-hidden="true" className={styles.erroriIcon} />
              {errori}/{maxErrori}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
