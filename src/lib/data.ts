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
    voter_count: number;
    created_at: string;
    updated_at: string;
}

export interface UserGroupsData {
    id: string;
    election_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface VotersData {
    id: string;
    election_id: string;
    display_name: string;
    group_id: string;
    created_at: string;
    updated_at: string;
}

export interface CandidatePositionsData {
    id: string;
    election_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface BallotData {
    id: string;
    election_id: string;
    voter_id: string;
    votes: VoteData[]
    created_at: string;
    updated_at: string;
}

export interface VoteData {
    candidate_id: string;
    position_id: string;
}

export interface CandidatesData {
    id: string;
    election_id: string;
    position_id: string;
    party: string;
    display_name: string;
    image_url: string;
    created_at: string;
    updated_at: string;
}

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

export interface ElectionGroup {
  id: string;
  election_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  // You might want to add voter_count or similar if you track members of a group directly
}

export interface ElectionPosition {
  id: string;
  election_id: string;
  title: string;
  description?: string | null;
  slots_available: number;
  created_at: string;
  updated_at: string;
}
