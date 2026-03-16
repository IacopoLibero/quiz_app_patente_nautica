import React, { useState, useRef, useEffect } from 'react';
import { X as XIcon, Lock, Unlock, Compass } from 'lucide-react';
import styles from './MapLightbox.module.css';

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 6;
const HANDLE_R = 18; // SVG pixels for drag handles (image-coordinate space)

export default function MapLightbox({ src, alt, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 800, h: 600 });

  const [compassVisible, setCompassVisible] = useState(false);
  const [compassCenter, setCompassCenter] = useState({ x: 400, y: 300 });
  const [compassRadius, setCompassRadius] = useState(80);
  const [compassLocked, setCompassLocked] = useState(false);

  const svgRef = useRef(null);
  const imgRef = useRef(null);

  // Mutable refs to avoid stale closures in window event listeners
  const draggingRef = useRef(null); // 'pan' | 'compass-center' | 'compass-spread'
  const lastPosRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef(null);    // { startDist, startZoom }
  const zoomRef = useRef(zoom);
  const compassCenterRef = useRef(compassCenter);
  const compassLockedRef = useRef(compassLocked);
  const naturalSizeRef = useRef(naturalSize);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { compassCenterRef.current = compassCenter; }, [compassCenter]);
  useEffect(() => { compassLockedRef.current = compassLocked; }, [compassLocked]);
  useEffect(() => { naturalSizeRef.current = naturalSize; }, [naturalSize]);

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 600;
    setNaturalSize({ w, h });
    setCompassCenter({ x: w / 2, y: h / 2 });
    setCompassRadius(Math.min(w, h) * 0.12);
  }

  // Convert screen clientX/Y → SVG image-coordinate space
  // getBoundingClientRect() accounts for CSS transform (zoom+pan), so this is correct at any zoom level
  function clientToSvg(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const { w, h } = naturalSizeRef.current;
    return {
      x: ((clientX - rect.left) / rect.width) * w,
      y: ((clientY - rect.top) / rect.height) * h,
    };
  }

  // Global pointer listeners (so dragging outside elements still works)
  useEffect(() => {
    function getXY(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onMove(e) {
      // Pinch zoom
      if (e.touches && e.touches.length === 2 && pinchRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM,
          pinchRef.current.startZoom * (dist / pinchRef.current.startDist)));
        setZoom(nextZoom);
        e.preventDefault();
        return;
      }

      if (!draggingRef.current) return;

      const pos = getXY(e);
      const dx = pos.x - lastPosRef.current.x;
      const dy = pos.y - lastPosRef.current.y;

      if (draggingRef.current === 'pan') {
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (draggingRef.current === 'compass-center') {
        const svgPos = clientToSvg(pos.x, pos.y);
        setCompassCenter(svgPos);
      } else if (draggingRef.current === 'compass-spread' && !compassLockedRef.current) {
        const svgPos = clientToSvg(pos.x, pos.y);
        const r = Math.hypot(
          svgPos.x - compassCenterRef.current.x,
          svgPos.y - compassCenterRef.current.y
        );
        setCompassRadius(Math.max(10, r));
      }

      lastPosRef.current = pos;
      e.preventDefault();
    }

    function onUp() {
      draggingRef.current = null;
      pinchRef.current = null;
    }

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startPan(clientX, clientY) {
    draggingRef.current = 'pan';
    lastPosRef.current = { x: clientX, y: clientY };
  }

  function startCompassDrag(type, e) {
    e.stopPropagation();
    e.preventDefault();
    draggingRef.current = type;
    const pos = e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    lastPosRef.current = pos;
  }

  function handleViewportMouseDown(e) {
    if (e.button !== 0) return;
    startPan(e.clientX, e.clientY);
  }

  function handleViewportTouchStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { startDist: Math.hypot(dx, dy), startZoom: zoomRef.current };
      draggingRef.current = null;
    } else if (e.touches.length === 1) {
      startPan(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const { w: nW, h: nH } = naturalSize;
  const tipTop    = { x: compassCenter.x, y: compassCenter.y - compassRadius };
  const tipBottom = { x: compassCenter.x, y: compassCenter.y + compassRadius };

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Carta nautica">

      {/* Zoomable / pannable viewport */}
      <div
        className={styles.viewport}
        onMouseDown={handleViewportMouseDown}
        onTouchStart={handleViewportTouchStart}
        onWheel={handleWheel}
      >
        <div
          className={styles.transformLayer}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <div className={styles.imageWrapper}>
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              className={styles.mapImage}
              onLoad={handleImageLoad}
              draggable={false}
            />

            {/* Compass SVG overlay – lives inside the transform so it auto-scales */}
            {compassVisible && (
              <svg
                ref={svgRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  overflow: 'visible',
                  pointerEvents: 'none',
                }}
                viewBox={`0 0 ${nW} ${nH}`}
                preserveAspectRatio="none"
              >
                {/* Dashed measurement circle */}
                <circle
                  cx={compassCenter.x} cy={compassCenter.y} r={compassRadius}
                  fill="none" stroke="#1565C0" strokeWidth={2.5} strokeDasharray="12 7"
                  opacity={0.9} style={{ pointerEvents: 'none' }}
                />

                {/* Vertical axis */}
                <line
                  x1={compassCenter.x} y1={tipTop.y}
                  x2={compassCenter.x} y2={tipBottom.y}
                  stroke="#1565C0" strokeWidth={2} opacity={0.7}
                  style={{ pointerEvents: 'none' }}
                />

                {/* Horizontal axis (faint) */}
                <line
                  x1={compassCenter.x - compassRadius} y1={compassCenter.y}
                  x2={compassCenter.x + compassRadius} y2={compassCenter.y}
                  stroke="#1565C0" strokeWidth={1.2} strokeDasharray="6 6" opacity={0.35}
                  style={{ pointerEvents: 'none' }}
                />

                {/* Crosshair at each tip */}
                {[tipTop, tipBottom].map((tip, i) => (
                  <g key={i} style={{ pointerEvents: 'none' }}>
                    <line x1={tip.x - HANDLE_R * 0.8} y1={tip.y}
                          x2={tip.x + HANDLE_R * 0.8} y2={tip.y}
                          stroke="#1565C0" strokeWidth={3} />
                    <line x1={tip.x} y1={tip.y - HANDLE_R * 0.8}
                          x2={tip.x} y2={tip.y + HANDLE_R * 0.8}
                          stroke="#1565C0" strokeWidth={3} />
                  </g>
                ))}

                {/* Center dot */}
                <circle cx={compassCenter.x} cy={compassCenter.y} r={5}
                  fill="#1565C0" style={{ pointerEvents: 'none' }} />

                {/* ── Center drag handle (always active) ── */}
                <circle
                  cx={compassCenter.x} cy={compassCenter.y} r={HANDLE_R * 1.6}
                  fill="#1565C0" fillOpacity={0.15}
                  stroke="#1565C0" strokeWidth={2}
                  style={{ pointerEvents: 'all', cursor: 'move' }}
                  onMouseDown={(e) => startCompassDrag('compass-center', e)}
                  onTouchStart={(e) => startCompassDrag('compass-center', e)}
                />

                {/* ── Spread drag handle (bottom tip, only when unlocked) ── */}
                {!compassLocked && (
                  <circle
                    cx={tipBottom.x} cy={tipBottom.y} r={HANDLE_R * 1.8}
                    fill="#E65100" fillOpacity={0.2}
                    stroke="#E65100" strokeWidth={2.5}
                    style={{ pointerEvents: 'all', cursor: 'ns-resize' }}
                    onMouseDown={(e) => startCompassDrag('compass-spread', e)}
                    onTouchStart={(e) => startCompassDrag('compass-spread', e)}
                  />
                )}

                {/* Locked indicator ring on top tip */}
                {compassLocked && (
                  <circle
                    cx={tipTop.x} cy={tipTop.y} r={HANDLE_R}
                    fill="none" stroke="#1565C0" strokeWidth={2}
                    opacity={0.6} style={{ pointerEvents: 'none' }}
                  />
                )}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ── UI Controls (outside transform, always at screen position) ── */}

      <button className={styles.closeBtn} onClick={onClose} aria-label="Chiudi carta">
        <XIcon size={20} strokeWidth={2} />
      </button>

      <div className={styles.toolbar}>
        {/* Compass toggle */}
        <button
          className={`${styles.toolBtn} ${compassVisible ? styles.toolBtnActive : ''}`}
          onClick={() => setCompassVisible(v => !v)}
          title="Attiva compasso"
        >
          <Compass size={17} strokeWidth={1.75} />
          <span>Compasso</span>
        </button>

        {/* Lock/unlock spread */}
        {compassVisible && (
          <button
            className={`${styles.toolBtn} ${compassLocked ? styles.toolBtnLocked : ''}`}
            onClick={() => setCompassLocked(v => !v)}
            title={compassLocked ? 'Apertura bloccata – trascina il centro' : 'Trascina il punto arancione per regolare l\'apertura'}
          >
            {compassLocked
              ? <><Lock size={15} strokeWidth={2} /><span>Bloccato</span></>
              : <><Unlock size={15} strokeWidth={2} /><span>Libero</span></>
            }
          </button>
        )}

        {/* Zoom indicator / reset */}
        {zoom !== 1 && (
          <button className={styles.toolBtn} onClick={resetView} title="Ripristina zoom">
            <span>{Math.round(zoom * 100)}%</span>
          </button>
        )}
      </div>

      {/* Hint when compass is visible and unlocked */}
      {compassVisible && !compassLocked && (
        <div className={styles.hint}>
          Trascina <span className={styles.hintDot} style={{ background: '#1565C0' }} /> centro
          &nbsp;·&nbsp;
          Trascina <span className={styles.hintDot} style={{ background: '#E65100' }} /> apertura
        </div>
      )}
      {compassVisible && compassLocked && (
        <div className={styles.hint}>
          Apertura bloccata — trascina il centro per misurare
        </div>
      )}
    </div>
  );
}
