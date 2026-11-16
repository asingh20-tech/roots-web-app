// @vitest-environment node
import { expect, it } from 'vitest';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
// @ts-expect-error pngjs is used only by this decoder test.
import { PNG } from 'pngjs';
import { qrOptions } from './inviteQr';
it('exports two independently scannable PNGs preserving complete tokens and query strings', async () => {
  for (const url of ['https://roots.example/invite/A_-123?x=%2F&next=a+b', 'https://roots.example/invite/B_456?source=qr&name=Ren%C3%A9']) {
    const png = PNG.sync.read(await QRCode.toBuffer(url, qrOptions));
    expect(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data).toBe(url);
    const quietZone = 4 * qrOptions.scale;
    for (let y = 0; y < quietZone; y++) {
      for (let x = 0; x < png.width; x++) expect(png.data[(y * png.width + x) * 4]).toBe(255);
    }
  }
});
