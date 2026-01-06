import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState('idle'); // idle, playing, paused, gameover
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

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    success: '#4ECDC4',
    danger: '#FF6B6B',
    snakeHead: '#4ECDC4',
    snakeBody: '#3BA99C',
    food: '#FF6B6B',
    grid: 'rgba(255,255,255,0.03)',
  };

  // Load leaderboard on mount
  useEffect(() => {
    loadLeaderboard();
    const savedHighScore = localStorage.getItem('snake_high_score');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
    const savedName = localStorage.getItem('snake_player_name');
    if (savedName) setPlayerName(savedName);
  }, []);

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

  const gameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_high_score', score.toString());
    }
    if (score > 0) {
      setShowNameInput(true);
    }
  }, [score, highScore]);

  const submitScore = async () => {
    if (!playerName.trim() || score === 0) return;

    setIsSubmitting(true);
    localStorage.setItem('snake_player_name', playerName);

    try {
      const { error } = await supabase
        .from('snake_scores')
        .insert({
          player_name: playerName.trim(),
          score: score,
        });

      if (error) throw error;
      await loadLeaderboard();
      setShowNameInput(false);
    } catch (error) {
      console.log('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const currentDirection = directionRef.current;
        if (currentDirection.x === 0 && currentDirection.y === 0) return prevSnake;

        const head = prevSnake[0];
        const newHead = {
          x: head.x + currentDirection.x,
          y: head.y + currentDirection.y,
        };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          gameOver();
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          gameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prev => prev + 10);
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, speed, food, generateFood, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        } else if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          startGame();
        }
        return;
      }

      if (gameState !== 'playing') return;

      const currentDirection = directionRef.current;
      let newDirection = currentDirection;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection.y !== 1) newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection.y !== -1) newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection.x !== 1) newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection.x !== -1) newDirection = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      e.preventDefault();
      directionRef.current = newDirection;
      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame, pauseGame]);

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
      startGame();
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    const currentDirection = directionRef.current;
    let newDirection = currentDirection;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0 && currentDirection.x !== -1) {
        newDirection = { x: 1, y: 0 };
      } else if (dx < 0 && currentDirection.x !== 1) {
        newDirection = { x: -1, y: 0 };
      }
    } else {
      // Vertical swipe
      if (dy > 0 && currentDirection.y !== -1) {
        newDirection = { x: 0, y: 1 };
      } else if (dy < 0 && currentDirection.y !== 1) {
        newDirection = { x: 0, y: -1 };
      }
    }

    directionRef.current = newDirection;
    setDirection(newDirection);
  };

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = GRID_SIZE * CELL_SIZE;
    const height = GRID_SIZE * CELL_SIZE;

    // Clear canvas
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
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

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? theme.snakeHead : theme.snakeBody;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );

      // Draw eyes on head
      if (index === 0) {
        ctx.fillStyle = theme.bg;
        const eyeSize = 3;
        const eyeOffset = 5;

        if (direction.x === 1) {
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + 4, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - 7, eyeSize, eyeSize);
        } else if (direction.x === -1) {
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - eyeSize, segment.y * CELL_SIZE + 4, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - 7, eyeSize, eyeSize);
        } else if (direction.y === -1) {
          ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 7, segment.y * CELL_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize);
        } else {
          ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 7, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, eyeSize);
        }
      }
    });
  }, [snake, food, direction, theme]);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'Space Mono', monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link
          to="/"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '22px',
            fontStyle: 'italic',
            color: theme.text,
            textDecoration: 'none',
          }}
        >
          Zero
        </Link>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          letterSpacing: '2px',
          color: theme.accent,
        }}>
          SNAKE GAME
        </div>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
      }}>
        {/* Game Section */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '36px',
            fontStyle: 'italic',
            marginBottom: '8px',
          }}>
            Snake
          </h1>
          <p style={{
            fontSize: '12px',
            color: theme.textMuted,
            marginBottom: '24px',
          }}>
            Use arrow keys or WASD to move. Swipe on mobile.
          </p>

          {/* Score Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginBottom: '24px',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '1px' }}>SCORE</div>
              <div style={{ fontSize: '32px', color: theme.success }}>{score}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '1px' }}>HIGH SCORE</div>
              <div style={{ fontSize: '32px', color: theme.accent }}>{highScore}</div>
            </div>
          </div>

          {/* Game Canvas */}
          <div
            style={{
              display: 'inline-block',
              border: `2px solid ${theme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              touchAction: 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              style={{ display: 'block' }}
            />

            {/* Overlay for idle/paused/gameover states */}
            {gameState !== 'playing' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}>
                {gameState === 'gameover' && (
                  <>
                    <div style={{ fontSize: '24px', color: theme.danger }}>GAME OVER</div>
                    <div style={{ fontSize: '14px', color: theme.textMuted }}>Score: {score}</div>
                  </>
                )}

                {gameState === 'paused' && (
                  <div style={{ fontSize: '24px', color: theme.accent }}>PAUSED</div>
                )}

                {!showNameInput && (
                  <button
                    onClick={startGame}
                    style={{
                      padding: '12px 32px',
                      background: theme.accent,
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    {gameState === 'idle' ? 'START GAME' : gameState === 'paused' ? 'RESUME' : 'PLAY AGAIN'}
                  </button>
                )}

                {showNameInput && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    alignItems: 'center',
                  }}>
                    <div style={{ fontSize: '12px', color: theme.textMuted }}>Submit your score to the leaderboard!</div>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={20}
                      style={{
                        padding: '10px 16px',
                        background: theme.surface,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        color: theme.text,
                        fontSize: '14px',
                        fontFamily: "'Space Mono', monospace",
                        outline: 'none',
                        width: '200px',
                        textAlign: 'center',
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && submitScore()}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={submitScore}
                        disabled={!playerName.trim() || isSubmitting}
                        style={{
                          padding: '10px 24px',
                          background: theme.success,
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: "'Space Mono', monospace",
                          cursor: !playerName.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: !playerName.trim() || isSubmitting ? 0.5 : 1,
                        }}
                      >
                        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                      </button>
                      <button
                        onClick={() => setShowNameInput(false)}
                        style={{
                          padding: '10px 24px',
                          background: 'transparent',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          color: theme.textMuted,
                          fontSize: '12px',
                          fontFamily: "'Space Mono', monospace",
                          cursor: 'pointer',
                        }}
                      >
                        SKIP
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '8px' }}>
                  Press SPACE or tap to {gameState === 'paused' ? 'resume' : 'start'}
                </div>
              </div>
            )}
          </div>

          {/* Controls hint */}
          <div style={{
            marginTop: '16px',
            fontSize: '11px',
            color: theme.textMuted,
          }}>
            SPACE to pause/resume
          </div>
        </div>

        {/* Leaderboard Section */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '2px',
            color: theme.accent,
            marginBottom: '20px',
          }}>
            LEADERBOARD
          </h2>

          {leaderboard.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: theme.textMuted,
              fontSize: '13px',
            }}>
              No scores yet. Be the first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    background: index < 3 ? `${theme.accent}10` : 'transparent',
                    border: `1px solid ${index < 3 ? theme.accent + '30' : theme.border}`,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: index < 3 ? theme.bg : theme.textMuted,
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: theme.text }}>{entry.player_name}</div>
                    <div style={{ fontSize: '10px', color: theme.textMuted }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.success,
                  }}>
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
