"use client";
import * as sudoku from "sudoku";
import { useEffect, useState, useRef } from "react";

// Helper function to generate Sudoku puzzle and solution based on difficulty
function generateSudoku(difficulty: string = "Easy") {
  // @ts-ignore
  const puzzle = sudoku.makepuzzle();
  // @ts-ignore
  const solution = sudoku.solvepuzzle(puzzle);

  // Count filled cells
  let filledIndices: number[] = [];
  let emptyIndices: number[] = [];
  for (let i = 0; i < puzzle.length; i++) {
    if (puzzle[i] !== null) {
      filledIndices.push(i);
    } else {
      emptyIndices.push(i);
    }
  }

  // Target pre-filled count: Easy: 42, Medium: 32, Hard: 24
  let targetCount = 32;
  if (difficulty === "Easy") targetCount = 42;
  else if (difficulty === "Hard") targetCount = 24;

  const adjustedPuzzle = [...puzzle];

  if (filledIndices.length < targetCount) {
    const toFill = targetCount - filledIndices.length;
    const shuffledEmpty = [...emptyIndices].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(toFill, shuffledEmpty.length); i++) {
      const idx = shuffledEmpty[i];
      adjustedPuzzle[idx] = solution[idx];
    }
  } else if (filledIndices.length > targetCount) {
    const toClear = filledIndices.length - targetCount;
    const shuffledFilled = [...filledIndices].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(toClear, shuffledFilled.length); i++) {
      const idx = shuffledFilled[i];
      adjustedPuzzle[idx] = null;
    }
  }

  const board: number[][] = [];
  const solved: number[][] = [];

  for (let i = 0; i < 9; i++) {
    board.push(
      adjustedPuzzle
        .slice(i * 9, i * 9 + 9)
        .map((v: number | null) => (v === null ? 0 : v + 1))
    );

    solved.push(
      solution
        .slice(i * 9, i * 9 + 9)
        .map((v: number | null) => (v === null ? 0 : v + 1))
    );
  }

  return {
    board,
    solution: solved,
  };
}

