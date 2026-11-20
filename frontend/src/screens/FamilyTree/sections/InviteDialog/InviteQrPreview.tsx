import { useEffect, useRef, useState } from 'react';
import { secondaryButtonClass } from '../../../../components/Dialog/Dialog';
import { invitationQrPng } from './inviteQr';

// Shows the selected invitation's QR. The animated WebGPU tree lives in a
// sandboxed same-origin frame; reduced motion, missing WebGPU or a renderer
// failure fall back to a flat PNG. Changing `url` re-targets the same frame
// (no reload), and results for a previous URL are ignored.
export function InviteQrPreview({ url, onArtwork }: { url?: string; onArtwork?: (url: string, image: string) => void }) {
  const artworkCallback = useRef(onArtwork);
  artworkCallback.current = onArtwork;
  const currentContent = useRef(url);
  currentContent.current = url;
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(0);
  const [flat, setFlat] = useState(false);

  const [fallback, setFallback] = useState(false);
  const [image, setImage] = useState<{ url: string; src: string } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setFallback(current => current || !('gpu' in navigator) || !!motion?.matches);
    update();
    motion?.addEventListener?.('change', update);
    return () => motion?.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    setFlat(false); setImage(null); setError(false);
    if (!url) return;
    let active = true;
    let objectUrl = '';
    invitationQrPng(url).then(blob => {
      if (active) { objectUrl = URL.createObjectURL(blob); setImage({ url, src: objectUrl }); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow ||
          !event.data || typeof event.data.type !== 'string') return;
      if (event.data.type === 'roots-qr-ready') setReady(value => value + 1);
      if (event.data.type === 'roots-qr-rendered') clearTimeout(timeout);
      if (event.data.type === 'roots-qr-error') setFallback(true);
      if (event.data.type === 'roots-qr-artwork' && currentContent.current && event.data.url === currentContent.current &&
          typeof event.data.image === 'string' && event.data.image.startsWith('data:image/png;base64,') &&
          event.data.image.length < 8000000) artworkCallback.current?.(event.data.url, event.data.image);
      if (event.data.type === 'roots-qr-toggle') { setFlat(value => !value); }
    };
    const timeout = setTimeout(() => setFallback(true), 12000);
    addEventListener('message', receive);
    return () => { clearTimeout(timeout); removeEventListener('message', receive); };
  }, []);
  useEffect(() => {
    if (ready && url) frame.current?.contentWindow?.postMessage({ type: 'roots-qr-config', url, flat }, location.origin);
  }, [ready, url, flat]);

  if (!url) {
    return <section aria-label="Invitation QR preview"
      className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[#dedcd2] bg-[#f6f1e7] p-5 text-center [font-family:'Inter',Helvetica] text-[13px] text-[#7b8177]">
      Select an invitation to view its QR code.
    </section>;
  }
  // Never show a PNG rendered for a previously selected URL.
  const flatSrc = image?.url === url ? image.src : '';
  return <section aria-label="Invitation QR preview" className="rounded-xl border border-[#dedcd2] bg-[#f6f1e7] p-3">
    <div className="relative mx-auto aspect-[3/2] max-h-[240px] w-full max-w-[360px] overflow-hidden">
      {!fallback && <iframe ref={frame} src="/invite-qr.html" title="Animated invitation tree" tabIndex={-1}
        sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" className="h-full w-full border-0" />}
      {fallback && flatSrc && <img src={flatSrc} alt="Invitation QR code"
        className="absolute inset-0 m-auto h-full max-w-full object-contain [image-rendering:pixelated]" />}
      {fallback && !flatSrc && !error && <p className="absolute inset-0 flex items-center justify-center text-[13px] text-[#7b8177]">Preparing QR code…</p>}
      {error && <p role="alert" className="absolute inset-0 flex items-center justify-center p-4 text-center text-[13px] text-[#8a3f2c]">QR preview unavailable. You can still copy the invitation link.</p>}
    </div>
    {!fallback && <div className="mt-2 flex justify-center">
      <button type="button" className={secondaryButtonClass} onClick={() => { setFlat(value => !value); }}>{flat ? 'Back to tree' : 'Show QR code'}</button>
    </div>}
    <p className="mt-2 text-center [font-family:'Inter',Helvetica] text-xs text-[#7b8177]">
      {fallback ? 'Flat preview · animation unavailable or reduced motion is on.' : 'Tap the tree or use the button to see the QR code.'} A saved QR grants the same access as this link.
    </p>
  </section>;
}
