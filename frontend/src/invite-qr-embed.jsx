import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useMagicTree } from './vendor/magic-tree/renderer';

const send = (type) => parent.postMessage({ type }, location.origin);
function Scene({ url, flat }) {
  const canvas = useRef(null);
  const isFlat = useRef(flat);
  isFlat.current = flat;
  const settled = useRef(value => { if (value) send("roots-qr-flat"); });
  const snapshot = useRef('');
  const snapshotUpdated = useRef(image => {
    if (image) parent.postMessage({ type: 'roots-qr-artwork', url, image }, location.origin);
  });
  const season = useRef(1);
  const color = useRef([0, 0, 0, 0]);
  const seed = useRef(url);
  const [size, setSize] = useState({ width: innerWidth, height: innerHeight });
  useEffect(() => {
    const resize = () => setSize({ width: innerWidth, height: innerHeight });
    addEventListener('resize', resize);
    return () => removeEventListener('resize', resize);
  }, []);
  useMagicTree({ canvasRef: canvas, canvasWidth: size.width, canvasHeight: size.height,
    qrContent: url, isFlat, seasonRef: season, customColorRef: color, treeSeed: seed,
    onFlatSettled: settled, qrSnapshotRef: snapshot, onQrSnapshotUpdated: snapshotUpdated,
    onReady: () => send('roots-qr-rendered'), onError: () => send('roots-qr-error') });
  return <canvas ref={canvas} onClick={() => send('roots-qr-toggle')} style={{ width: '100%', height: '100%', cursor: 'pointer' }} />;
}
function Embed() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    const receive = (event) => {
      if (event.source !== parent || event.origin !== location.origin) return;
      const data = event.data;
      if (!data || data.type !== 'roots-qr-config' || typeof data.url !== 'string' ||
          data.url.length > 4096 || typeof data.flat !== 'boolean') return;
      try { if (!['https:', 'http:'].includes(new URL(data.url).protocol)) return; } catch { return; }
      setConfig({ url: data.url, flat: data.flat });
    };
    addEventListener('message', receive);
    send('roots-qr-ready');
    return () => removeEventListener('message', receive);
  }, []);
  return config && <Scene key={config.url} {...config} />;
}
createRoot(document.getElementById('root')).render(<Embed />);
