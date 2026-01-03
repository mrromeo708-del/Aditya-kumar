
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GameState, Card, LevelConfig } from './types';
import { CARD_ITEMS, getLevelConfig, COLORS } from './constants';
import { audioService } from './services/audioService';

const StarIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={`${className} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Celebration Confetti Component
const Confetti = () => {
  const particles = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFD93D', '#6BCB77', '#4D96FF'];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: `${3 + Math.random() * 2}s`
    }));
  }, []);

  return (
    <>
      {particles.map(p => (
        <div 
          key={p.id} 
          className="confetti" 
          style={{ 
            left: p.left, 
            backgroundColor: p.color, 
            animationDelay: p.delay,
            animationDuration: p.duration
          }} 
        />
      ))}
    </>
  );
};

// Victory Balloons Overlay Component
const VictoryBalloons = () => {
  const balloons = useMemo(() => {
    const symbols = ['🎈', '🎈', '🎈', '🎉', '✨', '🎈'];
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 4}s`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {balloons.map(b => (
        <div 
          key={b.id} 
          className="balloon" 
          style={{ 
            left: b.left, 
            animationDelay: b.delay
          }}
        >
          {b.symbol}
        </div>
      ))}
    </div>
  );
};

// Interaction states for the card board
type InteractionState = 'IDLE' | 'PROCESSING_MATCH' | 'PROCESSING_MISMATCH';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => {
    const saved = localStorage.getItem('maxUnlockedLevel');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [interactionState, setInteractionState] = useState<InteractionState>('IDLE');
  const [moves, setMoves] = useState(0);

  const levelConfig = getLevelConfig(currentLevel);
  const matchedPairs = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;
  const progressPercentage = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  // Sync background state with gameState
  useEffect(() => {
    const scenery = document.getElementById('scenery');
    if (gameState === 'VICTORY') {
      scenery?.classList.add('victory-active');
    } else {
      scenery?.classList.remove('victory-active');
    }

    if (gameState === 'PLAYING') {
      audioService.startBGM();
    } else {
      audioService.stopBGM();
    }
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('maxUnlockedLevel', maxUnlockedLevel.toString());
  }, [maxUnlockedLevel]);

  const initLevel = useCallback((level: number) => {
    const config = getLevelConfig(level);
    const shuffledItems = [...CARD_ITEMS].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledItems.slice(0, config.pairs);
    
    const gameCards: Card[] = [...selectedItems, ...selectedItems]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        ...item,
        id: index,
        isFlipped: false,
        isMatched: false
      }));

    setCards(gameCards);
    setFlippedIndices([]);
    setInteractionState('IDLE');
    setMoves(0);
    setCurrentLevel(level);
    setGameState('PLAYING');
  }, []);

  // Handle the side effects of flipping two cards
  useEffect(() => {
    if (flippedIndices.length === 2 && interactionState === 'IDLE') {
      const [firstIdx, secondIdx] = flippedIndices;
      setMoves(prev => prev + 1);

      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        handleMatch(firstIdx, secondIdx);
      } else {
        handleMismatch();
      }
    }
  }, [flippedIndices, interactionState, cards]);

  const handleMatch = async (firstIdx: number, secondIdx: number) => {
    setInteractionState('PROCESSING_MATCH');
    
    // Faster match processing (200ms instead of 400ms)
    setTimeout(() => {
      audioService.playMatch();
      const updatedCards = cards.map((card, idx) => 
        idx === firstIdx || idx === secondIdx ? { ...card, isMatched: true } : card
      );
      setCards(updatedCards);
      
      setFlippedIndices([]);
      setInteractionState('IDLE');

      // Instant check for victory
      if (updatedCards.every(c => c.isMatched)) {
        if (currentLevel === maxUnlockedLevel && maxUnlockedLevel < 100) {
          setMaxUnlockedLevel(prev => prev + 1);
        }
        // Shorter delay for victory animation (400ms instead of 800ms)
        setTimeout(() => {
          audioService.playVictory();
          setGameState('VICTORY');
        }, 400);
      }
    }, 200);
  };

  const handleMismatch = () => {
    setInteractionState('PROCESSING_MISMATCH');
    // Faster flip back (600ms instead of 1000ms)
    setTimeout(() => {
      audioService.playMismatch();
      setFlippedIndices([]);
      setInteractionState('IDLE');
    }, 600);
  };

  const handleCardClick = (index: number) => {
    if (
      interactionState !== 'IDLE' || 
      flippedIndices.length >= 2 || 
      cards[index].isMatched || 
      flippedIndices.includes(index)
    ) return;

    audioService.playFlip();
    setFlippedIndices(prev => [...prev, index]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative select-none">
      {gameState === 'START' && (
        <div className="text-center z-10 animate-fade-in max-w-lg bg-white/40 p-10 rounded-[3rem] backdrop-blur-md border-4 border-white/50 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-[#FF6B6B] animate-bounce-slow">
              <span className="text-6xl">🧠</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-kids text-[#2F3061] mb-4 drop-shadow-sm">
            Magic <span className="text-[#FF6B6B]">Memory</span>
          </h1>
          <p className="text-[#4ECDC4] font-bold text-xl mb-12 italic drop-shadow-sm bg-white/60 py-2 rounded-full">Can you unlock all 100 levels?</p>
          
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => {
                audioService.playFlip();
                setGameState('LEVEL_SELECT');
              }}
              className="group relative inline-flex items-center justify-center px-12 py-6 font-kids text-3xl tracking-tighter text-white bg-[#FF6B6B] rounded-full overflow-hidden transition-all duration-300 hover:bg-[#ff8585] shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 animate-pulse-bright"
            >
              <span className="relative">START ADVENTURE!</span>
            </button>
            <p className="text-[#2F3061] font-bold bg-white/60 px-6 py-1 rounded-full shadow-sm">Level {maxUnlockedLevel} Reached!</p>
          </div>
        </div>
      )}

      {gameState === 'LEVEL_SELECT' && (
        <div className="z-10 animate-fade-in w-full max-w-3xl bg-white/60 p-8 rounded-[3rem] backdrop-blur-md shadow-2xl border-4 border-white/50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-kids text-[#2F3061]">Select Level</h2>
            <button onClick={() => setGameState('START')} className="px-4 py-2 bg-white rounded-full text-sm font-bold text-gray-500 hover:text-[#FF6B6B] shadow-sm transition-all">Back</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3 max-h-[60vh] overflow-y-auto p-4 bg-white/30 rounded-3xl shadow-inner custom-scrollbar">
            {Array.from({ length: 100 }, (_, i) => i + 1).map(lv => {
              const isLocked = lv > maxUnlockedLevel;
              return (
                <button
                  key={lv}
                  disabled={isLocked}
                  onClick={() => {
                    audioService.playFlip();
                    initLevel(lv);
                  }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl font-bold transition-all transform hover:scale-110 active:scale-95 ${
                    isLocked 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-[#4ECDC4] text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <span className="text-xs">{isLocked ? '🔒' : lv}</span>
                  {!isLocked && lv < maxUnlockedLevel && <span className="text-[10px]">⭐</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full max-w-4xl z-10 flex flex-col h-full animate-fade-in">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between items-center bg-white/80 p-4 rounded-3xl shadow-lg backdrop-blur-sm border-2 border-white">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase">Level</span>
                <span className="text-3xl font-kids text-[#2F3061]">{currentLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="w-6 h-6" />
                <span className="text-xl font-bold text-[#2F3061]">{moves} Moves</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-[#4ECDC4] uppercase">Progress</span>
                <span className="text-lg font-kids text-[#2F3061]">{matchedPairs} / {totalPairs} Pairs</span>
              </div>
              <button onClick={() => setGameState('LEVEL_SELECT')} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-400 hover:text-[#FF6B6B] transition-colors ml-4 shadow-sm">Quit</button>
            </div>
            
            <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden shadow-inner border border-white">
              <div 
                className="h-full bg-[#4ECDC4] transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className={`grid ${levelConfig.cols} gap-4 px-2 perspective-1000`}>
            {cards.map((card, idx) => {
              const isFlipped = card.isMatched || flippedIndices.includes(idx);
              return (
                <div 
                  key={card.id} 
                  onClick={() => handleCardClick(idx)} 
                  className={`card-container aspect-square cursor-pointer transition-transform ${isFlipped ? 'flipped' : ''}`}
                >
                  <div className={`card-inner ${card.isMatched ? 'animate-match-pop' : ''}`}>
                    <div className="card-front bg-white shadow-xl border-4 border-[#4ECDC4] flex items-center justify-center text-4xl">
                      <span className="text-[#4ECDC4] font-kids opacity-40 select-none">?</span>
                    </div>
                    <div className={`card-back bg-white shadow-xl border-4 ${card.isMatched ? 'border-yellow-400' : 'border-[#FF6B6B]'} flex flex-col items-center justify-center p-2`}>
                      <span className={`text-4xl md:text-5xl lg:text-6xl transition-transform duration-300 ${card.isMatched ? 'scale-110' : ''}`}>
                        {card.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'VICTORY' && (
        <div className="text-center z-10 animate-fade-in relative bg-white/70 p-12 rounded-[4rem] backdrop-blur-md shadow-2xl border-4 border-white/60">
          <Confetti />
          <VictoryBalloons />
          <div className="text-9xl mb-6 drop-shadow-2xl animate-bounce-slow">🏆</div>
          <h2 className="text-5xl font-kids text-[#2F3061] mb-2 drop-shadow-sm">Level {currentLevel} Cleared!</h2>
          <p className="text-2xl text-[#2F3061] mb-8 font-bold bg-white/60 py-2 rounded-full inline-block px-8 border border-white/50">You are a Memory Wizard! ✨</p>
          <div className="flex flex-col gap-4 items-center">
            {currentLevel < 100 && (
              <button 
                onClick={() => {
                  audioService.playFlip();
                  initLevel(currentLevel + 1);
                }} 
                className="px-12 py-4 bg-[#FF6B6B] text-white font-kids text-2xl rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all animate-pulse-bright"
              >
                NEXT LEVEL 🚀
              </button>
            )}
            <button 
              onClick={() => {
                audioService.playFlip();
                initLevel(currentLevel);
              }} 
              className="px-10 py-3 bg-[#4ECDC4] text-white font-kids text-xl rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              REPLAY LEVEL 🔄
            </button>
            <button 
              onClick={() => {
                audioService.playFlip();
                setGameState('LEVEL_SELECT');
              }} 
              className="px-8 py-2 text-[#2F3061] font-bold hover:text-[#FF6B6B] transition-colors"
            >
              GO TO LEVELS MENU
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-white font-bold text-sm pointer-events-none text-center px-4 drop-shadow-md">
        Level {currentLevel} - Keep going! 🌟
      </div>
    </div>
  );
}
