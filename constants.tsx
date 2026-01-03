
import { LevelConfig } from './types';

export const CARD_ITEMS = [
  // Animals
  { symbol: '🐶', name: 'Puppy', category: 'Animals' },
  { symbol: '🐱', name: 'Kitty', category: 'Animals' },
  { symbol: '🦁', name: 'Lion', category: 'Animals' },
  { symbol: '🐘', name: 'Elephant', category: 'Animals' },
  { symbol: '🦒', name: 'Giraffe', category: 'Animals' },
  { symbol: '🐵', name: 'Monkey', category: 'Animals' },
  { symbol: '🐰', name: 'Rabbit', category: 'Animals' },
  { symbol: '🦊', name: 'Fox', category: 'Animals' },
  { symbol: '🐻', name: 'Bear', category: 'Animals' },
  { symbol: '🐼', name: 'Panda', category: 'Animals' },
  { symbol: '🐸', name: 'Frog', category: 'Animals' },
  { symbol: '🐷', name: 'Pig', category: 'Animals' },
  { symbol: '🐙', name: 'Octopus', category: 'Animals' },
  { symbol: '🐢', name: 'Turtle', category: 'Animals' },
  { symbol: '🐝', name: 'Bee', category: 'Animals' },
  { symbol: '🦋', name: 'Butterfly', category: 'Animals' },
  // Fruits & Food
  { symbol: '🍎', name: 'Apple', category: 'Food' },
  { symbol: '🍌', name: 'Banana', category: 'Food' },
  { symbol: '🍓', name: 'Strawberry', category: 'Food' },
  { symbol: '🍇', name: 'Grapes', category: 'Food' },
  { symbol: '🍉', name: 'Watermelon', category: 'Food' },
  { symbol: '🍍', name: 'Pineapple', category: 'Food' },
  { symbol: '🍒', name: 'Cherry', category: 'Food' },
  { symbol: '🥑', name: 'Avocado', category: 'Food' },
  { symbol: '🍕', name: 'Pizza', category: 'Food' },
  { symbol: '🍔', name: 'Burger', category: 'Food' },
  { symbol: '🍟', name: 'Fries', category: 'Food' },
  { symbol: '🍦', name: 'Ice Cream', category: 'Food' },
  { symbol: '🍩', name: 'Donut', category: 'Food' },
  { symbol: '🍪', name: 'Cookie', category: 'Food' },
  { symbol: '🍰', name: 'Cake', category: 'Food' },
  // Objects & Vehicles
  { symbol: '🚗', name: 'Car', category: 'Vehicles' },
  { symbol: '🚀', name: 'Rocket', category: 'Vehicles' },
  { symbol: '✈️', name: 'Airplane', category: 'Vehicles' },
  { symbol: '🚂', name: 'Train', category: 'Vehicles' },
  { symbol: '🚁', name: 'Helicopter', category: 'Vehicles' },
  { symbol: '🚢', name: 'Ship', category: 'Vehicles' },
  { symbol: '🚲', name: 'Bicycle', category: 'Vehicles' },
  { symbol: '🎨', name: 'Palette', category: 'Art' },
  { symbol: '🎸', name: 'Guitar', category: 'Music' },
  { symbol: '🎹', name: 'Piano', category: 'Music' },
  { symbol: '🎺', name: 'Trumpet', category: 'Music' },
  { symbol: '⚽', name: 'Soccer Ball', category: 'Sports' },
  { symbol: '🏀', name: 'Basketball', category: 'Sports' },
  { symbol: '🎾', name: 'Tennis', category: 'Sports' },
  { symbol: '🧩', name: 'Puzzle', category: 'Games' },
  { symbol: '🎮', name: 'Video Game', category: 'Games' },
  { symbol: '🧸', name: 'Teddy Bear', category: 'Toys' },
  { symbol: '🎁', name: 'Gift', category: 'Celebration' },
  { symbol: '🎈', name: 'Balloon', category: 'Celebration' },
  { symbol: '🌟', name: 'Star', category: 'Nature' },
  { symbol: '🌈', name: 'Rainbow', category: 'Nature' },
  { symbol: '☀️', name: 'Sun', category: 'Nature' },
  { symbol: '🌙', name: 'Moon', category: 'Nature' },
  { symbol: '☁️', name: 'Cloud', category: 'Nature' },
  { symbol: '❄️', name: 'Snowflake', category: 'Nature' },
  { symbol: '🔥', name: 'Fire', category: 'Nature' },
  { symbol: '🌵', name: 'Cactus', category: 'Nature' },
  { symbol: '🌴', name: 'Palm Tree', category: 'Nature' },
  { symbol: '🌻', name: 'Sunflower', category: 'Nature' },
];

export const getLevelConfig = (level: number): LevelConfig => {
  // Logic: 
  // Lv 1-5: 2 pairs
  // Lv 6-15: 4 pairs
  // Lv 16-30: 6 pairs
  // Lv 31-50: 8 pairs
  // Lv 51-75: 12 pairs
  // Lv 76-100: 16-20 pairs
  let pairs = 2;
  let cols = 'grid-cols-2';

  if (level > 90) { pairs = 20; cols = 'grid-cols-4 md:grid-cols-5'; }
  else if (level > 75) { pairs = 16; cols = 'grid-cols-4'; }
  else if (level > 50) { pairs = 12; cols = 'grid-cols-3 md:grid-cols-4'; }
  else if (level > 30) { pairs = 8; cols = 'grid-cols-4'; }
  else if (level > 15) { pairs = 6; cols = 'grid-cols-3 md:grid-cols-4'; }
  else if (level > 5) { pairs = 4; cols = 'grid-cols-2 md:grid-cols-4'; }
  else { pairs = 2; cols = 'grid-cols-2'; }

  return { level, pairs, cols };
};

export const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#F7FFF7',
  text: '#2F3061'
};
