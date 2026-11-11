// Family tree API (backend: trees/views.py, trees/serializers.py).
import { apiRequest } from "./api";

export { ApiError } from "./api";

export type FamilyTree = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  // true = Tree Owner; false = Collaborator (the list only returns trees the
  // user owns or has joined).
  is_owner: boolean;
  // Saved members only; pending suggestions are not counted.
  member_count: number;
};

export type Gender = "FEMALE" | "MALE" | "OTHER" | "UNKNOWN";

export type FamilyMember = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
  photo_url: string | null;
  version: number;
  updated_at: string;
  // FR-25 (proposed): the Collaborator whose approved suggestion created this
  // member; null when the Tree Owner added it directly. Read-only.
  contributed_by?: number | null;
  contributed_by_name?: string | null;
};

export type MemberDocument = {
  id: number;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
};

export type FamilyMemberDetail = FamilyMember & { documents: MemberDocument[] };

// CHILD is accepted on input only; the backend stores it as a reversed PARENT.
export type StoredRelationshipType =
  | "PARENT"
  | "ADOPTIVE_PARENT"
  | "SPOUSE"
  | "SIBLING";
export type RelationshipType = StoredRelationshipType | "CHILD";

// PARENT / ADOPTIVE_PARENT: member1 is the parent of member2.
export type Relationship = {
  id: number;
  member1: number;
  member2: number;
  relationship_type: StoredRelationshipType;
  start_date: string | null;
  created_at: string;
};

export type CreateTreeInput = {
  name: string;
  description?: string;
};

export type UpdateTreeInput = {
  name?: string;
  description?: string;
};

export const listTrees = (signal?: AbortSignal): Promise<FamilyTree[]> =>
  apiRequest<FamilyTree[]>("/api/trees/", { signal });

// 404 when the tree doesn't exist or the user can't access it.
export const getTree = (
  treeId: number,
  signal?: AbortSignal,
): Promise<FamilyTree> => apiRequest<FamilyTree>(`/api/trees/${treeId}/`, { signal });

export const createTree = ({
  name,
  description,
}: CreateTreeInput): Promise<FamilyTree> =>
  apiRequest<FamilyTree>("/api/trees/", {
    method: "POST",
    body: description ? { name, description } : { name },
  });

// FR-23 (proposed). Owner only: PATCH /api/trees/:id/ (IsTreeOwnerOrReadOnly
// answers 403 to Collaborators, 404 to everyone else).
export const updateTree = (
  treeId: number,
  input: UpdateTreeInput,
): Promise<FamilyTree> =>
  apiRequest<FamilyTree>(`/api/trees/${treeId}/`, { method: "PATCH", body: input });

// Owner only. Django cascades to members, relationships, suggestions,
// documents, invitations and collaborators, and deletes the stored files.
export const deleteTree = (treeId: number): Promise<void> =>
  apiRequest<void>(`/api/trees/${treeId}/`, { method: "DELETE" });

export const listMembers = (
  treeId: number,
  signal?: AbortSignal,
): Promise<FamilyMember[]> =>
  apiRequest<FamilyMember[]>(`/api/trees/${treeId}/members/`, { signal });

export const getMember = (
  treeId: number,
  memberId: number,
  signal?: AbortSignal,
): Promise<FamilyMemberDetail> =>
  apiRequest<FamilyMemberDetail>(
    `/api/trees/${treeId}/members/${memberId}/`,
    { signal },
  );

// ----- Owner-only writes (IsTreeOwnerOrReadOnly; Collaborators get 403) -----

export type MemberInput = {
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
};

export const createMember = (
  treeId: number,
  input: MemberInput,
): Promise<FamilyMember> =>
  apiRequest<FamilyMember>(`/api/trees/${treeId}/members/`, {
    method: "POST",
    body: input,
  });

export const updateMember = (
  treeId: number,
  memberId: number,
  input: MemberInput,
): Promise<FamilyMember> =>
  apiRequest<FamilyMember>(`/api/trees/${treeId}/members/${memberId}/`, {
    method: "PATCH",
    body: input,
  });

// Also deletes the member's relationships, documents and photo (CASCADE).
export const deleteMember = (treeId: number, memberId: number): Promise<void> =>
  apiRequest<void>(`/api/trees/${treeId}/members/${memberId}/`, {
    method: "DELETE",
  });

export type RelationshipInput = {
  member1: number;
  member2: number;
  relationship_type: RelationshipType;
  start_date?: string;
};

// CHILD is stored as the reversed PARENT; SPOUSE/SIBLING pairs are stored
// lowest id first. Django rejects self-links, cycles and duplicates (400).
export const createRelationship = (
  treeId: number,
  input: RelationshipInput,
): Promise<Relationship> =>
  apiRequest<Relationship>(`/api/trees/${treeId}/relationships/`, {
    method: "POST",
    body: input,
  });

