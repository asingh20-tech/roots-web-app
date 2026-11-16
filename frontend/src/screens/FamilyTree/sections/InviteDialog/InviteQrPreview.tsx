import { useEffect, useRef, useState } from 'react';
import { secondaryButtonClass } from '../../../../components/Dialog/Dialog';
import { invitationQrPng } from './inviteQr';

export function InviteQrPreview({ url, onArtwork }: { url?: string; onArtwork?: (url: string, image: string) => void }) {
  const artworkCallback = useRef(onArtwork);
  artworkCallback.current = onArtwork;
  const currentContent = useRef(url ?? "https://example.com/");
  currentContent.current = url ?? "https://example.com/";
  const content = url ?? 'https://example.com/';
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(0);
  const [flat, setFlat] = useState(false);

  const [fallback, setFallback] = useState(false);
  const [image, setImage] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setFallback(!('gpu' in navigator) || !!motion?.matches);
    update();
    motion?.addEventListener('change', update);
    return () => motion?.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setFlat(false); setImage(''); setError(false);
    invitationQrPng(content).then(blob => {
      if (active) { objectUrl = URL.createObjectURL(blob); setImage(objectUrl); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [content]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow ||
          !event.data || typeof event.data.type !== 'string') return;
      if (event.data.type === 'roots-qr-ready') setReady(value => value + 1);
      if (event.data.type === 'roots-qr-rendered') clearTimeout(timeout);
      if (event.data.type === 'roots-qr-error') setFallback(true);
      if (event.data.type === 'roots-qr-artwork' && event.data.url === currentContent.current &&
          typeof event.data.image === 'string' && event.data.image.startsWith('data:image/png;base64,') &&
          event.data.image.length < 8000000) artworkCallback.current?.(event.data.url, event.data.image);
      if (event.data.type === 'roots-qr-toggle') { setFlat(value => !value); }
    };
    const timeout = setTimeout(() => setFallback(true), 12000);
    addEventListener('message', receive);
    return () => { clearTimeout(timeout); removeEventListener('message', receive); };
  }, []);
  useEffect(() => {
    if (ready) frame.current?.contentWindow?.postMessage({ type: 'roots-qr-config', url: content, flat }, location.origin);
  }, [ready, content, flat]);
  return <section aria-label="Invitation QR preview" className="rounded-xl border border-[#dedcd2] bg-[#f6f1e7] p-3">
    <p className="text-center text-sm font-semibold text-[#355b43]">{url ? 'Invitation QR code' : 'Demo preview'}</p>
    <div className="relative mx-auto h-[240px] w-full max-w-[360px] overflow-hidden">
      {!fallback && <iframe ref={frame} src="/invite-qr.html" title="Animated invitation tree" tabIndex={-1}
        sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" className="h-full w-full border-0" />}
      {fallback && image && <button type="button" aria-label={fallback ? 'Flat QR code' : 'Back to tree'}
        onClick={() => { if (!fallback) { setFlat(false); } }} className="absolute inset-0 flex items-center justify-center bg-[#f6f1e7]">
        <img src={image} alt={url ? 'Invitation QR code' : 'Demo QR code for example.com'} className="h-[232px] max-w-full object-contain" />
      </button>}
      {error && <p role="alert">QR preview unavailable. You can still copy the invitation link.</p>}
    </div>
    <div className="flex justify-center">{!fallback && <button type="button" className={secondaryButtonClass} onClick={() => { setFlat(value => !value); }}>{flat ? 'Back to tree' : 'Show QR code'}</button>}</div>
    <p className="mt-2 text-center text-xs text-[#7b8177]">{fallback ? 'Flat preview · animation unavailable or reduced motion enabled.' : 'Tap the tree to view its QR code.'} {url ? 'A saved QR grants the same access as this link.' : 'Example only. Create a link to share an invitation.'}</p>
  </section>;
}
