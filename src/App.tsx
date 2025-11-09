import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const SPEEDS = [200, 150, 100, 75, 50];
const SPEED_LABELS = ['Медленно', 'Нормально', 'Быстро', 'Очень быстро', 'Безумие'];

function App() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const directionRef = useRef<Direction>('RIGHT');

  const generateFood = useCallback(() => {
    const newFood: Position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    for (let i = 0; i < snakeBody.length; i++) {
      if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
        return true;
      }
    }
    return false;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      if (checkCollision(head, prevSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore((prev) => prev + 10);
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [food, checkCollision, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(moveSnake, SPEEDS[speedIndex]);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, moveSnake, speedIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Змейка</h1>
          <div className="flex items-center justify-center gap-8 text-lg">
            <div className="text-slate-600">
              Счёт: <span className="font-bold text-emerald-600">{score}</span>
            </div>
            <div className="text-slate-600">
              Длина: <span className="font-bold text-blue-600">{snake.length}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Скорость: {SPEED_LABELS[speedIndex]}
          </label>
          <input
            type="range"
            min="0"
            max="4"
            value={speedIndex}
            onChange={(e) => setSpeedIndex(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            disabled={isPlaying}
          />
        </div>

        <div
          className="relative bg-slate-100 border-4 border-slate-300 rounded-lg mx-auto"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-75 rounded ${
                index === 0 ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}
          <div
            className="absolute bg-red-500 rounded-full transition-all duration-75"
            style={{
              left: food.x * CELL_SIZE + 2,
              top: food.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
            }}
          />
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Игра окончена!</h2>
                <p className="text-xl text-white mb-2">Ваш счёт: {score}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={gameOver}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                Пауза
              </>
            ) : (
              <>
                <Play size={20} />
                Старт
              </>
            )}
          </button>
          <button
            onClick={resetGame}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Заново
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>Используйте стрелки на клавиатуре для управления</p>
        </div>
      </div>
    </div>
  );
}

export default App;