export const deleteRelationship = (
  treeId: number,
  relationshipId: number,
): Promise<void> =>
  apiRequest<void>(`/api/trees/${treeId}/relationships/${relationshipId}/`, {
    method: "DELETE",
  });

export const listRelationships = (
  treeId: number,
  signal?: AbortSignal,
): Promise<Relationship[]> =>
  apiRequest<Relationship[]>(`/api/trees/${treeId}/relationships/`, { signal });

// ----- Change requests (SuggestRequest; Collaborators only, FR-12) -----

export type AddMemberProposal = {
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date?: string;
  death_date?: string;
};

export type AddRelationshipProposal = {
  member1: number;
  member2: number;
  relationship_type: RelationshipType;
  start_date?: string;
};

// Only the fields that change; based_on_version is the member version the
// form was filled from, so Django can refuse a stale edit (FR-21).
export type UpdateMemberProposal = Partial<{
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
}>;

export type ChangeRequestInput =
  | {
      change_type: "ADD_MEMBER";
      description: string;
      proposed_data: AddMemberProposal;
    }
  | {
      change_type: "ADD_RELATIONSHIP";
      description: string;
      proposed_data: AddRelationshipProposal;
    }
  | {
      change_type: "UPDATE_MEMBER";
      description: string;
      target_member: number;
      based_on_version: number;
      proposed_data: UpdateMemberProposal;
    };

export type ChangeType =
  | "ADD_MEMBER"
  | "UPDATE_MEMBER"
  | "ADD_MEDIA"
  | "ADD_RELATIONSHIP";
export type ChangeStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "OUTDATED"
  | "WITHDRAWN";

// SuggestionSerializer output.
export type ChangeRequest = {
  id: number;
  change_type: ChangeType;
  description: string;
  target_member: number | null;
  target_member_name: string | null;
  proposed_data: Record<string, unknown> | null;
  file_url: string | null;
  file_name?: string | null;
  status: ChangeStatus;
  is_outdated: boolean;
  // UPDATE_MEMBER: value when submitted / saved value now / proposed value.
  comparison: Record<
    string,
    { original?: unknown; current: unknown; proposed: unknown }
  > | null;
  original_data?: Record<string, unknown> | null;
  based_on_version?: number | null;
  submitted_by?: number;
  submitted_by_name: string;
  is_mine?: boolean;
  reviewed_by_name?: string | null;
  created_at: string;
  reviewed_at: string | null;
  edited_at?: string | null;
  withdrawn_at?: string | null;
};

