export enum ElectionStatus { 
    "Pre-Election" = 0, 
    "Ongoing" = 1, 
    "Post-Election" = 2, 
    "Closed" = 3
};

export interface ElectionData {
    id: string;
    name: string;
    status: ElectionStatus;
    start_date: string;
    end_date: string;
    owner_id: string;
    members?: ElectionMember[];
    voter_count: number;
    created_at: string;
    updated_at: string;
}

export enum PermissionFlags {
    VOTE = 1 << 0,
    VIEW_RESULTS = 1 << 1,
    MODIFY_VOTERS = 1 << 2,
    MODIFY_CANDIDATES = 1 << 3,
    MODIFY_GROUPS = 1 << 4,
    VIEW_ANALYTICS = 1 << 5,
    INVITE_USERS = 1 << 6,
    MODIFY_USER_ROLES = 1 << 7,
    MODIFY_ELECTION_STATE = 1 << 8,
    MODIFY_SETTINGS = 1 << 9,
}

export type VoterPermissionFlags = PermissionFlags.VOTE | PermissionFlags.VIEW_RESULTS;
export type EditorPermissionFlags = VoterPermissionFlags | PermissionFlags.MODIFY_CANDIDATES | PermissionFlags.MODIFY_VOTERS | PermissionFlags.MODIFY_GROUPS;
export type AdminPermissionFlags = EditorPermissionFlags | PermissionFlags.MODIFY_SETTINGS | PermissionFlags.INVITE_USERS  | PermissionFlags.MODIFY_USER_ROLES | PermissionFlags.VIEW_ANALYTICS;
export type OwnerPermissionFlags = AdminPermissionFlags | PermissionFlags.MODIFY_ELECTION_STATE;

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ElectionMember extends User {
    electionId: string;
}

export interface ElectionEditor extends ElectionMember {
    permission: EditorPermissionFlags;
}

export interface ElectionAdmin extends ElectionMember {
    permission: AdminPermissionFlags;
}

export interface ElectionOwner extends ElectionMember {
    permission: OwnerPermissionFlags;
}

export type ElectionMemberType = ElectionEditor | ElectionAdmin | ElectionOwner;
