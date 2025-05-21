export enum ElectionStatus { 
    "Pre-Election" = 0, 
    "Ongoing" = 1, 
    "Post-Election" = 2, 
    "Closed" = 3
};

export interface ElectionData {
    id: string;
    name: string;
    description?: string; // Added description field
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
    email: string;
    group_id: string | null; // group_id can be nullable
    has_voted?: boolean;     // Added has_voted (optional as it might not always be fetched)
    voted_at?: string | null; // Added voted_at (optional and nullable)
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
    group_id: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface ElectionPosition {
  id: string;
  election_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// For Realtime Page
export interface RealtimeCandidateData {
  id: string;
  display_name: string;
  party: string;
  image_url?: string | null;
  voteCount: number;
}

export interface RealtimePositionData {
  id: string;
  name: string;
  candidates: RealtimeCandidateData[];
}

export interface InitialRealtimeData {
  electionName: string;
  electionStatus: ElectionStatus;
  positions: RealtimePositionData[];
}

// For Ballot Page
export interface BallotCandidate {
  id: string;
  display_name: string;
  party: string;
  image_url?: string | null;
}

export interface BallotPosition {
  id: string;
  name: string;
  candidates: BallotCandidate[];
}

export interface VoterInfoForBallot {
  id: string; // voter's ID
  email: string;
  groupId: string | null;
  hasVoted: boolean;
}

export interface BallotPageData {
  electionId: string;
  electionName: string;
  electionStatus: ElectionStatus;
  voterInfo: VoterInfoForBallot | null; // Null if voter not found or not part of this election
  positions: BallotPosition[];
}
