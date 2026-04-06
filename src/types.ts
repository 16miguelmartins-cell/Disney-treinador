
export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  name: string;
  overall: number;
  position: Position;
  series: string;
  price?: number;
  isInjured?: boolean;
  isSuspended?: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  color: string;
  secondaryColor: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  week: number;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  totalRating: number;
  matchesPlayed: number;
  injuryWeeks: number;
  suspensionWeeks: number;
}

export interface LeagueState {
  currentWeek: number;
  userTeamId: string;
  coachName: string;
  money: number;
  standings: {
    teamId: string;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
  }[];
  lineup: string[]; // Player IDs
  substitutes: string[]; // Up to 5 player IDs
  tactics: {
    style: 'Attacking' | 'Balanced' | 'Defensive';
    intensity: number;
    formation: '4-3-3' | '4-4-2' | '3-5-2' | '5-3-2';
  };
  marketPlayers: Player[];
  playerStats: Record<string, PlayerStats>;
  trainingPlayers: string[]; // Up to 2 player IDs
  playerProgress: Record<string, number>; // 0-100 progress towards next overall
}