export type Page<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const submitChangeRequest = (
  treeId: number,
  input: ChangeRequestInput,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(`/api/trees/${treeId}/suggestions/`, {
    method: "POST",
    body: input,
  });

// ADD_MEDIA (FR-12, FR-18): multipart, so the file goes as-is. Django checks
// the extension, the file's first bytes and the 10 MB limit.
export const submitDocumentSuggestion = (
  treeId: number,
  input: { target_member: number; description: string; file: File },
): Promise<ChangeRequest> => {
  const form = new FormData();
  form.append("change_type", "ADD_MEDIA");
  form.append("target_member", String(input.target_member));
  form.append("description", input.description);
  form.append("proposed_file", input.file);
  return apiRequest<ChangeRequest>(`/api/trees/${treeId}/suggestions/`, {
    method: "POST",
    body: form,
  });
};

// FR-24 (proposed): the signed-in Collaborator's own suggestions, newest
// first, 20 a page. status: PENDING | APPROVED | REJECTED | OUTDATED |
// WITHDRAWN | ALL.
export const listMySuggestions = (
  treeId: number,
  { status, page = 1 }: { status: ChangeStatus | "ALL"; page?: number },
  signal?: AbortSignal,
): Promise<Page<ChangeRequest>> =>
  apiRequest<Page<ChangeRequest>>(
    `/api/trees/${treeId}/suggestions/?status=${status}&page=${page}`,
    { signal },
  );

export type SuggestionEdit = {
  description?: string;
  proposed_data?: Record<string, unknown>;
  based_on_version?: number;
};

// FR-24: the author edits a PENDING suggestion. 409 (code "locked") once the
// Owner has reviewed it or it went outdated; 404 for anyone else's.
export const updateSuggestion = (
  treeId: number,
  suggestionId: number,
  edit: SuggestionEdit | FormData,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(`/api/trees/${treeId}/suggestions/${suggestionId}/`, {
    method: "PATCH",
    body: edit,
  });

// FR-24: kept on the server as WITHDRAWN (auditable), never deleted.
export const withdrawSuggestion = (
  treeId: number,
  suggestionId: number,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(
    `/api/trees/${treeId}/suggestions/${suggestionId}/withdraw/`,
    { method: "POST" },
  );

// Owner: PENDING + OUTDATED requests. Collaborator: only their own.
export const listOpenChangeRequests = (
  treeId: number,
  signal?: AbortSignal,
): Promise<ChangeRequest[]> =>
  apiRequest<ChangeRequest[]>(`/api/trees/${treeId}/suggestions/`, { signal });

// Owner only. Applied in one transaction by trees/services.py. A 409 with
// code "outdated" means the member changed since the request was made; pass
// confirmOutdated after the Owner has seen the comparison.
export const approveChangeRequest = (
  treeId: number,
  requestId: number,
  confirmOutdated = false,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(
    `/api/trees/${treeId}/suggestions/${requestId}/approve/`,
    {
      method: "POST",
      body: confirmOutdated ? { confirm_outdated: true } : {},
    },
  );

export const rejectChangeRequest = (
  treeId: number,
  requestId: number,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(
    `/api/trees/${treeId}/suggestions/${requestId}/reject/`,
    { method: "POST", body: {} },
  );

// ----- Invitations (Owner creates; anyone signed in can accept) -----

export type Invitation = {
  id: number;
  is_active: boolean;
  is_valid: boolean;
  created_at: string;
  expires_at: string;
  revoked_at?: string | null;
  collaborator_count?: number;
  // Only present in the create response; the token is stored hashed.
  url?: string;
};

export const createInvitation = (treeId: number): Promise<Invitation> =>
  apiRequest<Invitation>(`/api/trees/${treeId}/invitations/`, {
    method: "POST",
  });

// Owner only (FR-10). Newest first; links can't be shown again (SA-2).
export const listInvitations = (
  treeId: number,
  signal?: AbortSignal,
): Promise<Invitation[]> =>
  apiRequest<Invitation[]>(`/api/trees/${treeId}/invitations/`, { signal });

// People who already joined keep access; nobody new can join with it.
export const revokeInvitation = (
  treeId: number,
  invitationId: number,
): Promise<void> =>
  apiRequest<void>(`/api/trees/${treeId}/invitations/${invitationId}/`, {
    method: "DELETE",
  });

export type InvitationPreview = {
  tree_id: number;
  tree_name: string;
  already_member: boolean;
};

export const previewInvitation = (
  token: string,
  signal?: AbortSignal,
): Promise<InvitationPreview> =>
  apiRequest<InvitationPreview>(`/api/invite/${encodeURIComponent(token)}/`, {
    signal,
  });

export const acceptInvitation = (
  token: string,
): Promise<{ tree_id: number; role: "owner" | "collaborator" }> =>
  apiRequest(`/api/invite/${encodeURIComponent(token)}/`, { method: "POST" });

// ----- Photos and documents (Owner only; FR-4, FR-6, FR-9, FR-18) -----

export const uploadMemberPhoto = (
  treeId: number,
  memberId: number,
  file: File,
): Promise<FamilyMember> => {
  const form = new FormData();
  form.append("photo", file);
  return apiRequest<FamilyMember>(
    `/api/trees/${treeId}/members/${memberId}/photo/`,
    { method: "PUT", body: form },
  );
};

export const deleteMemberPhoto = (treeId: number, memberId: number): Promise<void> =>
  apiRequest<void>(`/api/trees/${treeId}/members/${memberId}/photo/`, {
    method: "DELETE",
  });

export const uploadDocument = (
  treeId: number,
  memberId: number,
  file: File,
): Promise<MemberDocument> => {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<MemberDocument>(
    `/api/trees/${treeId}/members/${memberId}/documents/`,
    { method: "POST", body: form },
  );
};

export const deleteDocument = (
  treeId: number,
  memberId: number,
  documentId: number,
): Promise<void> =>
  apiRequest<void>(
    `/api/trees/${treeId}/members/${memberId}/documents/${documentId}/`,
    { method: "DELETE" },
  );

// ----- Search (FR-15) -----

export type SearchResult = {
  id: number;
  tree_id: number;
  tree_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  birth_date: string | null;
  death_date: string | null;
  photo_url: string | null;
};

// Partial, case-insensitive first/last name match; Django searches only
// trees the user owns or collaborates on. treeId narrows it to one tree.
export const searchMembers = (
  query: string,
  treeId?: number,
  signal?: AbortSignal,
): Promise<SearchResult[]> => {
  const params = new URLSearchParams({ q: query });
  if (treeId !== undefined) params.set("tree", String(treeId));
  return apiRequest<SearchResult[]>(`/api/search/?${params.toString()}`, { signal });
};

// ----- Client-side checks mirrored from Django (the server still decides) -----

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";
export const PHOTO_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

// A friendly early message; Django re-checks type, file signature and size.
export const checkUpload = (file: File, kind: "document" | "photo"): string | null => {
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  const allowed = kind === "photo" ? ["jpg", "jpeg", "png"] : ["pdf", "jpg", "jpeg", "png"];
  if (!allowed.includes(ext)) {
    return kind === "photo"
      ? "Choose a JPG or PNG image."
      : "Choose a PDF, JPG or PNG file.";
  }
  if (file.size > MAX_UPLOAD_BYTES) return "That file is larger than 10 MB.";
  return null;
};
