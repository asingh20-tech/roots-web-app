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
    };

export type ChangeType =
  | "ADD_MEMBER"
  | "UPDATE_MEMBER"
  | "ADD_MEDIA"
  | "ADD_RELATIONSHIP";
export type ChangeStatus = "PENDING" | "APPROVED" | "REJECTED" | "OUTDATED";

// SuggestionSerializer output.
export type ChangeRequest = {
  id: number;
  change_type: ChangeType;
  description: string;
  target_member: number | null;
  target_member_name: string | null;
  proposed_data: Record<string, unknown> | null;
  file_url: string | null;
  status: ChangeStatus;
  is_outdated: boolean;
  comparison: Record<string, { current: unknown; proposed: unknown }> | null;
  submitted_by_name: string;
  created_at: string;
  reviewed_at: string | null;
};

export const submitChangeRequest = (
  treeId: number,
  input: ChangeRequestInput,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(`/api/trees/${treeId}/suggestions/`, {
    method: "POST",
    body: input,
  });

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
  // Only present in the create response; the token is stored hashed.
  url?: string;
};

export const createInvitation = (treeId: number): Promise<Invitation> =>
  apiRequest<Invitation>(`/api/trees/${treeId}/invitations/`, {
    method: "POST",
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
