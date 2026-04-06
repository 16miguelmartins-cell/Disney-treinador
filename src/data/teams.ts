import { Team, Player, Position } from '../types';

const calculatePrice = (overall: number) => {
  const base = (overall - 60) * 100000;
  const bonus = overall > 80 ? (overall - 80) * 200000 : 0;
  const random = Math.floor(Math.random() * 50000);
  return Math.max(100000, base + bonus + random);
};

const createPlayer = (name: string, overall: number, position: Position, series: string): Player => ({
  id: `${series}-${name}`.toLowerCase().replace(/\s+/g, '-'),
  name,
  overall,
  position,
  series,
  price: calculatePrice(overall)
});

export const TEAMS: Team[] = [
  {
    id: 'phineas-ferb',
    name: 'Phineas e Ferb',
    color: '#3b82f6', // Blue
    secondaryColor: '#fb923c', // Orange
    players: [
      createPlayer('Perry o Ornitorrinco', 82, 'GK', 'Phineas e Ferb'),
      createPlayer('Buford', 80, 'DF', 'Phineas e Ferb'),
      createPlayer('Ferb', 81, 'MF', 'Phineas e Ferb'),
      createPlayer('Phineas', 81, 'MF', 'Phineas e Ferb'),
      createPlayer('Isabella', 79, 'MF', 'Phineas e Ferb'),
      createPlayer('Candace', 78, 'FW', 'Phineas e Ferb'),
      createPlayer('Baljeet', 78, 'MF', 'Phineas e Ferb'),
      createPlayer('Dr. Doofenshmirtz', 76, 'FW', 'Phineas e Ferb'),
      createPlayer('Major Monograma', 75, 'DF', 'Phineas e Ferb'),
      createPlayer('Stacy', 74, 'DF', 'Phineas e Ferb'),
      createPlayer('Jeremy', 74, 'FW', 'Phineas e Ferb'),
      createPlayer('Vanessa', 77, 'MF', 'Phineas e Ferb'),
      createPlayer('Linda', 73, 'DF', 'Phineas e Ferb'),
      createPlayer('Lawrence', 72, 'DF', 'Phineas e Ferb'),
      createPlayer('Meap', 80, 'FW', 'Phineas e Ferb'),
      createPlayer('Norm', 78, 'GK', 'Phineas e Ferb'),
      createPlayer('Carl', 72, 'MF', 'Phineas e Ferb'),
      createPlayer('Monty Monograma', 76, 'DF', 'Phineas e Ferb'),
      createPlayer('Suzy Johnson', 71, 'FW', 'Phineas e Ferb'),
      createPlayer('Django Brown', 70, 'MF', 'Phineas e Ferb'),
    ]
  },
  {
    id: 'gravity-falls',
    name: 'Gravity Falls',
    color: '#166534', // Dark Green
    secondaryColor: '#fef08a', // Light Yellow
    players: [
      createPlayer('Bill Cipher', 82, 'FW', 'Gravity Falls'),
      createPlayer('Dipper Pines', 80, 'MF', 'Gravity Falls'),
      createPlayer('Mabel Pines', 80, 'MF', 'Gravity Falls'),
      createPlayer('Tio Stan', 79, 'GK', 'Gravity Falls'),
      createPlayer('Ford Pines', 81, 'DF', 'Gravity Falls'),
      createPlayer('Wendy', 80, 'MF', 'Gravity Falls'),
      createPlayer('Soos', 78, 'DF', 'Gravity Falls'),
      createPlayer('Gideon', 76, 'MF', 'Gravity Falls'),
      createPlayer('Pacifica', 75, 'FW', 'Gravity Falls'),
      createPlayer('Velho McGucket', 74, 'DF', 'Gravity Falls'),
      createPlayer('Robbie', 74, 'FW', 'Gravity Falls'),
      createPlayer('Candy', 73, 'MF', 'Gravity Falls'),
      createPlayer('Grenda', 78, 'DF', 'Gravity Falls'),
      createPlayer('Susan Preguiçosa', 71, 'GK', 'Gravity Falls'),
      createPlayer('Toby Determinado', 70, 'DF', 'Gravity Falls'),
      createPlayer('Xerife Blubs', 72, 'DF', 'Gravity Falls'),
      createPlayer('Oficial Durland', 72, 'DF', 'Gravity Falls'),
      createPlayer('Multi-Urso', 77, 'GK', 'Gravity Falls'),
      createPlayer('Rumble McSkirmish', 80, 'FW', 'Gravity Falls'),
      createPlayer('Gompers', 70, 'FW', 'Gravity Falls'),
    ]
  },
  {
    id: 'mickey-mouse',
    name: 'Mickey Mouse',
    color: '#000000',
    secondaryColor: '#ef4444',
    players: [
      createPlayer('Mickey', 82, 'MF', 'Mickey Mouse'),
      createPlayer('Pato Donald', 80, 'FW', 'Mickey Mouse'),
      createPlayer('Pateta', 79, 'GK', 'Mickey Mouse'),
      createPlayer('Minnie', 80, 'MF', 'Mickey Mouse'),
      createPlayer('Margarida', 78, 'FW', 'Mickey Mouse'),
      createPlayer('Pluto', 78, 'DF', 'Mickey Mouse'),
      createPlayer('Pete', 79, 'DF', 'Mickey Mouse'),
      createPlayer('Professor Ludovico', 77, 'MF', 'Mickey Mouse'),
      createPlayer('Max', 76, 'FW', 'Mickey Mouse'),
      createPlayer('Clarabela', 75, 'DF', 'Mickey Mouse'),
      createPlayer('Horácio', 74, 'DF', 'Mickey Mouse'),
      createPlayer('Tio Patinhas', 81, 'MF', 'Mickey Mouse'),
      createPlayer('Huguinho', 74, 'MF', 'Mickey Mouse'),
      createPlayer('Zezinho', 74, 'MF', 'Mickey Mouse'),
      createPlayer('Luisinho', 74, 'MF', 'Mickey Mouse'),
      createPlayer('Tico', 73, 'FW', 'Mickey Mouse'),
      createPlayer('Teco', 73, 'FW', 'Mickey Mouse'),
      createPlayer('Mortimer Mouse', 76, 'FW', 'Mickey Mouse'),
      createPlayer('Mancha Negra', 80, 'GK', 'Mickey Mouse'),
      createPlayer('Maga Patalógica', 78, 'MF', 'Mickey Mouse'),
    ]
  },
  {
    id: 'raven-home',
    name: 'A Raven Voltou',
    color: '#a855f7', // Purple
    secondaryColor: '#f472b6', // Pink
    players: [
      createPlayer('Raven Baxter', 82, 'MF', 'A Raven Voltou'),
      createPlayer('Chelsea Daniels', 80, 'GK', 'A Raven Voltou'),
      createPlayer('Booker Baxter', 80, 'FW', 'A Raven Voltou'),
      createPlayer('Nia Baxter', 79, 'MF', 'A Raven Voltou'),
      createPlayer('Levi Grayson', 78, 'MF', 'A Raven Voltou'),
      createPlayer('Tess', 80, 'DF', 'A Raven Voltou'),
      createPlayer('Victor Baxter', 76, 'DF', 'A Raven Voltou'),
      createPlayer('Cory Baxter', 78, 'MF', 'A Raven Voltou'),
      createPlayer('Eddie Thomas', 77, 'DF', 'A Raven Voltou'),
      createPlayer('Tanya Baxter', 75, 'DF', 'A Raven Voltou'),
      createPlayer('Alice', 74, 'FW', 'A Raven Voltou'),
      createPlayer('Ivy', 74, 'MF', 'A Raven Voltou'),
      createPlayer('Neil', 73, 'DF', 'A Raven Voltou'),
      createPlayer('Sienna', 72, 'FW', 'A Raven Voltou'),
      createPlayer('Alana', 76, 'DF', 'A Raven Voltou'),
      createPlayer('Muffy', 72, 'MF', 'A Raven Voltou'),
      createPlayer('Loca', 71, 'DF', 'A Raven Voltou'),
      createPlayer('Devon Carter', 77, 'FW', 'A Raven Voltou'),
      createPlayer('Stanley', 70, 'MF', 'A Raven Voltou'),
      createPlayer('William', 70, 'GK', 'A Raven Voltou'),
    ]
  },
  {
    id: 'jessie',
    name: 'Jessie',
    color: '#f87171', // Red/Pink
    secondaryColor: '#60a5fa', // Blue
    players: [
      createPlayer('Jessie Prescott', 82, 'MF', 'Jessie'),
      createPlayer('Emma Ross', 79, 'FW', 'Jessie'),
      createPlayer('Luke Ross', 80, 'FW', 'Jessie'),
      createPlayer('Ravi Ross', 80, 'MF', 'Jessie'),
      createPlayer('Zuri Ross', 78, 'MF', 'Jessie'),
      createPlayer('Bertram Winkle', 78, 'GK', 'Jessie'),
      createPlayer('Tony Chiccolini', 77, 'DF', 'Jessie'),
      createPlayer('Sra. Kipling', 81, 'DF', 'Jessie'),
      createPlayer('Morgan Ross', 75, 'DF', 'Jessie'),
      createPlayer('Christina Ross', 75, 'DF', 'Jessie'),
      createPlayer('Rhoda Chesterfield', 74, 'DF', 'Jessie'),
      createPlayer('Stuart Wooten', 73, 'MF', 'Jessie'),
      createPlayer('Connie Thompson', 76, 'FW', 'Jessie'),
      createPlayer('Brooks Wentworth', 74, 'FW', 'Jessie'),
      createPlayer('Darla Shannon', 72, 'MF', 'Jessie'),
      createPlayer('Agatha', 72, 'DF', 'Jessie'),
      createPlayer('Petey', 71, 'GK', 'Jessie'),
      createPlayer('Hudson', 70, 'MF', 'Jessie'),
      createPlayer('Maybelle', 70, 'FW', 'Jessie'),
      createPlayer('Bryn', 71, 'DF', 'Jessie'),
    ]
  },
  {
    id: 'kc-undercover',
    name: 'KC Agente Secreta',
    color: '#1f2937', // Dark Gray
    secondaryColor: '#fbbf24', // Amber
    players: [
      createPlayer('K.C. Cooper', 82, 'FW', 'KC Agente Secreta'),
      createPlayer('Ernie Cooper', 79, 'MF', 'KC Agente Secreta'),
      createPlayer('Judy Cooper', 80, 'GK', 'KC Agente Secreta'),
      createPlayer('Kira Cooper', 80, 'DF', 'KC Agente Secreta'),
      createPlayer('Craig Cooper', 80, 'DF', 'KC Agente Secreta'),
      createPlayer('Marisa Clark', 78, 'MF', 'KC Agente Secreta'),
      createPlayer('Brett Willis', 79, 'FW', 'KC Agente Secreta'),
      createPlayer('Zane', 78, 'DF', 'KC Agente Secreta'),
      createPlayer('Agente Johnson', 76, 'MF', 'KC Agente Secreta'),
      createPlayer('Darien', 75, 'FW', 'KC Agente Secreta'),
      createPlayer('Petey Goldfeder', 73, 'DF', 'KC Agente Secreta'),
      createPlayer('Beverly', 74, 'MF', 'KC Agente Secreta'),
      createPlayer('Bernice', 74, 'DF', 'KC Agente Secreta'),
      createPlayer('Juliette', 76, 'FW', 'KC Agente Secreta'),
      createPlayer('Abby Martin', 77, 'MF', 'KC Agente Secreta'),
      createPlayer('A Máscara', 78, 'GK', 'KC Agente Secreta'),
      createPlayer('Brady', 72, 'DF', 'KC Agente Secreta'),
      createPlayer('Lincoln', 72, 'MF', 'KC Agente Secreta'),
      createPlayer('Sra. Goldfeder', 70, 'DF', 'KC Agente Secreta'),
      createPlayer('Reese', 71, 'FW', 'KC Agente Secreta'),
    ]
  },
  {
    id: 'star-forces-evil',
    name: 'Star contra as Forças do Mal',
    color: '#ec4899', // Pink
    secondaryColor: '#8b5cf6', // Violet
    players: [
      createPlayer('Star Butterfly', 82, 'FW', 'Star contra as Forças do Mal'),
      createPlayer('Marco Diaz', 81, 'MF', 'Star contra as Forças do Mal'),
      createPlayer('Ludo', 76, 'FW', 'Star contra as Forças do Mal'),
      createPlayer('Toffee', 80, 'DF', 'Star contra as Forças do Mal'),
      createPlayer('Cabeça de Ponei', 78, 'MF', 'Star contra as Forças do Mal'),
      createPlayer('Tom Lucitor', 80, 'MF', 'Star contra as Forças do Mal'),
      createPlayer('Eclipsa Butterfly', 81, 'MF', 'Star contra as Forças do Mal'),
      createPlayer('Rainha Moon Butterfly', 80, 'GK', 'Star contra as Forças do Mal'),
      createPlayer('Rei River Butterfly', 79, 'DF', 'Star contra as Forças do Mal'),
      createPlayer('Glossaryck', 82, 'GK', 'Star contra as Forças do Mal'),
      createPlayer('Jackie Lynn Thomas', 75, 'DF', 'Star contra as Forças do Mal'),
      createPlayer('Janna Ordonia', 77, 'MF', 'Star contra as Forças do Mal'),
      createPlayer('Kelly', 78, 'FW', 'Star contra as Forças do Mal'),
      createPlayer('Hekapoo', 80, 'MF', 'Star contra as Forças do Mal'),
      createPlayer('Omnitraxus Prime', 79, 'DF', 'Star contra as Forças do Mal'),
      createPlayer('Lekmet', 78, 'DF', 'Star contra as Forças do Mal'),
      createPlayer('Rhombulus', 78, 'DF', 'Star contra as Forças do Mal'),
      createPlayer('Meteora Butterfly', 80, 'FW', 'Star contra as Forças do Mal'),
      createPlayer('Sapo Musculado', 78, 'GK', 'Star contra as Forças do Mal'),
      createPlayer('Aranha de Cartola', 73, 'MF', 'Star contra as Forças do Mal'),
    ]
  },
  {
    id: 'bunkd',
    name: 'Acampamento Kikiwaka',
    color: '#854d0e', // Brown
    secondaryColor: '#22c55e', // Green
    players: [
      createPlayer('Lou Hockhauser', 81, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Emma Ross', 79, 'FW', 'Acampamento Kikiwaka'),
      createPlayer('Ravi Ross', 80, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Zuri Ross', 78, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Xander McCormick', 79, 'GK', 'Acampamento Kikiwaka'),
      createPlayer('Jorge Ramirez', 76, 'DF', 'Acampamento Kikiwaka'),
      createPlayer('Tiffany Chen', 78, 'DF', 'Acampamento Kikiwaka'),
      createPlayer('Destiny Baker', 77, 'FW', 'Acampamento Kikiwaka'),
      createPlayer('Finn Sawyer', 75, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Matteo Silva', 76, 'DF', 'Acampamento Kikiwaka'),
      createPlayer('Ava', 75, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Noah', 74, 'FW', 'Acampamento Kikiwaka'),
      createPlayer('Gwen', 75, 'DF', 'Acampamento Kikiwaka'),
      createPlayer('Parker Preston', 73, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Billie Mather', 73, 'FW', 'Acampamento Kikiwaka'),
      createPlayer('Winnie Weber', 72, 'DF', 'Acampamento Kikiwaka'),
      createPlayer('Jake', 72, 'MF', 'Acampamento Kikiwaka'),
      createPlayer('Gladys', 71, 'GK', 'Acampamento Kikiwaka'),
      createPlayer('Hazel Swearengen', 75, 'FW', 'Acampamento Kikiwaka'),
      createPlayer('Murphy', 70, 'DF', 'Acampamento Kikiwaka'),
    ]
  },
  {
    id: 'stuck-middle',
    name: 'A Irmã do Meio',
    color: '#0ea5e9', // Sky Blue
    secondaryColor: '#fde047', // Yellow
    players: [
      createPlayer('Harley Diaz', 82, 'MF', 'A Irmã do Meio'),
      createPlayer('Rachel Diaz', 79, 'FW', 'A Irmã do Meio'),
      createPlayer('Georgie Diaz', 80, 'DF', 'A Irmã do Meio'),
      createPlayer('Ethan Diaz', 80, 'MF', 'A Irmã do Meio'),
      createPlayer('Danny Diaz', 78, 'GK', 'A Irmã do Meio'),
      createPlayer('Mace Diaz', 78, 'MF', 'A Irmã do Meio'),
      createPlayer('Daphne Diaz', 79, 'FW', 'A Irmã do Meio'),
      createPlayer('Suzy Diaz', 76, 'DF', 'A Irmã do Meio'),
      createPlayer('Tom Diaz', 76, 'DF', 'A Irmã do Meio'),
      createPlayer('Cuff', 73, 'FW', 'A Irmã do Meio'),
      createPlayer('Bethany Peters', 74, 'DF', 'A Irmã do Meio'),
      createPlayer('Ellie Peters', 74, 'MF', 'A Irmã do Meio'),
      createPlayer('Aidan', 72, 'MF', 'A Irmã do Meio'),
      createPlayer('Phil', 72, 'DF', 'A Irmã do Meio'),
      createPlayer('Abuela', 75, 'GK', 'A Irmã do Meio'),
      createPlayer('Becky', 71, 'MF', 'A Irmã do Meio'),
      createPlayer('Wyatt', 70, 'FW', 'A Irmã do Meio'),
      createPlayer('Link', 70, 'DF', 'A Irmã do Meio'),
      createPlayer('Malachi', 71, 'MF', 'A Irmã do Meio'),
      createPlayer('Zander', 70, 'FW', 'A Irmã do Meio'),
    ]
  },
  {
    id: 'big-city-greens',
    name: 'Os Green na Cidade Grande',
    color: '#22c55e', // Green
    secondaryColor: '#facc15', // Yellow
    players: [
      createPlayer('Cricket Green', 82, 'FW', 'Os Green na Cidade Grande'),
      createPlayer('Tilly Green', 81, 'MF', 'Os Green na Cidade Grande'),
      createPlayer('Bill Green', 79, 'GK', 'Os Green na Cidade Grande'),
      createPlayer('Alice Green', 80, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Nancy Green', 78, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Remy Remington', 78, 'MF', 'Os Green na Cidade Grande'),
      createPlayer('Gloria Sato', 77, 'MF', 'Os Green na Cidade Grande'),
      createPlayer('Vasquez', 80, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Oficial Keys', 75, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Chip Whistler', 76, 'FW', 'Os Green na Cidade Grande'),
      createPlayer('Andromeda', 74, 'MF', 'Os Green na Cidade Grande'),
      createPlayer('Phoenix', 73, 'FW', 'Os Green na Cidade Grande'),
      createPlayer('Gregly', 72, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Val', 74, 'MF', 'Os Green na Cidade Grande'),
      createPlayer('Skyler', 72, 'FW', 'Os Green na Cidade Grande'),
      createPlayer('Sr. Remington', 71, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Sra. Remington', 71, 'DF', 'Os Green na Cidade Grande'),
      createPlayer('Community Sue', 76, 'GK', 'Os Green na Cidade Grande'),
      createPlayer('Gwendolyn Zapp', 78, 'MF', 'Os Green na Cidade Grande'),
      createPlayer('Benny', 70, 'MF', 'Os Green na Cidade Grande'),
    ]
  },
  {
    id: 'amphibia',
    name: 'Amphibilandia',
    color: '#15803d', // Green
    secondaryColor: '#fdf4ff', // Light Pink
    players: [
      createPlayer('Anne Boonchuy', 82, 'MF', 'Amphibilandia'),
      createPlayer('Sprig Plantar', 80, 'FW', 'Amphibilandia'),
      createPlayer('Polly Plantar', 79, 'FW', 'Amphibilandia'),
      createPlayer('Hop Pop', 78, 'GK', 'Amphibilandia'),
      createPlayer('Sasha Waybright', 81, 'DF', 'Amphibilandia'),
      createPlayer('Marcy Wu', 81, 'MF', 'Amphibilandia'),
      createPlayer('Rei Andrias', 80, 'DF', 'Amphibilandia'),
      createPlayer('General Yunan', 80, 'DF', 'Amphibilandia'),
      createPlayer('Lady Olivia', 78, 'MF', 'Amphibilandia'),
      createPlayer('Grime', 79, 'DF', 'Amphibilandia'),
      createPlayer('Frobo', 78, 'GK', 'Amphibilandia'),
      createPlayer('Ivy Sundew', 76, 'MF', 'Amphibilandia'),
      createPlayer('Maddie Flour', 75, 'MF', 'Amphibilandia'),
      createPlayer('Toadie', 71, 'DF', 'Amphibilandia'),
      createPlayer('Presidente Toadstool', 72, 'DF', 'Amphibilandia'),
      createPlayer('Wally', 74, 'MF', 'Amphibilandia'),
      createPlayer('Sra. Croaker', 75, 'DF', 'Amphibilandia'),
      createPlayer('Bessie', 73, 'GK', 'Amphibilandia'),
      createPlayer('MicroAngelo', 70, 'MF', 'Amphibilandia'),
      createPlayer('Valeriana', 77, 'MF', 'Amphibilandia'),
    ]
  },
  {
    id: 'miraculous',
    name: 'Miraculous',
    color: '#ef4444', // Red
    secondaryColor: '#000000', // Black
    players: [
      createPlayer('Ladybug', 82, 'FW', 'Miraculous'),
      createPlayer('Gato Noir', 81, 'FW', 'Miraculous'),
      createPlayer('Rena Rouge', 80, 'MF', 'Miraculous'),
      createPlayer('Carapaça', 80, 'DF', 'Miraculous'),
      createPlayer('Queen Bee', 79, 'MF', 'Miraculous'),
      createPlayer('Falcão Traça', 81, 'GK', 'Miraculous'),
      createPlayer('Mayura', 80, 'MF', 'Miraculous'),
      createPlayer('Viperion', 78, 'MF', 'Miraculous'),
      createPlayer('Ryuko', 79, 'MF', 'Miraculous'),
      createPlayer('Pegasus', 78, 'DF', 'Miraculous'),
      createPlayer('Rei Macaco', 78, 'DF', 'Miraculous'),
      createPlayer('Bunnix', 80, 'MF', 'Miraculous'),
      createPlayer('Multimouse', 77, 'MF', 'Miraculous'),
      createPlayer('Marinette Dupain-Cheng', 76, 'MF', 'Miraculous'),
      createPlayer('Adrien Agreste', 76, 'FW', 'Miraculous'),
      createPlayer('Alya Césaire', 75, 'DF', 'Miraculous'),
      createPlayer('Nino Lahiffe', 74, 'DF', 'Miraculous'),
      createPlayer('Chloé Bourgeois', 74, 'FW', 'Miraculous'),
      createPlayer('Lila Rossi', 75, 'MF', 'Miraculous'),
      createPlayer('Mestre Fu', 80, 'GK', 'Miraculous'),
    ]
  }
];

export const MARKET_POOL: Player[] = [
  createPlayer('Kim Possible', 75, 'FW', 'Kim Possible'),
  createPlayer('Ron Stoppable', 72, 'MF', 'Kim Possible'),
  createPlayer('Shego', 76, 'FW', 'Kim Possible'),
  createPlayer('Ben 10', 78, 'MF', 'Ben 10'),
  createPlayer('Gwen Tennyson', 75, 'MF', 'Ben 10'),
  createPlayer('Jake Long', 77, 'FW', 'Jake Long'),
  createPlayer('Randy Cunningham', 76, 'MF', 'Randy Cunningham'),
  createPlayer('Penn Zero', 74, 'FW', 'Penn Zero'),
  // Extra characters from the requested series
  createPlayer('Buford Van Stomm', 74, 'DF', 'Phineas e Ferb'),
  createPlayer('Baljeet Tjinder', 73, 'MF', 'Phineas e Ferb'),
  createPlayer('Stacy Hirano', 72, 'MF', 'Phineas e Ferb'),
  createPlayer('Ravi Ross (Versão Jovem)', 71, 'MF', 'Jessie'),
  createPlayer('Bertram Winkle', 70, 'GK', 'Jessie'),
  createPlayer('Gideão Alegria', 72, 'MF', 'Gravity Falls'),
  createPlayer('Robbie Valentino', 73, 'FW', 'Gravity Falls'),
  createPlayer('Bafo de Onça', 74, 'DF', 'Mickey Mouse'),
  createPlayer('Clarabela', 71, 'MF', 'Mickey Mouse'),
  createPlayer('Marisa Miller', 73, 'DF', 'KC Agente Secreta'),
  createPlayer('Ernie Cooper', 72, 'MF', 'KC Agente Secreta'),
  createPlayer('Tom Star', 75, 'FW', 'Star contra as Forças do Mal'),
  createPlayer('Ludo', 71, 'MF', 'Star contra as Forças do Mal'),
  createPlayer('Cuff Diaz', 70, 'DF', 'A Irmã do Meio'),
  createPlayer('Bethany Peters', 71, 'MF', 'A Irmã do Meio'),
  createPlayer('Grime (Versão Jovem)', 73, 'DF', 'Amphibilandia'),
  createPlayer('Toadie', 70, 'MF', 'Amphibilandia'),
  createPlayer('Lila Rossi', 74, 'MF', 'Miraculous'),
  createPlayer('Sabrina Raincomprix', 71, 'DF', 'Miraculous'),
];
