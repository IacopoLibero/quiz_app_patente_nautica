import React from 'react';
import { useNavigate } from 'react-router-dom';
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
            ←
          </button>
        )}
        <span className={styles.title}>{title}</span>
      </div>
      {current !== undefined && total !== undefined && (
        <div className={styles.progress}>
          <span>{current}/{total}</span>
          {errori !== undefined && maxErrori !== undefined && (
            <span className={styles.errori}>
              ❌ {errori}/{maxErrori}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
