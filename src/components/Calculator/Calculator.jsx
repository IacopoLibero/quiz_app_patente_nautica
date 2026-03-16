import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './Calculator.module.css';

const FORMULAS = [
  { id: 'dvt_d', label: 'D = V × T', solve: 'D', inputs: ['V', 'T'] },
  { id: 'dvt_v', label: 'V = D / T', solve: 'V', inputs: ['D', 'T'] },
  { id: 'dvt_t', label: 'T = D / V', solve: 'T', inputs: ['D', 'V'] },
  { id: 'carb',  label: 'C = L × T', solve: 'C', inputs: ['L', 'T'] },
];

const INPUT_LABELS = { D: 'Distanza (M)', V: 'Velocità (nodi)', T: 'Tempo (ore)', L: 'Consumo (l/h)', C: 'Carburante (lt)' };

function parseTime(val) {
  // Accept "1.5" (hours) or "1:30" (HH:MM)
  const s = String(val).trim();
  if (s.includes(':')) {
    const [h, m] = s.split(':').map(Number);
    return h + m / 60;
  }
  return parseFloat(s);
}

function solveFormula(formula, vals) {
  const get = (k) => parseTime(vals[k] ?? '');
  switch (formula.id) {
    case 'dvt_d': return (get('V') * get('T')).toFixed(2) + ' M';
    case 'dvt_v': return (get('D') / get('T')).toFixed(2) + ' nodi';
    case 'dvt_t': {
      const hours = get('D') / get('V');
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${hours.toFixed(2)} ore  (${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')})`;
    }
    case 'carb': return (get('L') * get('T')).toFixed(2) + ' lt';
    default: return '';
  }
}

function BasicCalc() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [waitNext, setWaitNext] = useState(false);

  function input(val) {
    if (waitNext) {
      setDisplay(val === '.' ? '0.' : val);
      setWaitNext(false);
    } else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(display === '0' && val !== '.' ? val : display + val);
    }
  }

  function operator(o) {
    setPrev(parseFloat(display));
    setOp(o);
    setWaitNext(true);
  }

  function equals() {
    if (prev === null || op === null) return;
    const cur = parseFloat(display);
    let res;
    if (op === '+') res = prev + cur;
    else if (op === '-') res = prev - cur;
    else if (op === '×') res = prev * cur;
    else if (op === '÷') res = cur !== 0 ? prev / cur : 'Err';
    const str = typeof res === 'number' ? parseFloat(res.toFixed(8)).toString() : res;
    setDisplay(str);
    setPrev(null);
    setOp(null);
    setWaitNext(true);
  }

  function clear() { setDisplay('0'); setPrev(null); setOp(null); setWaitNext(false); }
  function backspace() {
    if (waitNext) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }

  const btn = (label, action, cls) => (
    <button className={`${styles.calcBtn} ${cls ? styles[cls] : ''}`} onClick={action}>
      {label}
    </button>
  );

  return (
    <div className={styles.basicCalc}>
      <div className={styles.display}>
        {op && <span className={styles.displayOp}>{prev} {op}</span>}
        <span className={styles.displayVal}>{display}</span>
      </div>
      <div className={styles.grid}>
        {btn('C', clear, 'btnClear')}
        {btn('⌫', backspace, 'btnOp')}
        {btn('÷', () => operator('÷'), 'btnOp')}
        {btn('×', () => operator('×'), 'btnOp')}
        {btn('7', () => input('7'))}
        {btn('8', () => input('8'))}
        {btn('9', () => input('9'))}
        {btn('-', () => operator('-'), 'btnOp')}
        {btn('4', () => input('4'))}
        {btn('5', () => input('5'))}
        {btn('6', () => input('6'))}
        {btn('+', () => operator('+'), 'btnOp')}
        {btn('1', () => input('1'))}
        {btn('2', () => input('2'))}
        {btn('3', () => input('3'))}
        <button className={`${styles.calcBtn} ${styles.btnEquals} ${styles.btnEqTall}`} onClick={equals}>=</button>
        {btn('0', () => input('0'), 'btnZero')}
        {btn('.', () => input('.'))}
      </div>
    </div>
  );
}

function NauticalCalc() {
  const [formulaId, setFormulaId] = useState('dvt_d');
  const [vals, setVals] = useState({});
  const [result, setResult] = useState(null);
  const formula = FORMULAS.find(f => f.id === formulaId);

  function calc() {
    const res = solveFormula(formula, vals);
    setResult(res);
  }

  function changeFormula(id) {
    setFormulaId(id);
    setVals({});
    setResult(null);
  }

  return (
    <div className={styles.nauticalCalc}>
      <div className={styles.formulaGrid}>
        {FORMULAS.map(f => (
          <button
            key={f.id}
            className={`${styles.formulaBtn} ${formulaId === f.id ? styles.formulaBtnActive : ''}`}
            onClick={() => changeFormula(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.formulaInputs}>
        {formula.inputs.map(k => (
          <div key={k} className={styles.formulaRow}>
            <label className={styles.formulaLabel}>{INPUT_LABELS[k]}</label>
            <input
              className={styles.formulaInput}
              type="text"
              inputMode="decimal"
              placeholder={k === 'T' ? 'es. 1.5 o 1:30' : '0'}
              value={vals[k] ?? ''}
              onChange={e => { setVals(v => ({ ...v, [k]: e.target.value })); setResult(null); }}
            />
          </div>
        ))}
        <button className={styles.calcGoBtn} onClick={calc}>Calcola</button>
        {result && (
          <div className={styles.formulaResult}>
            <span className={styles.formulaResultLabel}>{INPUT_LABELS[formula.solve]}</span>
            <span className={styles.formulaResultVal}>{result}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Calculator({ onClose }) {
  const [tab, setTab] = useState('base');

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.sheetHeader}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'base' ? styles.tabActive : ''}`}
              onClick={() => setTab('base')}
            >Base</button>
            <button
              className={`${styles.tab} ${tab === 'nautica' ? styles.tabActive : ''}`}
              onClick={() => setTab('nautica')}
            >Nautica</button>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Chiudi calcolatrice">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        {tab === 'base' ? <BasicCalc /> : <NauticalCalc />}
      </div>
    </div>
  );
}
