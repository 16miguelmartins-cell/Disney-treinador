import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout,
  AlertTriangle,
  Trophy, 
  Users, 
  LayoutDashboard, 
  Settings, 
  Play, 
  ChevronRight, 
  Shield, 
  Zap, 
  Target,
  ArrowLeft,
  Info,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TEAMS, MARKET_POOL } from './data/teams';
import { Team, Player, Position, Match, LeagueState, PlayerStats } from './types';

const SERIES_LOGOS: Record<string, string> = {
  'Phineas e Ferb': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/d/d4/Phineas_and_Ferb_logo.png',
  'Gravity Falls': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/6/62/Gravity_Falls_logo.png',
  'Mickey Mouse': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/f/fe/Mickey_Mouse_head_and_ears.svg',
  'Star contra as Forças do Mal': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/c/c3/Star_vs._the_Forces_of_Evil_logo.png',
  'Miraculous': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/d/d0/Miraculous_Ladybug_logo.png',
  'Amphibilandia': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/a/a2/Amphibia_logo.png',
  'A Raven Voltou': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/1/13/That%27s_So_Raven_logo.png',
  'Jessie': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/0/0b/Jessie_logo.png',
  'KC Agente Secreta': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/b/b5/K.C._Undercover_logo.png',
  'Acampamento Kikiwaka': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/5/5e/Bunk%27d_logo.png',
  'A Irmã do Meio': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/e/e0/Stuck_in_the_Middle_logo.png',
  'Os Green na Cidade Grande': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/b/b0/Big_City_Greens_logo.png',
  'Kim Possible': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/5/5a/Kim_Possible_logo.png',
  'Ben 10': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/3/3b/Ben_10_logo.png',
  'Jake Long': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/1/1b/American_Dragon_Jake_Long_logo.png',
  'Randy Cunningham': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/2/2c/Randy_Cunningham_9th_Grade_Ninja_logo.png',
  'Penn Zero': 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/2/29/Penn_Zero_Part-Time_Hero_logo.png',
  'Mercado': 'https://images.weserv.nl/?url=cdn-icons-png.flaticon.com/512/1162/1162499.png'
};

const Logo = ({ name, className = "w-5 h-5", invert = false }: { name: string, className?: string, invert?: boolean }) => {
  const [error, setError] = useState(false);

  if (!SERIES_LOGOS[name] || error) {
    return (
      <div 
        title={name}
        className={`${className} bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase`}
      >
        {name.substring(0, 2)}
      </div>
    );
  }

  return (
    <img 
      key={name}
      src={SERIES_LOGOS[name]} 
      alt={name} 
      title={name}
      className={`${className} object-contain ${invert ? 'brightness-0 invert' : ''}`} 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)}
    />
  );
};

// Commentary templates
const COMMENTARY = {
  GOAL: [
    "GOLO! Que finalização fantástica!",
    "GOOOOOLO! A bola entra no fundo das redes!",
    "GOLO! O estádio vai à loucura!",
    "É GOLO! Uma jogada de mestre!"
  ],
  VAR_NO_GOAL: [
    "VAR: Não é golo! Mão na bola.",
    "VAR: Golo anulado por fora de jogo.",
    "VAR: Decisão revertida! Falta no início da jogada."
  ],
  MISS: [
    "Passou muito perto! Que perdida...",
    "Remate forte, mas por cima da barra.",
    "O guarda-redes defende com segurança."
  ]
};

interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'VAR_NO_GOAL' | 'MISS' | 'START' | 'END' | 'CARD_YELLOW' | 'CARD_RED' | 'INJURY';
  text: string;
  teamId?: string;
  playerName?: string;
  assistPlayerName?: string;
  score?: string;
}

// Helper to simulate a match
const simulateMatch = (homeTeam: Team, awayTeam: Team, homeLineup: Player[], awayLineup: Player[], tactics: any, statsUpdate: Record<string, PlayerStats>): { homeScore: number, awayScore: number } => {
  let hScore = 0;
  let aScore = 0;

  const homePower = homeLineup.reduce((acc, p) => acc + p.overall, 0) / 11;
  const awayPower = awayLineup.reduce((acc, p) => acc + p.overall, 0) / 11;

  // Simulate 90 minutes
  const matchYellowCards: Record<string, number> = {};
  const homePlayers = [...homeLineup];
  const awayPlayers = [...awayLineup];

  for (let m = 1; m <= 90; m++) {
    const eventChance = 0.05 + (homePower + awayPower) / 2000; // Higher overall = more events
    if (Math.random() < eventChance) {
      // Home advantage + power difference
      const homeProb = 0.52 + (homePower - awayPower) / 100;
      const isHome = Math.random() < homeProb;
      const currentLineup = isHome ? homePlayers : awayPlayers;
      if (currentLineup.length === 0) continue;

      const eventType = Math.random();

      if (eventType < 0.3) { // Goal
        if (isHome) hScore++; else aScore++;
        // Weighted random for scorer based on overall and position
        const weights = currentLineup.map(p => {
          let w = p.overall - 60;
          if (p.position === 'FW') w *= 3;
          if (p.position === 'MF') w *= 1.5;
          return w;
        });
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalWeight;
        let scorerIdx = 0;
        for (let i = 0; i < weights.length; i++) {
          r -= weights[i];
          if (r <= 0) {
            scorerIdx = i;
            break;
          }
        }
        const scorer = currentLineup[scorerIdx];
        const assistant = currentLineup[Math.floor(Math.random() * currentLineup.length)];
        if (statsUpdate[scorer.id]) statsUpdate[scorer.id].goals++;
        if (assistant.id !== scorer.id && statsUpdate[assistant.id]) statsUpdate[assistant.id].assists++;
      } else if (eventType < 0.38) { // Yellow Card
        const playerIdx = Math.floor(Math.random() * currentLineup.length);
        const player = currentLineup[playerIdx];
        if (player && statsUpdate[player.id]) {
          matchYellowCards[player.id] = (matchYellowCards[player.id] || 0) + 1;
          statsUpdate[player.id].yellowCards++;
          
          if (matchYellowCards[player.id] >= 2) {
            statsUpdate[player.id].redCards++;
            statsUpdate[player.id].suspensionWeeks = 1;
            currentLineup.splice(playerIdx, 1); // Expelled
          }
        }
      } else if (eventType < 0.40) { // Red Card
        const playerIdx = Math.floor(Math.random() * currentLineup.length);
        const player = currentLineup[playerIdx];
        if (player && statsUpdate[player.id]) {
          statsUpdate[player.id].redCards++;
          statsUpdate[player.id].suspensionWeeks = 1;
          currentLineup.splice(playerIdx, 1); // Expelled
        }
      } else if (eventType < 0.44) { // Injury
        const playerIdx = Math.floor(Math.random() * currentLineup.length);
        const player = currentLineup[playerIdx];
        if (player && statsUpdate[player.id]) {
          statsUpdate[player.id].injuryWeeks = Math.floor(Math.random() * 3) + 1;
          currentLineup.splice(playerIdx, 1); // Must leave
        }
      }
    }
  }

  // Clean sheets
  if (hScore === 0) {
    const awayGK = awayLineup.find(p => p.position === 'GK');
    if (awayGK && statsUpdate[awayGK.id]) statsUpdate[awayGK.id].cleanSheets++;
  }
  if (aScore === 0) {
    const homeGK = homeLineup.find(p => p.position === 'GK');
    if (homeGK && statsUpdate[homeGK.id]) statsUpdate[homeGK.id].cleanSheets++;
  }

  // Ratings
  [...homeLineup, ...awayLineup].forEach(p => {
    if (statsUpdate[p.id]) {
      statsUpdate[p.id].matchesPlayed++;
      statsUpdate[p.id].totalRating += 6 + Math.random() * 4;
    }
  });

  return { homeScore: hScore, awayScore: aScore };
};

const PlayerCard = ({ player, isStarter }: { player: Player, isStarter?: boolean }) => {
  const posColor = {
    GK: 'bg-yellow-500',
    DF: 'bg-blue-500',
    MF: 'bg-green-500',
    FW: 'bg-red-500'
  }[player.position];

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative p-3 rounded-lg border-2 ${isStarter ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'} shadow-sm flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${posColor}`}>
          {player.position}
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{player.name}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{player.series}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-lg font-black text-indigo-600">{player.overall}</span>
      </div>
    </motion.div>
  );
};

import { useDraggable, useDroppable } from '@dnd-kit/core';

