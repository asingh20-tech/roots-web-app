// Family tree API (backend: trees/views.py, trees/serializers.py).
import { apiRequest } from "./api";

export { ApiError } from "./api";

export type FamilyTree = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  is_owner: boolean;
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

export type ChangeRequest = {
  id: number;
  change_type: string;
  description: string;
  status: string;
  created_at: string;
};

export const submitChangeRequest = (
  treeId: number,
  input: ChangeRequestInput,
): Promise<ChangeRequest> =>
  apiRequest<ChangeRequest>(`/api/trees/${treeId}/suggestions/`, {
    method: "POST",
    body: input,
  });
