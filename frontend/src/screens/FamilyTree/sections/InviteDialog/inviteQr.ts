import QRCode from 'qrcode';

// Integer scale preserves crisp modules; four white modules surround every code.
export const qrOptions = { errorCorrectionLevel: 'M' as const, margin: 4, scale: 8,
  color: { dark: '#244b36ff', light: '#fffdf9ff' } };
export async function invitationQrPng(url: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, qrOptions);
  return new Promise((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('PNG generation failed')), 'image/png'));
}
export function downloadQr(blob: Blob, id: number) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roots-invitation-${id}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// A static invitation card can be sent through any app that accepts PNG images.
export async function invitationVisualPng(url: string, artwork: string): Promise<Blob> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; image.src = artwork; });
  const qr = document.createElement('canvas');
  await QRCode.toCanvas(qr, url, qrOptions);
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image generation unavailable');
  ctx.fillStyle = '#f6f1e7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#244b36'; ctx.textAlign = 'center'; ctx.font = '48px Georgia';
  ctx.fillText('Grow our family tree', 540, 90);
  const height = 650, width = height * image.width / image.height;
  ctx.drawImage(image, (1080 - width) / 2, 115, width, height);
  ctx.imageSmoothingEnabled = false;
  const qrSize = Math.floor(440 / qr.width) * qr.width || qr.width;
  ctx.drawImage(qr, (1080 - qrSize) / 2, 800, qrSize, qrSize);
  ctx.font = '28px sans-serif'; ctx.fillText('Scan to join us on Roots', 540, 1310);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG generation failed')), 'image/png'));
}
