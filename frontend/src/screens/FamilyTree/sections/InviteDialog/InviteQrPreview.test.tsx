// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { InviteQrPreview } from './InviteQrPreview';
import { invitationQrPng } from './inviteQr';
vi.mock('./inviteQr', () => ({ invitationQrPng: vi.fn(async () => new Blob(['png'])) }));
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, 'gpu', { configurable: true, value: {} });
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:qr') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function message(frame: HTMLIFrameElement, type: string, origin = location.origin) {
  act(() => window.dispatchEvent(new MessageEvent('message', { source: frame.contentWindow, origin, data: { type } })));
}
it('uses a static frame URL and validates ready/toggle messages', async () => {
  render(<InviteQrPreview url="https://roots.example/invite/secret?x=%2F" />);
  const frame = screen.getByTitle('Animated invitation tree') as HTMLIFrameElement;
  expect(frame.getAttribute('src')).toBe('/invite-qr.html');
  const send = vi.spyOn(frame.contentWindow!, 'postMessage');
  message(frame, 'roots-qr-ready', 'https://foreign.example');
  expect(send).not.toHaveBeenCalled();
  message(frame, 'roots-qr-ready');
  expect(send).toHaveBeenCalledWith({ type: 'roots-qr-config', url: 'https://roots.example/invite/secret?x=%2F', flat: false }, location.origin);
  fireEvent.click(screen.getByRole('button', { name: 'Show QR code' }));
  message(frame, 'roots-qr-flat');
  expect(screen.queryByAltText('Invitation QR code')).not.toBeInTheDocument();
  expect(screen.getByTitle('Animated invitation tree')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Back to tree' })[0]);
  expect(screen.getByRole('button', { name: 'Show QR code' })).toBeInTheDocument();
});
it('falls back locally on renderer failure', async () => {
  render(<InviteQrPreview url="https://roots.example/invite/A" />);
  message(screen.getByTitle('Animated invitation tree') as HTMLIFrameElement, 'roots-qr-error');
  await screen.findByAltText('Invitation QR code');
  expect(screen.queryByTitle('Animated invitation tree')).not.toBeInTheDocument();
});
it('does not mount the animated renderer for reduced motion', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(<InviteQrPreview url="https://roots.example/invite/A"/>);
  await screen.findByAltText('Invitation QR code');
  expect(screen.queryByTitle('Animated invitation tree')).not.toBeInTheDocument();
});
it('discards pending image generation when closed during initialization', async () => {
  let finish!: (blob: Blob) => void;
  vi.mocked(invitationQrPng).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const view = render(<InviteQrPreview url="https://roots.example/invite/A"/>);
  view.unmount();
  await act(async () => finish(new Blob(['png'])));
  await waitFor(() => expect(URL.createObjectURL).not.toHaveBeenCalled());
});
it('accepts artwork only for the current invitation from the local renderer', () => {
  const onArtwork = vi.fn();
  render(<InviteQrPreview url="https://roots.example/invite/A" onArtwork={onArtwork} />);
  const frame = screen.getByTitle('Animated invitation tree') as HTMLIFrameElement;
  const dispatch = (url: string, image: string) => act(() => window.dispatchEvent(new MessageEvent('message', {
    source: frame.contentWindow, origin: location.origin,
    data: { type: 'roots-qr-artwork', url, image },
  })));
  dispatch('https://roots.example/invite/B', 'data:image/png;base64,test');
  dispatch('https://roots.example/invite/A', 'https://foreign.example/image.png');
  expect(onArtwork).not.toHaveBeenCalled();
  dispatch('https://roots.example/invite/A', 'data:image/png;base64,test');
  expect(onArtwork).toHaveBeenCalledWith('https://roots.example/invite/A', 'data:image/png;base64,test');
});
