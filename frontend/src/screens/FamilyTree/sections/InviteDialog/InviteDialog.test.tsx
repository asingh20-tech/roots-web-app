// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { InviteDialog } from './InviteDialog';
import { createInvitation, listInvitations, revokeInvitation } from '../../../../services/trees';
import { invitationQrPng, downloadQr } from './inviteQr';
vi.mock('../../../../services/trees', () => ({ createInvitation: vi.fn(), listInvitations: vi.fn(), revokeInvitation: vi.fn() }));
vi.mock('./inviteQr', () => ({ invitationQrPng: vi.fn(async (url: string) => new Blob([url], { type: 'image/png' })), downloadQr: vi.fn() }));
const link = (id: number) => ({ id, url: `https://roots.example/invite/token-${id}?source=qr&x=%2F`, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000).toISOString(), is_active: true, is_valid: true, revoked_at: null });
const show = () => render(<InviteDialog treeId={1} treeName="Test tree" onClose={() => {}} />);
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createInvitation).mockReset();
  vi.mocked(listInvitations).mockResolvedValue([]);
  vi.mocked(createInvitation).mockResolvedValueOnce(link(1)).mockResolvedValueOnce(link(2));
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:test') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write: vi.fn().mockResolvedValue(undefined) } });
  vi.stubGlobal('ClipboardItem', class { data: unknown; constructor(data: unknown) { this.data = data; } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('starts with an unshareable demo and keeps each row tied to its own full URL', async () => {
  show();
  expect(screen.getByText('Select an invitation to view its QR code.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  fireEvent.click(screen.getByRole('button', { name: 'Create another link' }));
  await screen.findByDisplayValue(link(2).url);
  const rows = within(screen.getByRole('list', { name: 'Invitation links' })).getAllByRole('listitem');
  for (const [index, id] of [2, 1].entries()) {
    fireEvent.click(within(rows[index]).getByRole('button', { name: 'Copy QR code' }));
    await waitFor(() => expect(navigator.clipboard.write).toHaveBeenCalledTimes(index + 1));
    const item = vi.mocked(navigator.clipboard.write).mock.calls[index][0][0] as unknown as { data: Record<string, Promise<Blob>> };
    const blob = await item.data['image/png'];
    const contents = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(blob); });
    expect(contents).toBe(link(id).url);
    expect(invitationQrPng).toHaveBeenCalledWith(link(id).url);
    fireEvent.click(within(rows[index]).getByRole('button', { name: 'Download QR' }));
    await waitFor(() => expect(downloadQr).toHaveBeenCalledWith(expect.any(Blob), id));
  }
});
it('waits for clipboard completion and offers download on failure', async () => {
  show(); fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  let reject!: (error: Error) => void;
  vi.mocked(navigator.clipboard.write).mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Copy QR code' })[0]);
  expect(screen.queryByText('QR code copied.')).not.toBeInTheDocument();
  reject(new Error('denied'));
  expect(await screen.findByText(/Image copying is unavailable/)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Download QR' }).length).toBeGreaterThan(0);
});
it('does not recover old raw URLs or silently create a replacement on reopening', async () => {
  vi.mocked(listInvitations).mockResolvedValue([{ ...link(1), url: undefined }]);
  show();
  expect(await screen.findByText(/original URL is no longer available/)).toBeInTheDocument();
  expect(createInvitation).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Copy QR code' })).not.toBeInTheDocument();
});
it('clears a revoked invitation and returns to the demo', async () => {
  vi.mocked(revokeInvitation).mockResolvedValue(undefined);
  show(); fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  fireEvent.click(screen.getByRole('button', { name: /Revoke the link/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Revoke link' }));
  await screen.findByText('Select an invitation to view its QR code.');
  expect(screen.queryByRole('button', { name: 'Copy QR code' })).not.toBeInTheDocument();
});
it('removes raw URL actions when the invitation expires while open', async () => {
  vi.mocked(createInvitation).mockReset().mockResolvedValue({ ...link(1), expires_at: new Date(Date.now() + 500).toISOString() });
  show(); fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  await waitFor(
  () => expect(screen.getByText('Select an invitation to view its QR code.')).toBeInTheDocument(),
  { timeout: 2000 }
);
  expect(screen.queryByRole('button', { name: 'Copy QR code' })).not.toBeInTheDocument();
});