const FORMATION_MAP: Record<string, { x: number, y: number, pos: Position }[]> = {
  '4-4-2': [
    { x: 35, y: 15, pos: 'FW' }, { x: 65, y: 15, pos: 'FW' },
    { x: 20, y: 40, pos: 'MF' }, { x: 40, y: 40, pos: 'MF' }, { x: 60, y: 40, pos: 'MF' }, { x: 80, y: 40, pos: 'MF' },
    { x: 20, y: 70, pos: 'DF' }, { x: 40, y: 70, pos: 'DF' }, { x: 60, y: 70, pos: 'DF' }, { x: 80, y: 70, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '4-3-3': [
    { x: 20, y: 15, pos: 'FW' }, { x: 50, y: 12, pos: 'FW' }, { x: 80, y: 15, pos: 'FW' },
    { x: 30, y: 45, pos: 'MF' }, { x: 50, y: 45, pos: 'MF' }, { x: 70, y: 45, pos: 'MF' },
    { x: 20, y: 75, pos: 'DF' }, { x: 40, y: 75, pos: 'DF' }, { x: 60, y: 75, pos: 'DF' }, { x: 80, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '3-5-2': [
    { x: 40, y: 15, pos: 'FW' }, { x: 60, y: 15, pos: 'FW' },
    { x: 15, y: 45, pos: 'MF' }, { x: 32, y: 45, pos: 'MF' }, { x: 50, y: 45, pos: 'MF' }, { x: 68, y: 45, pos: 'MF' }, { x: 85, y: 45, pos: 'MF' },
    { x: 30, y: 75, pos: 'DF' }, { x: 50, y: 75, pos: 'DF' }, { x: 70, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '4-5-1': [
    { x: 50, y: 15, pos: 'FW' },
    { x: 15, y: 45, pos: 'MF' }, { x: 32, y: 45, pos: 'MF' }, { x: 50, y: 45, pos: 'MF' }, { x: 68, y: 45, pos: 'MF' }, { x: 85, y: 45, pos: 'MF' },
    { x: 20, y: 75, pos: 'DF' }, { x: 40, y: 75, pos: 'DF' }, { x: 60, y: 75, pos: 'DF' }, { x: 80, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '3-4-3': [
    { x: 20, y: 15, pos: 'FW' }, { x: 50, y: 12, pos: 'FW' }, { x: 80, y: 15, pos: 'FW' },
    { x: 20, y: 45, pos: 'MF' }, { x: 40, y: 45, pos: 'MF' }, { x: 60, y: 45, pos: 'MF' }, { x: 80, y: 45, pos: 'MF' },
    { x: 30, y: 75, pos: 'DF' }, { x: 50, y: 75, pos: 'DF' }, { x: 70, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '5-4-1': [
    { x: 50, y: 15, pos: 'FW' },
    { x: 20, y: 45, pos: 'MF' }, { x: 40, y: 45, pos: 'MF' }, { x: 60, y: 45, pos: 'MF' }, { x: 80, y: 45, pos: 'MF' },
    { x: 15, y: 75, pos: 'DF' }, { x: 32, y: 75, pos: 'DF' }, { x: 50, y: 75, pos: 'DF' }, { x: 68, y: 75, pos: 'DF' }, { x: 85, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '4-2-3-1': [
    { x: 50, y: 12, pos: 'FW' },
    { x: 20, y: 35, pos: 'MF' }, { x: 50, y: 32, pos: 'MF' }, { x: 80, y: 35, pos: 'MF' },
    { x: 35, y: 55, pos: 'MF' }, { x: 65, y: 55, pos: 'MF' },
    { x: 20, y: 75, pos: 'DF' }, { x: 40, y: 75, pos: 'DF' }, { x: 60, y: 75, pos: 'DF' }, { x: 80, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '5-3-2': [
    { x: 40, y: 15, pos: 'FW' }, { x: 60, y: 15, pos: 'FW' },
    { x: 30, y: 45, pos: 'MF' }, { x: 50, y: 45, pos: 'MF' }, { x: 70, y: 45, pos: 'MF' },
    { x: 15, y: 75, pos: 'DF' }, { x: 32, y: 75, pos: 'DF' }, { x: 50, y: 75, pos: 'DF' }, { x: 68, y: 75, pos: 'DF' }, { x: 85, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
  '4-1-4-1': [
    { x: 50, y: 12, pos: 'FW' },
    { x: 15, y: 35, pos: 'MF' }, { x: 38, y: 35, pos: 'MF' }, { x: 62, y: 35, pos: 'MF' }, { x: 85, y: 35, pos: 'MF' },
    { x: 50, y: 55, pos: 'MF' },
    { x: 20, y: 75, pos: 'DF' }, { x: 40, y: 75, pos: 'DF' }, { x: 60, y: 75, pos: 'DF' }, { x: 80, y: 75, pos: 'DF' },
    { x: 50, y: 90, pos: 'GK' }
  ],
};

const DraggablePlayerItem = ({ player }: { player: Player, key?: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`flex-shrink-0 w-24 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center space-y-2 cursor-grab active:cursor-grabbing transition-shadow ${isDragging ? 'shadow-2xl opacity-50' : 'shadow-sm'}`}
    >
      <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center mx-auto font-black text-indigo-600">
        {player.overall}
      </div>
      <p className="text-[10px] font-bold text-slate-800 truncate">{player.name}</p>
      <p className="text-[8px] font-black text-slate-400 uppercase">{player.position}</p>
    </div>
  );
};

const DroppableSlot = ({ id, x, y, requiredPos, player, onClick, matchStats }: { id: string, x: number, y: number, requiredPos: Position, player?: Player, onClick: () => void, key?: string, matchStats?: { goals: number, assists: number, yellowCards: number, redCards: number } }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all ${isOver ? 'scale-125' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
        player ? 'bg-white border-indigo-500' : 
        isOver ? 'bg-indigo-100 border-indigo-400 border-solid' : 'bg-white/20 border-white/40 border-dashed'
      }`}>
        {player ? (
          <span className="text-indigo-600 font-black text-sm">{player.overall}</span>
        ) : (
          <span className="text-white/60 font-black text-xs">{requiredPos}</span>
        )}
        
        {/* Match Stats Overlay */}
        {matchStats && (matchStats.goals > 0 || matchStats.assists > 0 || matchStats.yellowCards > 0 || matchStats.redCards > 0) && (
          <div className="absolute -top-2 -right-2 flex flex-col gap-0.5 pointer-events-none">
            {Array.from({ length: matchStats.goals }).map((_, i) => (
              <div key={`goal-${i}`} className="w-3.5 h-3.5 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-slate-800 rounded-full" />
              </div>
            ))}
            {Array.from({ length: matchStats.assists }).map((_, i) => (
              <div key={`assist-${i}`} className="w-3.5 h-3.5 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              </div>
            ))}
            {matchStats.yellowCards > 0 && <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm shadow-sm" />}
            {matchStats.redCards > 0 && <div className="w-2.5 h-3.5 bg-red-500 rounded-sm shadow-sm" />}
          </div>
        )}
      </div>
      {player && (
        <div className={`absolute left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded whitespace-nowrap uppercase tracking-tighter ${requiredPos === 'GK' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {player.name.split(' ').pop()}
        </div>
      )}
    </button>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<'CAREER_SELECTION' | 'SELECT_TEAM' | 'COACH_NAME' | 'DASHBOARD' | 'LINEUP' | 'TACTICS' | 'MATCH' | 'MARKET' | 'TRAINING' | 'STATS' | 'SQUAD' | 'CALENDAR'>('CAREER_SELECTION');
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [league, setLeague] = useState<LeagueState | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [tempCoachName, setTempCoachName] = useState('');
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [matchScore, setMatchScore] = useState({ home: 0, away: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMatchStep, setCurrentMatchStep] = useState(0);
  const [matchStarted, setMatchStarted] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [statsTab, setStatsTab] = useState<'CLASSIFICATION' | 'SCORERS' | 'ASSISTS' | 'CLEAN_SHEETS' | 'RATINGS' | 'YELLOW_CARDS' | 'RED_CARDS'>('CLASSIFICATION');
  const [selectingPosition, setSelectingPosition] = useState<number | null>(null);
  const [lastMatchReward, setLastMatchReward] = useState<number | null>(null);
  const [sellConfirmation, setSellConfirmation] = useState<Player | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize League
  useEffect(() => {
    if (gameState === 'MATCH' && matchStarted && currentMatchStep < matchEvents.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMatchStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, matchStarted, currentMatchStep, matchEvents.length]);

  const startLeague = (teamId: string, coach: string) => {
    const userTeam = TEAMS.find(t => t.id === teamId)!;
    const initialLineup = Array(11).fill(''); // Start with empty tactics
    const initialSubstitutes = Array(5).fill(''); // Start with empty substitutes

    const playerStats: Record<string, any> = {};
    const playerProgress: Record<string, number> = {};
    TEAMS.forEach(t => {
      t.players.forEach(p => {
        playerStats[p.id] = { 
          goals: 0, 
          assists: 0, 
          cleanSheets: 0, 
          yellowCards: 0, 
          redCards: 0, 
          totalRating: 0, 
          matchesPlayed: 0,
          injuryWeeks: 0,
          suspensionWeeks: 0
        };
        playerProgress[p.id] = 0;
      });
    });
    MARKET_POOL.forEach(p => {
      playerStats[p.id] = { 
        goals: 0, 
        assists: 0, 
        cleanSheets: 0, 
        yellowCards: 0, 
        redCards: 0, 
        totalRating: 0, 
        matchesPlayed: 0,
        injuryWeeks: 0,
        suspensionWeeks: 0
      };
      playerProgress[p.id] = 0;
    });

    const chosenSeries = Array.from(new Set(TEAMS.map(t => t.players[0]?.series))).filter(Boolean);

    const newState: LeagueState = {
      currentWeek: 1,
      userTeamId: teamId,
      coachName: coach,
      money: 5000000, // 5M starting money
      standings: TEAMS.map(t => ({
        teamId: t.id,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0
      })),
      lineup: initialLineup,
      substitutes: initialSubstitutes,
      tactics: {
        style: 'Balanced',
        intensity: 70,
        formation: '4-3-3'
      },
      marketPlayers: MARKET_POOL
        .filter(p => chosenSeries.includes(p.series))
        .sort(() => Math.random() - 0.5)
        .slice(0, 12),
      playerStats,
      trainingPlayers: [],
      playerProgress
    };

    // Generate Schedule (Round Robin - Two Rounds)
    const newMatches: Match[] = [];
    let matchId = 1;
    const numTeams = TEAMS.length;
    const rounds = (numTeams - 1) * 2;
    const matchesPerRound = numTeams / 2;

    for (let week = 1; week <= rounds; week++) {
      const isSecondHalf = week > (numTeams - 1);
      const effectiveWeek = isSecondHalf ? week - (numTeams - 1) : week;

      for (let i = 0; i < matchesPerRound; i++) {
        const homeIdx = (effectiveWeek + i) % (numTeams - 1);
        const awayIdx = (numTeams - 1 - i + effectiveWeek) % (numTeams - 1);
        
        let home = TEAMS[homeIdx === effectiveWeek ? numTeams - 1 : homeIdx];
        let away = TEAMS[awayIdx];

        // Swap home/away for the second round
        if (isSecondHalf) {
          const temp = home;
          home = away;
          away = temp;
        }
        
        newMatches.push({
          id: `m-${matchId++}`,
          homeTeamId: home.id,
          awayTeamId: away.id,
          played: false,
          week
        });
      }
    }

    const finalState = { ...newState, lineup: initialLineup };
    setLeague(finalState);
    setMatches(newMatches);
    
    // Save to current slot
    if (currentSlot !== null) {
      localStorage.setItem(`toon-manager-slot-${currentSlot}`, JSON.stringify({
        league: finalState,
        matches: newMatches
      }));
    }
    
    setGameState('DASHBOARD');
  };

  const nextMatch = useMemo(() => {
    if (!league) return null;
    return matches.find(m => !m.played && (m.homeTeamId === league.userTeamId || m.awayTeamId === league.userTeamId));
  }, [matches, league]);

  const runMatchSimulation = (match: Match) => {
    setCurrentMatch(match);
    setIsSimulating(true);
    setGameState('MATCH');
    setCurrentMatchStep(0);
    setMatchStarted(false);
    setLastMatchReward(null);
    const homeTeam = TEAMS.find(t => t.id === match.homeTeamId)!;
    const awayTeam = TEAMS.find(t => t.id === match.awayTeamId)!;
    
    // Get actual lineups
    const getStarterLineup = (team: Team, isUser: boolean) => {
      if (isUser) {
        return league!.lineup.map(id => team.players.find(p => p.id === id)).filter(Boolean) as Player[];
      }
      // AI team: pick best 11 available
      return [...team.players]
        .filter(p => league!.playerStats[p.id].injuryWeeks === 0 && league!.playerStats[p.id].suspensionWeeks === 0)
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 11);
    };

    const homeLineup = getStarterLineup(homeTeam, match.homeTeamId === league!.userTeamId);
    const awayLineup = getStarterLineup(awayTeam, match.awayTeamId === league!.userTeamId);

    const events: MatchEvent[] = [{ minute: 0, type: 'START', text: 'Início da partida!' }];
    let hScore = 0;
    let aScore = 0;

    const statsUpdate: Record<string, any> = { ...league!.playerStats };

    // Reset scores for this week's standings update
    const updatedStandings = league!.standings.map(s => ({ ...s }));
    
    const homePower = homeLineup.reduce((acc, p) => acc + p.overall, 0) / 11;
    const awayPower = awayLineup.reduce((acc, p) => acc + p.overall, 0) / 11;

    // Simulate 90 minutes
    const matchYellowCards: Record<string, number> = {};
    const hPlayers = [...homeLineup];
    const aPlayers = [...awayLineup];

    for (let m = 1; m <= 90; m++) {
      const eventChance = 0.1 + (homePower + awayPower) / 1000;
      if (Math.random() < eventChance) { 
        const homeProb = 0.52 + (homePower - awayPower) / 100;
        const isHome = Math.random() < homeProb;
        const currentLineup = isHome ? hPlayers : aPlayers;
        const eventType = Math.random();
        
        if (currentLineup.length === 0) continue;

        if (eventType < 0.3) { // Goal
          if (isHome) hScore++; else aScore++;
          
          // Weighted random for scorer
          const weights = currentLineup.map(p => {
            let w = p.overall - 60;
            if (p.position === 'FW') w *= 3;
            if (p.position === 'MF') w *= 1.5;
            return w;
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          let r = Math.random() * totalWeight;
          let scorerIdx = 0;
          for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) {
              scorerIdx = i;
              break;
            }
          }
          const scorer = currentLineup[scorerIdx];
          const assistant = currentLineup.filter(p => p.id !== scorer.id)[Math.floor(Math.random() * (currentLineup.length - 1))];
          
          statsUpdate[scorer.id].goals++;
          if (assistant) {
            statsUpdate[assistant.id].assists++;
          }

          events.push({
            minute: m,
            type: 'GOAL',
            text: COMMENTARY.GOAL[Math.floor(Math.random() * COMMENTARY.GOAL.length)],
            teamId: isHome ? homeTeam.id : awayTeam.id,
            playerName: scorer.name,
            assistPlayerName: assistant?.name,
            score: `${hScore}-${aScore}`
          });
        } else if (eventType < 0.38) { // Yellow Card
          const playerIdx = Math.floor(Math.random() * currentLineup.length);
          const player = currentLineup[playerIdx];
          statsUpdate[player.id].yellowCards++;
          matchYellowCards[player.id] = (matchYellowCards[player.id] || 0) + 1;
          
          if (matchYellowCards[player.id] >= 2) {
            statsUpdate[player.id].redCards++;
            statsUpdate[player.id].suspensionWeeks = 1;
            events.push({
              minute: m,
              type: 'CARD_RED',
              text: `SEGUNDO AMARELO! ${player.name} é expulso após acumulação de cartões!`,
              playerName: player.name
            });
            currentLineup.splice(playerIdx, 1);
          } else {
            events.push({
              minute: m,
              type: 'CARD_YELLOW',
              text: `Cartão Amarelo para ${player.name}!`,
              playerName: player.name
            });
          }
        } else if (eventType < 0.40) { // Red Card
          const playerIdx = Math.floor(Math.random() * currentLineup.length);
          const player = currentLineup[playerIdx];
          statsUpdate[player.id].redCards++;
          statsUpdate[player.id].suspensionWeeks = 1;
          events.push({
            minute: m,
            type: 'CARD_RED',
            text: `CARTÃO VERMELHO DIRETO! ${player.name} vai para o balneário mais cedo!`,
            playerName: player.name
          });
          currentLineup.splice(playerIdx, 1);
        } else if (eventType < 0.43) { // Injury
          const playerIdx = Math.floor(Math.random() * currentLineup.length);
          const player = currentLineup[playerIdx];
          statsUpdate[player.id].injuryWeeks = Math.floor(Math.random() * 3) + 1;
          events.push({
            minute: m,
            type: 'INJURY',
            text: `${player.name} está lesionado e tem de sair!`,
            playerName: player.name
          });
          currentLineup.splice(playerIdx, 1);
        } else if (eventType < 0.46) { // VAR
          events.push({
            minute: m,
            type: 'VAR_NO_GOAL',
            text: COMMENTARY.VAR_NO_GOAL[Math.floor(Math.random() * COMMENTARY.VAR_NO_GOAL.length)]
          });
        } else { // Miss
          events.push({
            minute: m,
            type: 'MISS',
            text: COMMENTARY.MISS[Math.floor(Math.random() * COMMENTARY.MISS.length)]
          });
        }
      }
    }
    events.push({ minute: 90, type: 'END', text: 'Fim do jogo!', score: `${hScore}-${aScore}` });
    
    setMatchEvents(events);
    setMatchScore({ home: hScore, away: aScore });

    // Update Clean Sheets
    if (hScore === 0) {
      const awayGK = awayTeam.players.find(p => p.position === 'GK');
      if (awayGK) statsUpdate[awayGK.id].cleanSheets++;
    }
    if (aScore === 0) {
      const homeGK = homeTeam.players.find(p => p.position === 'GK');
      if (homeGK) statsUpdate[homeGK.id].cleanSheets++;
    }

    // Update Ratings and Matches Played
    [...homeTeam.players.slice(0, 11), ...awayTeam.players.slice(0, 11)].forEach(p => {
      statsUpdate[p.id].matchesPlayed++;
      statsUpdate[p.id].totalRating += 6 + Math.random() * 4; // Random rating between 6 and 10
    });
    
    // Update league state after simulation
    const updatedMatches = [...matches];
    const mIdx = updatedMatches.findIndex(m => m.id === match.id);
    updatedMatches[mIdx] = { ...match, homeScore: hScore, awayScore: aScore, played: true };

    // Simulate other matches in the week
    const otherMatches = matches.filter(m => m.week === league!.currentWeek && m.id !== match.id && !m.played);
    otherMatches.forEach(om => {
      const hT = TEAMS.find(t => t.id === om.homeTeamId)!;
      const aT = TEAMS.find(t => t.id === om.awayTeamId)!;
      
      const getLineup = (team: Team) => [...team.players]
        .filter(p => statsUpdate[p.id].injuryWeeks === 0 && statsUpdate[p.id].suspensionWeeks === 0)
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 11);

      const res = simulateMatch(hT, aT, getLineup(hT), getLineup(aT), { style: 'Balanced' }, statsUpdate);
      const omIdx = updatedMatches.findIndex(m => m.id === om.id);
      updatedMatches[omIdx] = { ...om, homeScore: res.homeScore, awayScore: res.awayScore, played: true };
    });

    // Update Standings for ALL matches this week
    updatedMatches.filter(m => m.week === league!.currentWeek).forEach(m => {
      const hS = updatedStandings.find(s => s.teamId === m.homeTeamId)!;
      const aS = updatedStandings.find(s => s.teamId === m.awayTeamId)!;
      hS.played++; aS.played++;
      hS.goalsFor += m.homeScore!; hS.goalsAgainst += m.awayScore!;
      aS.goalsFor += m.awayScore!; aS.goalsAgainst += m.homeScore!;
      if (m.homeScore! > m.awayScore!) { hS.won++; hS.points += 3; aS.lost++; }
      else if (m.homeScore! < m.awayScore!) { aS.won++; aS.points += 3; hS.lost++; }
      else { hS.drawn++; aS.drawn++; hS.points += 1; aS.points += 1; }
    });

    // Training Progress & Recovery
    const newProgress = { ...league!.playerProgress };
    Object.keys(statsUpdate).forEach(pid => {
      if (statsUpdate[pid].injuryWeeks > 0) statsUpdate[pid].injuryWeeks--;
      if (statsUpdate[pid].suspensionWeeks > 0) statsUpdate[pid].suspensionWeeks--;
    });

    league!.trainingPlayers.forEach(pid => {
      newProgress[pid] += 12.5; // 100 / 8 = 12.5
      if (newProgress[pid] >= 100) {
        newProgress[pid] = 0;
        // Increase overall
        TEAMS.forEach(t => {
          const p = t.players.find(pl => pl.id === pid);
          if (p && p.overall < 99) p.overall++;
        });
      }
    });

    const nextWeek = league!.currentWeek + 1;
    const chosenSeries = Array.from(new Set(TEAMS.map(t => t.players[0]?.series))).filter(Boolean);
    const shouldRefreshMarket = nextWeek % 3 === 0;

    setMatches(updatedMatches);
    const isUserHome = match.homeTeamId === league!.userTeamId;
    const userWon = isUserHome ? hScore > aScore : aScore > hScore;
    const userDrawn = hScore === aScore;
    const moneyEarned = userWon ? 500000 : (userDrawn ? 200000 : 50000);
    setLastMatchReward(moneyEarned);

    const newLeagueState = {
      ...league!,
      currentWeek: nextWeek,
      money: league!.money + moneyEarned,
      standings: updatedStandings.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)),
      marketPlayers: shouldRefreshMarket 
        ? MARKET_POOL
            .filter(p => chosenSeries.includes(p.series))
            .sort(() => Math.random() - 0.5)
            .slice(0, 12)
        : league!.marketPlayers,
      playerStats: statsUpdate,
      playerProgress: newProgress
    };

    setLeague(newLeagueState);

    // Save progress
    if (currentSlot !== null) {
      localStorage.setItem(`toon-manager-slot-${currentSlot}`, JSON.stringify({
        league: newLeagueState,
        matches: updatedMatches
      }));
    }
  };

  const buyPlayer = (player: Player) => {
    const price = player.price || 1000000;
    if (!league || league.money < price) return;
    const userTeam = TEAMS.find(t => t.id === league.userTeamId)!;
    
    // Limit squad to 11 starters + 5 substitutes = 16 players
    if (userTeam.players.length >= 16) {
      alert("O teu plantel já está completo! (Máximo 16 jogadores: 11 titulares + 5 suplentes)");
      return;
    }

    userTeam.players.push(player);
    const newLeague = {
      ...league,
      money: league.money - price,
      marketPlayers: league.marketPlayers.filter(p => p.id !== player.id)
    };
    setLeague(newLeague);

    if (currentSlot !== null) {
      localStorage.setItem(`toon-manager-slot-${currentSlot}`, JSON.stringify({
        league: newLeague,
        matches
      }));
    }
  };

  const sellPlayer = (player: Player) => {
    if (!league) return;
    const userTeam = TEAMS.find(t => t.id === league.userTeamId)!;
    if (userTeam.players.length <= 11) {
      return;
    }
    const price = Math.floor((player.price || 1000000) * 0.8); // 80% sell value
    userTeam.players = userTeam.players.filter(p => p.id !== player.id);
    const newLeague = {
      ...league,
      money: league.money + price,
      lineup: league.lineup.map(id => id === player.id ? '' : id),
      marketPlayers: [...league.marketPlayers, player]
    };
    setLeague(newLeague);

    if (currentSlot !== null) {
      localStorage.setItem(`toon-manager-slot-${currentSlot}`, JSON.stringify({
        league: newLeague,
        matches
      }));
    }
  };

  const togglePlayerInLineup = (playerId: string) => {
    if (!league) return;
    const newLineup = [...league.lineup];
    if (newLineup.includes(playerId)) {
      setLeague({ ...league, lineup: newLineup.filter(id => id !== playerId) });
    } else if (newLineup.length < 11) {
      setLeague({ ...league, lineup: [...newLineup, playerId] });
    }
  };

  const userTeam = league ? TEAMS.find(t => t.id === league.userTeamId) : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Toon Manager</h1>
          </div>
          {league && gameState !== 'MATCH' && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 text-sm font-bold">
                <span className="bg-indigo-800 px-3 py-1 rounded-full">Semana {league.currentWeek}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>{userTeam?.name}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-indigo-600 rounded-xl transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-[70] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic text-slate-800">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {[
                  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'TACTICS', label: 'Táticas', icon: Layout },
                  { id: 'MARKET', label: 'Mercado', icon: ShoppingCart },
                  { id: 'TRAINING', label: 'Treino', icon: Zap },
                  { id: 'STATS', label: 'Estatísticas', icon: Trophy },
                  { id: 'CALENDAR', label: 'Calendário', icon: CalendarIcon },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setGameState(item.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                      gameState === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </div>

              {league && (
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Saldo</span>
                    <span className="font-black text-indigo-600">{league.money.toLocaleString()}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Semana</span>
                    <span className="font-black text-slate-800">{league.currentWeek}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {gameState === 'CAREER_SELECTION' && (
            <motion.div 
              key="career"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Carreiras</h2>
                <p className="text-slate-500 font-medium">Escolha um slot para começar ou continuar a sua jornada.</p>
              </div>

              <div className="grid gap-4">
                {[1, 2, 3].map(slot => {
                  const savedData = localStorage.getItem(`toon-manager-slot-${slot}`);
                  const career = savedData ? JSON.parse(savedData) : null;

                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        setCurrentSlot(slot);
                        if (career) {
                          setLeague(career.league);
                          setMatches(career.matches);
                          setGameState('DASHBOARD');
                        } else {
                          setGameState('SELECT_TEAM');
                        }
                      }}
                      className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 transition-all text-left shadow-sm hover:shadow-xl overflow-hidden"
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-4">
                          {career && SERIES_LOGOS[TEAMS.find(t => t.id === career.league.userTeamId)?.name || ''] && (
                            <div className="w-12 h-12 bg-slate-50 rounded-xl p-2 flex items-center justify-center">
                              <img src={SERIES_LOGOS[TEAMS.find(t => t.id === career.league.userTeamId)?.name || '']} alt="Series Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-2xl font-black text-slate-800 mb-1">Slot {slot}</h3>
                            {career ? (
                              <div className="space-y-1">
                                <p className="text-indigo-600 font-bold">{career.league.coachName} @ {TEAMS.find(t => t.id === career.league.userTeamId)?.name}</p>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Semana {career.league.currentWeek} • {career.league.money.toLocaleString()}€</p>
                              </div>
                            ) : (
                              <p className="text-slate-400 font-bold">Slot Vazio - Começar Nova Carreira</p>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                          <ChevronRight className={`w-6 h-6 ${career ? 'text-indigo-600' : 'text-slate-300'}`} />
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'SELECT_TEAM' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-800">Escolha a sua Equipa</h2>
                <p className="text-slate-500">Selecione a série que deseja levar à vitória!</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEAMS.map(team => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setGameState('COACH_NAME');
                    }}
                    className="group relative overflow-hidden p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-500 transition-all text-left shadow-sm hover:shadow-md"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: team.color }} />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl p-2 flex items-center justify-center shadow-sm">
                        <Logo name={team.name} className="w-full h-full" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{team.name}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{team.players.length} Jogadores</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'COACH_NAME' && (
            <motion.div 
              key="coach"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">Perfil do Treinador</h2>
                <p className="text-slate-500">Como queres ser chamado no mundo do futebol?</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome do Treinador</label>
                  <input 
                    type="text"
                    value={tempCoachName}
                    onChange={(e) => setTempCoachName(e.target.value)}
                    placeholder="Ex: Mourinho das Toons"
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all font-bold"
                  />
                </div>
                
                <button 
                  onClick={() => tempCoachName && startLeague(selectedTeamId!, tempCoachName)}
                  disabled={!tempCoachName}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  COMEÇAR CARREIRA
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'DASHBOARD' && league && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Coach & Team Header */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg">
                      <Logo name={userTeam?.name || ''} className="w-full h-full" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic uppercase tracking-tight">{userTeam?.name}</h2>
                      <p className="text-indigo-200 font-bold">Treinador: {league.coachName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400 font-black text-xl">
                      <DollarSign className="w-5 h-5" />
                      {league.money.toLocaleString()}
                    </div>
                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Saldo Disponível</p>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Next Match Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black uppercase tracking-wider text-slate-400 text-xs">Próximo Jogo</h3>
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  {nextMatch ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-around">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-sm">
                            <Shield className="w-8 h-8 text-indigo-600" />
                          </div>
                          <p className="font-bold text-xs truncate w-24">{TEAMS.find(t => t.id === nextMatch.homeTeamId)?.name}</p>
                        </div>
                        <div className="text-xl font-black text-slate-200 italic">VS</div>
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-sm">
                            <Shield className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="font-bold text-xs truncate w-24">{TEAMS.find(t => t.id === nextMatch.awayTeamId)?.name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => runMatchSimulation(nextMatch)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        JOGAR AGORA
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <p className="font-bold text-slate-400">Fim da Época!</p>
                    </div>
                  )}
                </div>

                {/* Plantel Button */}
                <button 
                  onClick={() => setGameState('SQUAD')}
                  className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-slate-800 uppercase tracking-tight">O Teu Plantel</h3>
                      <p className="text-xs text-slate-400 font-bold">Gere os teus jogadores e táticas.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              </div>

                {/* Standings Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setGameState('STATS')}
                    className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 text-left hover:border-indigo-500 transition-all"
                  >
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Classificação</h3>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="divide-y divide-slate-50">
                      {league?.standings?.slice(0, 5).map((s, idx) => (
                        <div key={s.teamId} className={`p-4 flex items-center gap-4 ${s.teamId === league.userTeamId ? 'bg-indigo-50/50' : ''}`}>
                          <span className={`w-6 text-center font-black ${idx < 3 ? 'text-indigo-600' : 'text-slate-300'}`}>{idx + 1}</span>
                          <div className="flex-1 flex items-center gap-2 truncate">
                            <Logo name={TEAMS.find(t => t.id === s.teamId)?.name || ''} className="w-4 h-4" />
                            <span className="font-bold text-sm truncate">{TEAMS.find(t => t.id === s.teamId)?.name}</span>
                          </div>
                          <span className="font-black text-slate-800">{s.points} <span className="text-[10px] text-slate-400 font-bold">PTS</span></span>
                        </div>
                      ))}
                    </div>
                  </button>

                  <button 
                    onClick={() => setGameState('CALENDAR')}
                    className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 text-left hover:border-indigo-500 transition-all"
                  >
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Calendário</h3>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="p-4 space-y-3">
                      {matches
                        .filter(m => m.homeTeamId === league.userTeamId || m.awayTeamId === league.userTeamId)
                        .filter(m => m.week >= league.currentWeek)
                        .slice(0, 3)
                        .map(m => (
                          <div key={m.id} className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400 w-8">S{m.week}</span>
                            <span className="flex-1 truncate">{TEAMS.find(t => t.id === (m.homeTeamId === league.userTeamId ? m.awayTeamId : m.homeTeamId))?.name}</span>
                            <span className="text-indigo-600 uppercase">{m.homeTeamId === league.userTeamId ? '(C)' : '(F)'}</span>
                          </div>
                        ))}
                    </div>
                  </button>
                </div>
            </motion.div>
          )}

          {gameState === 'MATCH' && (
            <motion.div 
              key="match-simulation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Scoreboard */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex-1 text-center space-y-2">
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto flex items-center justify-center shadow-lg">
                      <Logo name={TEAMS.find(t => t.id === currentMatch?.homeTeamId)?.name || ''} className="w-full h-full" />
                    </div>
                    <p className="font-black uppercase tracking-tighter text-sm">{TEAMS.find(t => t.id === currentMatch?.homeTeamId)?.name}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-6xl font-black tabular-nums">
                      {matchEvents.slice(0, currentMatchStep + 1).filter(e => e.type === 'GOAL' && e.teamId === currentMatch?.homeTeamId).length}
                    </span>
                    <span className="text-2xl font-bold text-slate-500">:</span>
                    <span className="text-6xl font-black tabular-nums">
                      {matchEvents.slice(0, currentMatchStep + 1).filter(e => e.type === 'GOAL' && e.teamId === currentMatch?.awayTeamId).length}
                    </span>
                  </div>
                  <div className="flex-1 text-center space-y-2">
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto flex items-center justify-center shadow-lg">
                      <Logo name={TEAMS.find(t => t.id === currentMatch?.awayTeamId)?.name || ''} className="w-full h-full" />
                    </div>
                    <p className="font-black uppercase tracking-tighter text-sm">{TEAMS.find(t => t.id === currentMatch?.awayTeamId)?.name}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Lance a Lance
                  </h3>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setGameState('TACTICS')}
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-all uppercase tracking-widest flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Táticas
                    </button>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {matchEvents[currentMatchStep]?.minute}'
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 min-h-[200px] flex flex-col justify-center items-center text-center p-8">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentMatchStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className={`p-6 rounded-2xl ${
                        matchEvents[currentMatchStep]?.type === 'GOAL' ? 'bg-green-50 border-2 border-green-200' : 
                        matchEvents[currentMatchStep]?.type === 'CARD_YELLOW' ? 'bg-yellow-50 border-2 border-yellow-200' :
                        matchEvents[currentMatchStep]?.type === 'CARD_RED' ? 'bg-red-50 border-2 border-red-200' :
                        matchEvents[currentMatchStep]?.type === 'INJURY' ? 'bg-orange-50 border-2 border-orange-200' :
                        'bg-slate-50 border-2 border-slate-100'
                      }`}>
                        {matchEvents[currentMatchStep]?.type === 'GOAL' && <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />}
                        {matchEvents[currentMatchStep]?.type === 'CARD_YELLOW' && <div className="w-8 h-12 bg-yellow-500 rounded-lg mx-auto mb-4 shadow-lg" />}
                        {matchEvents[currentMatchStep]?.type === 'CARD_RED' && <div className="w-8 h-12 bg-red-500 rounded-lg mx-auto mb-4 shadow-lg" />}
                        {matchEvents[currentMatchStep]?.type === 'INJURY' && <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />}
                        {matchEvents[currentMatchStep]?.type === 'VAR_NO_GOAL' && <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
                        <p className="text-xl font-black text-slate-800 leading-tight">
                          {matchEvents[currentMatchStep]?.text}
                        </p>
                        {matchEvents[currentMatchStep]?.playerName && (
                          <p className="mt-2 font-bold text-indigo-600 uppercase tracking-widest text-sm">
                            {matchEvents[currentMatchStep]?.playerName}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  {!matchStarted && currentMatchStep === 0 ? (
                    <button 
                      onClick={() => setMatchStarted(true)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      COMEÇAR PARTIDA
                    </button>
                  ) : currentMatchStep === matchEvents.length - 1 ? (
                    <div className="flex-1 space-y-4">
                      {lastMatchReward !== null && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center"
                        >
                          <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Recompensa de Jogo</p>
                          <div className="flex items-center justify-center gap-1 text-green-700 font-black text-xl">
                            <DollarSign className="w-5 h-5" />
                            {lastMatchReward.toLocaleString()}
                          </div>
                        </motion.div>
                      )}
                      <button 
                        onClick={() => {
                          setIsSimulating(false);
                          setGameState('DASHBOARD');
                          setMatchStarted(false);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg transition-all"
                      >
                        FINALIZAR PARTIDA
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 bg-slate-100 p-4 rounded-2xl text-center text-slate-400 font-bold animate-pulse">
                      Simulando partida...
                    </div>
                  )}
                </div>

                {/* Timeline List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {matchEvents.slice(0, currentMatchStep + 1).reverse().map((event, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 p-3 rounded-xl ${i === 0 ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50/50 border border-slate-100'}`}
                    >
                      <div className={`mt-1 p-1.5 rounded-lg ${
                        event.type === 'GOAL' ? 'bg-green-100 text-green-600' : 
                        event.type === 'CARD_YELLOW' ? 'bg-yellow-100 text-yellow-600' :
                        event.type === 'CARD_RED' ? 'bg-red-100 text-red-600' :
                        event.type === 'INJURY' ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {event.type === 'GOAL' && <Trophy className="w-3 h-3" />}
                        {event.type === 'CARD_YELLOW' && <div className="w-3 h-3 bg-yellow-500 rounded-sm" />}
                        {event.type === 'CARD_RED' && <div className="w-3 h-3 bg-red-500 rounded-sm" />}
                        {event.type === 'INJURY' && <AlertCircle className="w-3 h-3" />}
                        {event.type === 'MISS' && <Target className="w-3 h-3" />}
                        {event.type === 'VAR_NO_GOAL' && <AlertCircle className="w-3 h-3" />}
                        {(event.type === 'START' || event.type === 'END') && <Clock className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400">{event.minute}'</span>
                          {event.type === 'GOAL' && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">GOLO!</span>}
                          {event.type === 'CARD_YELLOW' && <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Amarelo</span>}
                          {event.type === 'CARD_RED' && <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Vermelho</span>}
                          {event.type === 'INJURY' && <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Lesão</span>}
                        </div>
                        <p className={`text-sm font-bold ${i === 0 ? 'text-slate-800' : 'text-slate-500'}`}>{event.text}</p>
                        {event.playerName && <p className="text-[10px] font-black text-indigo-600 uppercase mt-0.5">{event.playerName}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Full Timeline Summary */}
              {currentMatchStep === matchEvents.length - 1 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">Resumo do Jogo</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {matchEvents.slice(0, currentMatchStep + 1).map((event, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm border-b border-slate-50 py-2 last:border-0">
                        <span className="font-black text-slate-300 w-8">{event.minute}'</span>
                        <span className={`font-bold ${event.type === 'GOAL' ? 'text-green-600' : 'text-slate-600'}`}>
                          {event.type === 'GOAL' ? 'GOLO!' : event.type === 'VAR_NO_GOAL' ? 'VAR' : 'Lance'}
                        </span>
                        <span className="text-slate-500 truncate">{event.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'TRAINING' && league && (
            <motion.div 
              key="training"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Centro de Treino
                </h2>
                <p className="text-slate-400 text-sm mt-1">Treina até 2 jogadores para aumentar o seu overall.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {league?.trainingPlayers?.map(pid => {
                  const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || 
                                 MARKET_POOL.find(p => p.id === pid);
                  if (!player) return null;
                  return (
                    <div key={pid} className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-slate-800">{player.name}</h4>
                        <button 
                          onClick={() => setLeague({ ...league, trainingPlayers: league.trainingPlayers.filter(id => id !== pid) })}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Progresso</span>
                          <span>{Math.round(league.playerProgress[pid])}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-500" 
                            style={{ width: `${league.playerProgress[pid]}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">Leva cerca de 8 jogos para subir +1 de Overall.</p>
                    </div>
                  );
                })}
                {Array.from({ length: 2 - league.trainingPlayers.length }).map((_, i) => (
                  <div key={i} className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <Users className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Vaga de Treino</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Selecionar Jogadores</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {TEAMS.find(t => t.id === league.userTeamId)?.players.map(player => (
                    <button
                      key={player.id}
                      disabled={league.trainingPlayers.includes(player.id) || league.trainingPlayers.length >= 2}
                      onClick={() => setLeague({ ...league, trainingPlayers: [...league.trainingPlayers, player.id] })}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        league.trainingPlayers.includes(player.id) 
                        ? 'bg-indigo-50 border-indigo-200 opacity-50' 
                        : 'bg-white border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{player.position}</div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800 text-sm">{player.name}</p>
                          <p className="text-[10px] text-slate-400">Overall: {player.overall}</p>
                        </div>
                      </div>
                      <div className="text-indigo-600 font-black">{player.overall}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'STATS' && league && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  { id: 'CLASSIFICATION', label: 'Classificação', icon: Trophy },
                  { id: 'SCORERS', label: 'Marcadores', icon: Target },
                  { id: 'ASSISTS', label: 'Assistências', icon: Users },
                  { id: 'CLEAN_SHEETS', label: 'Clean Sheets', icon: Shield },
                  { id: 'CARDS', label: 'Cartões', icon: AlertCircle },
                  { id: 'RATINGS', label: 'Pontuações', icon: Zap }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatsTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
                      statsTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                {statsTab === 'CLASSIFICATION' && (
                  <div className="space-y-4 overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Equipa</div>
                        <div className="col-span-1 text-center">J</div>
                        <div className="col-span-1 text-center">V</div>
                        <div className="col-span-1 text-center">E</div>
                        <div className="col-span-1 text-center">D</div>
                        <div className="col-span-1 text-center">GM</div>
                        <div className="col-span-1 text-center">GS</div>
                        <div className="col-span-1 text-center">DG</div>
                        <div className="col-span-1 text-right">Pts</div>
                      </div>
                      <div className="space-y-1">
                        {league?.standings?.map((s, i) => (
                          <div key={s.teamId} className={`grid grid-cols-12 items-center p-4 rounded-2xl text-sm ${s.teamId === league.userTeamId ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-slate-50'}`}>
                            <div className="col-span-1 font-black text-slate-400">{i + 1}</div>
                            <div className="col-span-4 font-bold text-slate-800 truncate">{TEAMS.find(t => t.id === s.teamId)?.name}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.played}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.won}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.drawn}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.lost}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.goalsFor}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.goalsAgainst}</div>
                            <div className="col-span-1 text-center font-medium text-slate-500">{s.goalsFor - s.goalsAgainst}</div>
                            <div className="col-span-1 text-right font-black text-indigo-600">{s.points}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {statsTab === 'SCORERS' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Melhores Marcadores</h3>
                    <div className="space-y-2">
                      {(Object.entries(league.playerStats) as [string, PlayerStats][])
                        .sort(([, a], [, b]) => b.goals - a.goals)
                        .slice(0, 10)
                        .map(([pid, stats], i) => {
                          const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || MARKET_POOL.find(p => p.id === pid);
                          if (!player || stats.goals === 0) return null;
                          return (
                            <div key={pid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-slate-300">#{i + 1}</span>
                                <div>
                                  <p className="font-bold text-slate-800">{player.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{player.series}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-indigo-600">{stats.goals}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Golos</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {statsTab === 'ASSISTS' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Melhores Assistências</h3>
                    <div className="space-y-2">
                      {(Object.entries(league.playerStats) as [string, PlayerStats][])
                        .sort(([, a], [, b]) => b.assists - a.assists)
                        .slice(0, 10)
                        .map(([pid, stats], i) => {
                          const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || MARKET_POOL.find(p => p.id === pid);
                          if (!player || stats.assists === 0) return null;
                          return (
                            <div key={pid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-slate-300">#{i + 1}</span>
                                <div>
                                  <p className="font-bold text-slate-800">{player.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{player.series}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-indigo-600">{stats.assists}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Assists</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {statsTab === 'CLEAN_SHEETS' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Jogos Sem Sofrer Golos</h3>
                    <div className="space-y-2">
                      {(Object.entries(league.playerStats) as [string, PlayerStats][])
                        .sort(([, a], [, b]) => b.cleanSheets - a.cleanSheets)
                        .slice(0, 10)
                        .map(([pid, stats], i) => {
                          const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || MARKET_POOL.find(p => p.id === pid);
                          if (!player || stats.cleanSheets === 0) return null;
                          return (
                            <div key={pid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-slate-300">#{i + 1}</span>
                                <div>
                                  <p className="font-bold text-slate-800">{player.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{player.series}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-indigo-600">{stats.cleanSheets}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Clean Sheets</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {statsTab === 'YELLOW_CARDS' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Cartões Amarelos</h3>
                    <div className="space-y-2">
                      {(Object.entries(league.playerStats) as [string, PlayerStats][])
                        .sort(([, a], [, b]) => b.yellowCards - a.yellowCards)
                        .slice(0, 20)
                        .map(([pid, stats], i) => {
                          const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || MARKET_POOL.find(p => p.id === pid);
                          if (!player || stats.yellowCards === 0) return null;
                          return (
                            <div key={pid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-slate-300">#{i + 1}</span>
                                <div>
                                  <p className="font-bold text-slate-800">{player.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{player.series}</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="w-4 h-6 bg-yellow-400 rounded-sm mx-auto mb-1" />
                                <p className="text-xs font-black text-slate-800">{stats.yellowCards}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {statsTab === 'RED_CARDS' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Cartões Vermelhos</h3>
                    <div className="space-y-2">
                      {(Object.entries(league.playerStats) as [string, PlayerStats][])
                        .sort(([, a], [, b]) => b.redCards - a.redCards)
                        .slice(0, 20)
                        .map(([pid, stats], i) => {
                          const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || MARKET_POOL.find(p => p.id === pid);
                          if (!player || stats.redCards === 0) return null;
                          return (
                            <div key={pid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-slate-300">#{i + 1}</span>
                                <div>
                                  <p className="font-bold text-slate-800">{player.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{player.series}</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="w-4 h-6 bg-red-500 rounded-sm mx-auto mb-1" />
                                <p className="text-xs font-black text-slate-800">{stats.redCards}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {statsTab === 'RATINGS' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Melhores Pontuações</h3>
                    <div className="space-y-2">
                      {(Object.entries(league.playerStats) as [string, PlayerStats][])
                        .filter(([, s]) => s.matchesPlayed > 0)
                        .sort(([, a], [, b]) => (b.totalRating / b.matchesPlayed) - (a.totalRating / a.matchesPlayed))
                        .slice(0, 10)
                        .map(([pid, stats], i) => {
                          const player = TEAMS.flatMap(t => t.players).find(p => p.id === pid) || MARKET_POOL.find(p => p.id === pid);
                          if (!player) return null;
                          const avgRating = (stats.totalRating / stats.matchesPlayed).toFixed(1);
                          return (
                            <div key={pid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-slate-300">#{i + 1}</span>
                                <div>
                                  <p className="font-bold text-slate-800">{player.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{player.series}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-indigo-600">{avgRating}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Rating Médio</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'TACTICS' && league && userTeam && (
            <motion.div 
              key="tactics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {isSimulating && (
                    <button 
                      onClick={() => setGameState('MATCH')}
                      className="p-2 hover:bg-slate-800 rounded-full transition-all"
                    >
                      <ArrowLeft className="w-6 h-6 text-indigo-400" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                      <Settings className="w-6 h-6 text-indigo-400" />
                      Táticas & Formação
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Define a tua estratégia e o onze inicial.</p>
                  </div>
                </div>
              </div>

              {/* Pitch Visualization */}
              <div className="bg-green-600 rounded-3xl p-4 shadow-inner relative aspect-[3/4] max-w-md mx-auto overflow-hidden border-4 border-green-700">
                {/* Pitch Markings */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/30 border-t-0 pointer-events-none" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/30 border-b-0 pointer-events-none" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full pointer-events-none" />

                <DndContext 
                  sensors={sensors}
                  onDragStart={(event) => setActiveDragId(event.active.id as string)}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    setActiveDragId(null);
                    if (over && active.id !== over.id) {
                      const activeId = active.id as string;
                      const overId = over.id as string;
                      
                      // If dropping a player from squad onto a slot
                      if (overId.startsWith('slot-')) {
                        const slotIdx = parseInt(overId.split('-')[1]);
                        const player = userTeam.players.find(p => p.id === activeId);
                        const requiredPos = FORMATION_MAP[league.tactics.formation][slotIdx].pos;
                        
                        if (player && player.position === requiredPos) {
                          const newLineup = [...league.lineup];
                          // If player was already in another slot, remove them from there
                          const oldIdx = newLineup.indexOf(player.id);
                          if (oldIdx !== -1) {
                            newLineup[oldIdx] = ''; // Empty old slot
                          }
                          newLineup[slotIdx] = player.id;
                          setLeague({ ...league, lineup: newLineup });
                        }
                      }
                    }
                  }}
                >
                  <div className="relative w-full h-full">
                    {FORMATION_MAP[league?.tactics?.formation || '4-3-3']?.map((pos, idx) => {
                      const playerId = league?.lineup?.[idx];
                      const player = userTeam.players.find(p => p.id === playerId);
                      
                      // Calculate match stats for this player if in a match
                      let matchStats = undefined;
                      if (isSimulating && matchEvents.length > 0) {
                        const events = matchEvents.slice(0, currentMatchStep + 1);
                        matchStats = {
                          goals: events.filter(e => e.type === 'GOAL' && e.playerName === player?.name).length,
                          assists: events.filter(e => e.type === 'GOAL' && e.assistPlayerName === player?.name).length,
                          yellowCards: events.filter(e => e.type === 'CARD_YELLOW' && e.playerName === player?.name).length,
                          redCards: events.filter(e => e.type === 'CARD_RED' && e.playerName === player?.name).length,
                        };
                      }

                      return (
                        <DroppableSlot 
                          key={`slot-${idx}`} 
                          id={`slot-${idx}`}
                          x={pos.x} 
                          y={pos.y}
                          requiredPos={pos.pos}
                          player={player}
                          matchStats={matchStats}
                          onClick={() => setSelectingPosition(idx)}
                        />
                      );
                    })}
                  </div>
                  
                  <DragOverlay>
                    {activeDragId ? (
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-2xl scale-125">
                        <span className="text-indigo-600 font-black text-sm">
                          {userTeam.players.find(p => p.id === activeDragId)?.overall}
                        </span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>

              {/* Substitutes */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Suplentes (Máx. 5)
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {league?.substitutes?.map((pid, idx) => {
                    const player = userTeam.players.find(p => p.id === pid);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectingPosition(idx + 11)} // 11-15 for substitutes
                        className={`min-w-[100px] h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                          player ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {player ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                              {player.overall}
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-slate-800 truncate w-20">{player.name}</p>
                              <p className="text-[8px] text-slate-400 font-black uppercase">{player.position}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <Plus className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Vazio</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectingPosition !== null && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                  <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[80vh] overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-slate-800 uppercase italic">Selecionar Jogador</h3>
                      <button onClick={() => setSelectingPosition(null)} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 rotate-90" />
                      </button>
                    </div>
                    <div className="overflow-y-auto space-y-2 flex-1 pr-2 custom-scrollbar">
                      {userTeam.players
                        .filter(p => {
                          if (selectingPosition < 11) {
                            const formation = FORMATION_MAP[league.tactics.formation];
                            const requiredPos = formation[selectingPosition].pos;
                            return p.position === requiredPos;
                          }
                          return true; // Any position for substitutes
                        })
                        .map(player => {
                          const isInjured = league.playerStats[player.id].injuryWeeks > 0;
                          const isSuspended = league.playerStats[player.id].suspensionWeeks > 0;
                          const isDisabled = isInjured || isSuspended;
                          const isInLineup = league.lineup.includes(player.id);
                          const isInSubs = league.substitutes.includes(player.id);

                          return (
                            <button
                              key={player.id}
                              disabled={isDisabled}
                              onClick={() => {
                                if (selectingPosition < 11) {
                                  const newLineup = [...league.lineup];
                                  newLineup[selectingPosition] = player.id;
                                  // Remove from subs if it was there
                                  const newSubs = league.substitutes.map(sid => sid === player.id ? '' : sid);
                                  setLeague({ ...league, lineup: newLineup, substitutes: newSubs });
                                } else {
                                  const subIdx = selectingPosition - 11;
                                  const newSubs = [...league.substitutes];
                                  newSubs[subIdx] = player.id;
                                  // Remove from lineup if it was there
                                  const newLineup = league.lineup.map(lid => lid === player.id ? '' : lid);
                                  setLeague({ ...league, lineup: newLineup, substitutes: newSubs });
                                }
                                setSelectingPosition(null);
                              }}
                              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                                (isInLineup || isInSubs) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-200'
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{player.position}</div>
                                <div className="text-left">
                                  <p className="font-bold text-slate-800 text-sm">{player.name}</p>
                                  <div className="flex gap-1">
                                    {isInjured && <span className="text-[8px] font-black text-red-500 uppercase">Lesionado</span>}
                                    {isSuspended && <span className="text-[8px] font-black text-orange-500 uppercase">Suspenso</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="font-black text-indigo-600">{player.overall}</div>
                            </button>
                          );
                        })}
                    </div>
                  </motion.div>
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    Formação
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-4-1', '4-2-3-1', '5-3-2', '4-1-4-1'].map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          const newFormation = FORMATION_MAP[f];
                          const newLineup = league.lineup.map((pid, idx) => {
                            if (!pid) return '';
                            const player = userTeam.players.find(p => p.id === pid);
                            if (player && player.position === newFormation[idx].pos) return pid;
                            return '';
                          });
                          setLeague({ ...league, lineup: newLineup, tactics: { ...league.tactics, formation: f } });
                        }}
                        className={`py-3 rounded-xl font-bold text-sm transition-all ${league.tactics.formation === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Estilo de Jogo
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Attacking', 'Balanced', 'Defensive'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => setLeague({ ...league, tactics: { ...league.tactics, style } })}
                        className={`py-3 rounded-xl font-bold text-sm transition-all ${league.tactics.style === style ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {style === 'Attacking' ? 'Ataque' : style === 'Balanced' ? 'Equilibrado' : 'Defesa'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Intensidade
                    </h3>
                    <span className="text-indigo-600 font-black">{league.tactics.intensity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={league.tactics.intensity}
                    onChange={(e) => setLeague({ ...league, tactics: { ...league.tactics, intensity: parseInt(e.target.value) } })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'SQUAD' && league && userTeam && (
            <motion.div 
              key="squad"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    O Teu Plantel
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Gere os teus jogadores e a lista de transferências.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase">Valor do Plantel</p>
                  <div className="flex items-center gap-1 text-indigo-400 font-black text-xl">
                    <DollarSign className="w-5 h-5" />
                    {userTeam.players.reduce((acc, p) => acc + (p.price || 1000000), 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {['GK', 'DF', 'MF', 'FW'].map(pos => {
                  const playersInPos = userTeam.players.filter(p => p.position === pos).sort((a, b) => b.overall - a.overall);
                  if (playersInPos.length === 0) return null;
                  return (
                    <div key={pos} className="space-y-3">
                      <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest ml-2">
                        {pos === 'GK' ? 'Guarda-Redes' : pos === 'DF' ? 'Defesas' : pos === 'MF' ? 'Médios' : 'Avançados'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {playersInPos.map(player => (
                          <div key={player.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-indigo-600 text-lg">
                                {player.overall}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">{player.name}</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <Logo name={player.series} className="w-5 h-5" />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{player.series}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• {player.position}</p>
                                  {league.playerStats[player.id].injuryWeeks > 0 && (
                                    <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Lesionado ({league.playerStats[player.id].injuryWeeks}j)</span>
                                  )}
                                  {league.playerStats[player.id].suspensionWeeks > 0 && (
                                    <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase">Suspenso ({league.playerStats[player.id].suspensionWeeks}j)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="flex items-center justify-end gap-1 text-slate-800 font-black text-sm">
                                <DollarSign className="w-3 h-3 text-yellow-500" />
                                {(player.price || 1000000).toLocaleString()}
                              </div>
                              <button 
                                onClick={() => setSellConfirmation(player)}
                                className="text-red-500 hover:bg-red-50 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest border border-red-100"
                              >
                                Vender
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {sellConfirmation && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-sm rounded-3xl p-8 text-center space-y-6 shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                      <DollarSign className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-800 uppercase italic">Confirmar Venda</h3>
                      <p className="text-slate-500 text-sm">
                        Tens a certeza que queres vender o <span className="font-bold text-slate-800">{sellConfirmation.name}</span> por <span className="font-black text-indigo-600">{(Math.floor((sellConfirmation.price || 1000000) * 0.8)).toLocaleString()}€</span>?
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setSellConfirmation(null)}
                        className="py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => {
                          sellPlayer(sellConfirmation);
                          setSellConfirmation(null);
                        }}
                        className="py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black shadow-lg shadow-red-100 transition-all uppercase tracking-widest text-xs"
                      >
                        Confirmar
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'CALENDAR' && league && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-indigo-400" />
                    Calendário
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Consulta os jogos passados e futuros.</p>
                </div>
              </div>

              <div className="space-y-8">
                {Array.from({ length: (TEAMS.length - 1) * 2 }).map((_, i) => {
                  const week = i + 1;
                  const weekMatches = matches.filter(m => m.week === week);
                  if (weekMatches.length === 0) return null;

                  return (
                    <div key={week} className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Semana {week}</h3>
                        <div className="flex-1 h-px bg-slate-200" />
                        {week === league.currentWeek && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">Atual</span>}
                      </div>
                      <div className="grid gap-2">
                        {weekMatches.map(m => {
                          const home = TEAMS.find(t => t.id === m.homeTeamId);
                          const away = TEAMS.find(t => t.id === m.awayTeamId);
                          const isUserMatch = m.homeTeamId === league.userTeamId || m.awayTeamId === league.userTeamId;

                          return (
                            <div 
                              key={m.id} 
                              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                isUserMatch ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'
                              }`}
                            >
                              <div className="flex-1 flex items-center justify-end gap-3">
                                <span className="font-bold text-sm truncate">{home?.name}</span>
                                <Logo name={home?.name || ''} className="w-6 h-6" />
                              </div>
                              <div className="w-24 text-center">
                                {m.played ? (
                                  <span className="font-black text-lg tabular-nums">{m.homeScore} - {m.awayScore}</span>
                                ) : (
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">VS</span>
                                )}
                              </div>
                              <div className="flex-1 flex items-center gap-3">
                                <Logo name={away?.name || ''} className="w-6 h-6" />
                                <span className="font-bold text-sm truncate">{away?.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'MARKET' && league && (
            <motion.div 
              key="market"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-orange-400" />
                    Mercado de Transferências
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Contrata novos talentos para a tua equipa.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase">O teu saldo</p>
                  <div className="flex items-center gap-1 text-yellow-400 font-black text-xl">
                    <DollarSign className="w-5 h-5" />
                    {league.money.toLocaleString()}
                  </div>
                </div>
              </div>

              {['GK', 'DF', 'MF', 'FW'].map(pos => {
                const playersInPos = league?.marketPlayers?.filter(p => p.position === pos) || [];
                if (playersInPos.length === 0) return null;
                return (
                  <div key={pos} className="space-y-3">
                    <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest ml-2">
                      {pos === 'GK' ? 'Guarda-Redes' : pos === 'DF' ? 'Defesas' : pos === 'MF' ? 'Médios' : 'Avançados'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {playersInPos.map(player => (
                        <div key={player.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-indigo-600 text-lg">
                              {player.overall}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{player.name}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                  <Logo name={player.series} className="w-5 h-5" />
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{player.series}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• {player.position}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center justify-end gap-1 text-slate-800 font-black text-sm">
                              <DollarSign className="w-3 h-3 text-yellow-500" />
                              {(player.price || 1000000).toLocaleString()}
                            </div>
                            <button 
                              onClick={() => buyPlayer(player)}
                              disabled={league.money < (player.price || 1000000)}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              COMPRAR
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {league?.marketPlayers?.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <Search className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-slate-400 font-bold">Nenhum jogador disponível no momento.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
