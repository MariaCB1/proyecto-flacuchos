import { useState, useEffect, useRef, useCallback } from 'react';

const USERS = [
  { username: 'MariaCB1', name: 'Maria Carvajal Blanco' },
  { username: 'Fhercha24', name: 'Francisco Herrera Chacón' },
];

function CookieConsent({ active }) {
  const groupRef = useRef(null);
  const posRef = useRef({ x: 100, y: 50 });
  const dirRef = useRef({ dx: 1.0, dy: 0.7 });
  const [pos, setPos] = useState({ x: 100, y: 50 });

  useEffect(() => {
    if (!active) return;

    const el = groupRef.current;
    if (!el) return;

    let rafId;
    let firstFrame = true;
    const animate = () => {
      if (firstFrame) {
        firstFrame = false;
        const startX = Math.random() * Math.max(window.innerWidth - 320, 50);
        const startY = Math.random() * Math.max(window.innerHeight - 200, 50);
        posRef.current = { x: startX, y: startY };
        setPos({ x: startX, y: startY });
      }
      const ew = el.offsetWidth || 280;
      const eh = el.offsetHeight || 180;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const p = posRef.current;
      p.x += dirRef.current.dx;
      p.y += dirRef.current.dy;

      if (p.x <= 0) { p.x = 0; dirRef.current.dx = Math.abs(dirRef.current.dx); }
      if (p.x + ew >= vw) { p.x = vw - ew; dirRef.current.dx = -Math.abs(dirRef.current.dx); }
      if (p.y <= 0) { p.y = 0; dirRef.current.dy = Math.abs(dirRef.current.dy); }
      if (p.y + eh >= vh) { p.y = vh - eh; dirRef.current.dy = -Math.abs(dirRef.current.dy); }

      setPos({ x: p.x, y: p.y });
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  const openProfile = useCallback((username) => (e) => {
    e.stopPropagation();
    window.open(`https://github.com/${username}`, '_blank');
  }, []);

  if (!active) return null;

  return (
    <div className="consent-overlay">
      <div
        ref={groupRef}
        className="consent-group"
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="consent-rings">
          <div className="consent-ring consent-ring-first" onClick={openProfile(USERS[0].username)}>
            <img src={`https://github.com/${USERS[0].username}.png`} alt="" />
          </div>
          <div className="consent-ring consent-ring-second" onClick={openProfile(USERS[1].username)}>
            <img src={`https://github.com/${USERS[1].username}.png`} alt="" />
          </div>
        </div>
        <p className="consent-names">{USERS[0].name} & {USERS[1].name}</p>
      </div>
    </div>
  );
}

export default CookieConsent;