export default function SudokuWidget() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [game, setGame] = useState(() => generateSudoku("Easy"));
  
  const [board, setBoard] = useState<number[][]>(game.board);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>(game.solution);
  const [initialBoard, setInitialBoard] = useState<number[][]>(game.board);
  
  const [seconds, setSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const isGameCompleted = isGameStarted && board.every((row, r) =>
    row.every((cell, c) => cell === solutionBoard[r][c])
  );

  useEffect(() => {
    if (!isRunning || !isGameStarted || mistakes >= 3 || isGameCompleted) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isGameStarted, mistakes, isGameCompleted]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (row: number, col: number, value: string) => {
    if (!isRunning || mistakes >= 3 || isGameCompleted) return;

    const num = parseInt(value) || 0;
    if (num < 0 || num > 9) return;

    // Check if it's an initial cell
    if (initialBoard[row][col] !== 0) return;
    
    // Check if cell was already correctly filled
    if (board[row][col] !== 0 && board[row][col] === solutionBoard[row][col]) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (num !== 0) {
      if (num !== solutionBoard[row][col]) {
        setMistakes((prev) => prev + 1);
      } else {
        setScore((prev) => prev + 10);
      }
    }
  };

  const handleDifficultyChange = (diff: string) => {
    setDifficulty(diff);
    setIsDropdownOpen(false);
    const newGame = generateSudoku(diff);
    setGame(newGame);
    setBoard(newGame.board);
    setSolutionBoard(newGame.solution);
    setInitialBoard(newGame.board);
    setMistakes(0);
    setScore(0);
    setHintsLeft(3);
    setSeconds(0);
    setIsGameStarted(true);
    setIsRunning(true);
  };

  const resetGame = () => {
    const newGame = generateSudoku(difficulty);
    setGame(newGame);
    setBoard(newGame.board);
    setSolutionBoard(newGame.solution);
    setInitialBoard(newGame.board);
    setMistakes(0);
    setScore(0);
    setHintsLeft(3);
    setSeconds(0);
    setIsGameStarted(true);
    setIsRunning(true);
  };

  const useHint = () => {
    if (hintsLeft === 0 || !isRunning || mistakes >= 3 || isGameCompleted) return;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0 || board[i][j] !== solutionBoard[i][j]) {
          const newBoard = board.map((r) => [...r]);
          newBoard[i][j] = solutionBoard[i][j];
          setBoard(newBoard);
          setHintsLeft((prev) => prev - 1);
          setScore((prev) => prev + 25);
          return;
        }
      }
    }
  };

  return (
    <div className="mt-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-4 max-w-sm mx-auto">
      {/* Header & Custom Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          🧩 Sudoku
        </h2>
        
        {/* Custom Dropdown */}
        <div ref={dropdownRef} className="relative w-28">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200"
          >
            <span>{difficulty}</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 z-30 w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1">
              {["Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleDifficultyChange(diff)}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {diff}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats (Compact Grid) */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/30 p-2 text-center border border-slate-100 dark:border-slate-800/50">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Timer</span>
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">⏱ {formatTime(seconds)}</span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/30 p-2 text-center border border-slate-100 dark:border-slate-800/50">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Score</span>
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">🏆 {score}</span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/30 p-2 text-center border border-slate-100 dark:border-slate-800/50">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Errors</span>
          <span className={`text-xs font-extrabold ${mistakes > 0 ? "text-rose-500" : "text-slate-700 dark:text-slate-200"}`}>
            ❌ {mistakes}/3
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/30 p-2 text-center border border-slate-100 dark:border-slate-800/50">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Hints</span>
          <span className="text-xs font-extrabold text-amber-500">💡 {hintsLeft}</span>
        </div>
      </div>

      {/* Sudoku Board Wrapper with Overlay support */}
      <div className="relative flex justify-center mb-4">
        <div className={`grid grid-cols-9 gap-[2px] w-full max-w-[340px] aspect-square bg-slate-200 dark:bg-slate-800 p-[3px] rounded-2xl overflow-hidden transition-all duration-300 ${
          !isGameStarted || mistakes >= 3 || isGameCompleted ? "blur-[2px] pointer-events-none" : ""
        }`}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isInitial = initialBoard[rowIndex][colIndex] !== 0;
              const isCorrect = cell !== 0 && cell === solutionBoard[rowIndex][colIndex];
              const isWrong = cell !== 0 && cell !== solutionBoard[rowIndex][colIndex];

              return (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  type="text"
                  maxLength={1}
                  readOnly={!isGameStarted || isInitial || isCorrect}
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                  className={`
                    w-full h-full text-center text-sm md:text-base font-bold transition-all duration-200 focus:outline-none focus:bg-violet-50/50 dark:focus:bg-violet-950/20
                    ${isInitial ? "bg-slate-100/90 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 cursor-not-allowed" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"}
                    ${isCorrect ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-not-allowed" : ""}
                    ${isWrong ? "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20" : ""}
                    ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? "border-r-[2px] border-slate-300 dark:border-slate-700" : ""}
                    ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? "border-b-[2px] border-slate-300 dark:border-slate-700" : ""}
                  `}
                />
              );
            })
          )}
        </div>

        {/* Start Game Overlay */}
        {!isGameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 dark:bg-slate-950/30 rounded-2xl backdrop-blur-[3px] z-10">
            <button
              onClick={() => {
                setIsGameStarted(true);
                setIsRunning(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold shadow-lg hover:shadow-violet-500/20 active:scale-95 transition-all duration-200 text-xs uppercase tracking-wider"
            >
              ▶ Start Sudoku
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameStarted && mistakes >= 3 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/15 dark:bg-rose-950/30 rounded-2xl backdrop-blur-[3px] p-4 text-center z-10">
            <h3 className="text-base font-black text-rose-600 dark:text-rose-400 mb-1 drop-shadow-sm">❌ Game Over</h3>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold mb-3 drop-shadow-sm">You made too many mistakes (3/3)</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all duration-200 shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {isGameStarted && isGameCompleted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 rounded-2xl backdrop-blur-[6px] p-4 text-center z-10 shadow-lg border border-emerald-100 dark:border-emerald-950">
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-2 drop-shadow-sm">🎉 Victory!</h3>
            <p className="text-sm text-slate-800 dark:text-slate-100 font-bold mb-0.5">Time: {formatTime(seconds)}</p>
            <p className="text-sm text-slate-800 dark:text-slate-100 font-bold mb-4">Score: {score} pts</p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-emerald-500/20 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={!isGameStarted || mistakes >= 3 || isGameCompleted}
          className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-extrabold transition-all duration-200 disabled:opacity-40"
        >
          {isRunning ? "⏸ Pause" : "▶ Resume"}
        </button>

        <button
          onClick={useHint}
          disabled={!isGameStarted || hintsLeft === 0 || mistakes >= 3 || isGameCompleted}
          className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all duration-200 disabled:opacity-40"
        >
          💡 Hint ({hintsLeft})
        </button>
      </div>

      <button
        onClick={resetGame}
        disabled={!isGameStarted}
        className="w-full mt-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold transition-all duration-200 disabled:opacity-40"
      >
        🔄 New Game
      </button>

    </div>
  );
}

