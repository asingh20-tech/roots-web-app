// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { InviteDialog } from './InviteDialog';
import { createInvitation, getInvitationLink, listInvitations, revokeInvitation } from '../../../../services/trees';
import { invitationQrPng, invitationVisualPng, downloadQr } from './inviteQr';
vi.mock('../../../../services/trees', () => ({ createInvitation: vi.fn(), getInvitationLink: vi.fn(), listInvitations: vi.fn(), revokeInvitation: vi.fn() }));
vi.mock('./inviteQr', () => ({ invitationQrPng: vi.fn(async (url: string) => new Blob([url], { type: 'image/png' })), invitationVisualPng: vi.fn(async (url: string) => new Blob([url], { type: 'image/png' })), downloadQr: vi.fn() }));
const link = (id: number) => ({ id, url: `https://roots.example/invite/token-${id}?source=qr&x=%2F`, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000).toISOString(), is_active: true, is_valid: true, revoked_at: null });
const show = () => render(<InviteDialog treeId={1} treeName="Test tree" onClose={() => {}} />);
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createInvitation).mockReset();
  vi.mocked(listInvitations).mockResolvedValue([]);
  vi.mocked(createInvitation).mockResolvedValueOnce(link(1)).mockResolvedValueOnce(link(2));
  vi.mocked(getInvitationLink).mockImplementation(async (_treeId, id) => ({ id, url: link(id).url }));
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:test') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write: vi.fn().mockResolvedValue(undefined) } });
  vi.stubGlobal('ClipboardItem', class { data: unknown; constructor(data: unknown) { this.data = data; } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('starts without a shareable QR and keeps each invitation tied to its own URL', async () => {
  show();
  expect(screen.getByText('Select an invitation to view its QR code.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copy QR' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(2).url);
  for (const [index, id] of [2, 1].entries()) {
    const rows = within(screen.getByRole('list', { name: 'Active invitations' })).getAllByRole('listitem');
    fireEvent.click(within(rows[index]).getByRole('button', { name: /View QR for the link/ }));
    await screen.findByDisplayValue(link(id).url);
    fireEvent.click(screen.getByRole('button', { name: 'Copy QR' }));
    await waitFor(() => expect(navigator.clipboard.write).toHaveBeenCalledTimes(index + 1));
    const item = vi.mocked(navigator.clipboard.write).mock.calls[index][0][0] as unknown as { data: Record<string, Promise<Blob>> };
    const blob = await item.data['image/png'];
    const contents = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(blob); });
    expect(contents).toBe(link(id).url);
    expect(vi.mocked(invitationQrPng).mock.calls.some(call => call[0] === link(id).url) || vi.mocked(invitationVisualPng).mock.calls.some(call => call[0] === link(id).url)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Download QR' }));
    await waitFor(() => expect(downloadQr).toHaveBeenCalledWith(expect.any(Blob), id));
  }
});
it('waits for clipboard completion and offers download on failure', async () => {
  show(); fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  let reject!: (error: Error) => void;
  vi.mocked(navigator.clipboard.write).mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
  fireEvent.click(screen.getByRole('button', { name: 'Copy QR' }));
  expect(screen.queryByText('QR code copied.')).not.toBeInTheDocument();
  reject(new Error('denied'));
  expect(await screen.findByText(/Image copying is unavailable/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download QR' })).toBeInTheDocument();
});
it('does not recover old raw URLs or silently create a replacement on reopening', async () => {
  vi.mocked(listInvitations).mockResolvedValue([{ ...link(1), url: undefined }]);
  show();
  expect(await screen.findByText(/Original link unavailable/)).toBeInTheDocument();
  expect(createInvitation).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Copy QR' })).not.toBeInTheDocument();
});
it('revokes an invitation and removes its sharing actions', async () => {
  vi.mocked(revokeInvitation).mockResolvedValue(undefined);
  show(); fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  fireEvent.click(screen.getAllByRole('button', { name: /Revoke the link/ })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Revoke link' }));
  expect(await screen.findByText(/This invitation was revoked on/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copy QR' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Download QR' })).not.toBeInTheDocument();
});
it('removes raw URL actions when the invitation expires while open', async () => {
  vi.mocked(createInvitation).mockReset().mockResolvedValue({ ...link(1), expires_at: new Date(Date.now() + 500).toISOString() });
  show(); fireEvent.click(screen.getByRole('button', { name: 'Create invitation link' }));
  await screen.findByDisplayValue(link(1).url);
  expect(await screen.findByText(/This invitation expired on/, {}, { timeout: 3000 })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copy QR' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Download QR' })).not.toBeInTheDocument();
});
