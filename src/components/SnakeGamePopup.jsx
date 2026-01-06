import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

const SnakeGamePopup = ({ isOpen, onClose, isDarkMode }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gameLoopRef = useRef(null);
  const directionRef = useRef(direction);
  const canvasRef = useRef(null);

  const theme = isDarkMode ? {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    snakeHead: '#4ECDC4',
    snakeBody: '#3BA99C',
    food: '#FF6B6B',
    grid: 'rgba(255,255,255,0.03)',
  } : {
    bg: '#ffffff',
    surface: '#f5f5f7',
    border: 'rgba(0,0,0,0.1)',
    text: '#1d1d1f',
    textMuted: '#86868b',
    accent: '#C4785A',
    snakeHead: '#4ECDC4',
    snakeBody: '#3BA99C',
    food: '#FF6B6B',
    grid: 'rgba(0,0,0,0.03)',
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
      const savedHighScore = localStorage.getItem('snake_high_score');
      if (savedHighScore) setHighScore(parseInt(savedHighScore));
      const savedName = localStorage.getItem('snake_player_name');
      if (savedName) setPlayerName(savedName);
    }
  }, [isOpen]);

  // Reset game when popup closes
  useEffect(() => {
    if (!isOpen) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      setGameState('idle');
      setSnake([{ x: 10, y: 10 }]);
      setDirection({ x: 0, y: 0 });
      directionRef.current = { x: 0, y: 0 };
      setScore(0);
      setSpeed(INITIAL_SPEED);
      setShowNameInput(false);
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('snake_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.log('Error loading leaderboard:', error);
    }
  };

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 0, y: 0 });
    directionRef.current = { x: 0, y: 0 };
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState('idle');
    setShowNameInput(false);
  }, [generateFood]);

  const startGame = useCallback(() => {
    if (gameState === 'idle' || gameState === 'gameover') {
      resetGame();
      setGameState('playing');
      setDirection({ x: 1, y: 0 });
      directionRef.current = { x: 1, y: 0 };
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState, resetGame]);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      pauseGame();
    } else if (gameState === 'paused' || gameState === 'idle') {
      startGame();
    }
  }, [gameState, pauseGame, startGame]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;

        if (currentDir.x === 0 && currentDir.y === 0) return prevSnake;

        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameState('gameover');
          setShowNameInput(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameState('gameover');
          setShowNameInput(true);
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prev => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snake_high_score', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, speed, food, generateFood, highScore]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'p', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === ' ') {
        togglePause();
        return;
      }

      if (gameState !== 'playing') return;

      const currentDir = directionRef.current;
      let newDir = { ...currentDir };

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (currentDir.y !== 1) newDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (currentDir.y !== -1) newDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (currentDir.x !== 1) newDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (currentDir.x !== -1) newDir = { x: 1, y: 0 };
          break;
        default:
          break;
      }

      if (newDir.x !== currentDir.x || newDir.y !== currentDir.y) {
        directionRef.current = newDir;
        setDirection(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState, togglePause]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasSize = GRID_SIZE * CELL_SIZE;

    ctx.fillStyle = theme.surface;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvasSize, i * CELL_SIZE);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = theme.food;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? theme.snakeHead : theme.snakeBody;
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        index === 0 ? 6 : 4
      );
      ctx.fill();
    });
  }, [snake, food, theme]);

  const submitScore = async () => {
    if (!playerName.trim() || score === 0) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem('snake_player_name', playerName.trim());
      const { error } = await supabase.from('snake_scores').insert([{
        player_name: playerName.trim(),
        score: score,
      }]);
      if (error) throw error;
      await loadLeaderboard();
      setShowNameInput(false);
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Touch controls
  const touchStartRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (gameState !== 'playing') {
      togglePause();
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    const currentDir = directionRef.current;
    let newDir = { ...currentDir };

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && currentDir.x !== -1) newDir = { x: 1, y: 0 };
      else if (dx < 0 && currentDir.x !== 1) newDir = { x: -1, y: 0 };
    } else {
      if (dy > 0 && currentDir.y !== -1) newDir = { x: 0, y: 1 };
      else if (dy < 0 && currentDir.y !== 1) newDir = { x: 0, y: -1 };
    }

    if (newDir.x !== currentDir.x || newDir.y !== currentDir.y) {
      directionRef.current = newDir;
      setDirection(newDir);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: theme.bg,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '14px' }}>🐍</span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.text,
            }}>
              snake game
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: '#FF5F57',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* Game Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: '20px',
          gap: '24px',
        }}>
          {/* Game Canvas */}
          <div
            style={{
              flex: '1 1 400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{
              position: 'relative',
              border: `2px solid ${theme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <canvas
                ref={canvasRef}
                width={GRID_SIZE * CELL_SIZE}
                height={GRID_SIZE * CELL_SIZE}
                onClick={togglePause}
                style={{ cursor: 'pointer', display: 'block' }}
              />

              {/* Overlay Messages */}
              {(gameState === 'idle' || gameState === 'paused' || gameState === 'gameover') && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}>
                  {gameState === 'gameover' ? (
                    <>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '24px',
                        color: theme.food,
                      }}>
                        game over
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '16px',
                        color: theme.text,
                      }}>
                        score: {score}
                      </div>
                      {showNameInput && score > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'center',
                        }}>
                          <input
                            type="text"
                            placeholder="your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={15}
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '14px',
                              padding: '8px 12px',
                              background: theme.surface,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '6px',
                              color: theme.text,
                              outline: 'none',
                              width: '150px',
                              textAlign: 'center',
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && submitScore()}
                          />
                          <button
                            onClick={submitScore}
                            disabled={isSubmitting || !playerName.trim()}
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '12px',
                              padding: '8px 16px',
                              background: theme.accent,
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                              opacity: playerName.trim() ? 1 : 0.5,
                            }}
                          >
                            {isSubmitting ? 'submitting...' : 'submit score'}
                          </button>
                        </div>
                      )}
                      <button
                        onClick={startGame}
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '14px',
                          padding: '10px 20px',
                          background: theme.snakeHead,
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          cursor: 'pointer',
                          marginTop: '8px',
                        }}
                      >
                        play again
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        color: theme.text,
                      }}>
                        {gameState === 'paused' ? 'paused' : 'press p to play or pause'}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        color: theme.textMuted,
                      }}>
                        use arrow keys to move
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div style={{
            flex: '1 1 200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: '200px',
          }}>
            {/* Score */}
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '4px',
              }}>
                current score
              </div>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: '36px',
                color: theme.text,
              }}>
                {score}
              </div>
            </div>

            {/* High Score */}
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '4px',
              }}>
                high score
              </div>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: '24px',
                color: theme.text,
              }}>
                {highScore}
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
              }}>
                leaderboard
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {leaderboard.length === 0 ? (
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                  }}>
                    no scores yet
                  </div>
                ) : (
                  leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: theme.textMuted, width: '16px' }}>{index + 1}</span>
                      <span style={{ color: theme.text, flex: 1 }}>{entry.player_name}</span>
                      <span style={{ color: theme.accent, fontWeight: 'bold' }}>{entry.score}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controls */}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: theme.textMuted,
              marginTop: 'auto',
            }}>
              <div>p - play/pause</div>
              <div>arrows - move</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGamePopup;
