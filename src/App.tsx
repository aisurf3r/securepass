import React, { useState, useEffect, useRef } from 'react';
import { Copy, Download, Shield, RefreshCw, Check, KeyRound, AlertTriangle, History, Info, Keyboard, Moon, Sun, Github } from 'lucide-react';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface PasswordHistory {
  password: string;
  timestamp: number;
  strength: number;
}

function App() {
  const [entropyCollected, setEntropyCollected] = useState(0);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [strength, setStrength] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showStrengthInfo, setShowStrengthInfo] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const mousePointsRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatorBoxRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  const [isMobile, setIsMobile] = useState(false);
  const strengthRef = useRef(strength);

  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        switch(e.key.toLowerCase()) {
          case 'c':
            if (password) copyToClipboard();
            break;
          case 'd':
            if (password) downloadPassword();
            break;
          case 'r':
            resetGenerator();
            break;
          case 'h':
            setShowHistory(prev => !prev);
            break;
          case 'k':
            setShowKeyboardShortcuts(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [password]);

  const checkValidFilters = () => {
    const currentOptions = optionsRef.current;
    return currentOptions.uppercase || currentOptions.lowercase || 
           currentOptions.numbers || currentOptions.symbols;
  };

  const generatePassword = () => {
    if (entropyCollected >= 100) return;
    
    const currentOptions = optionsRef.current;
    
    if (!checkValidFilters()) {
      setPassword('');
      setStrength(0);
      return;
    }

    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let validChars = '';
    if (currentOptions.uppercase) validChars += chars.uppercase;
    if (currentOptions.lowercase) validChars += chars.lowercase;
    if (currentOptions.numbers) validChars += chars.numbers;
    if (currentOptions.symbols) validChars += chars.symbols;

    if (!validChars) return;

    const array = new Uint32Array(currentOptions.length);
    crypto.getRandomValues(array);
    
    let result = '';
    for (let i = 0; i < currentOptions.length; i++) {
      result += validChars[array[i] % validChars.length];
    }

    setPassword(result);
    calculateStrength(result);

    if (result) {
      setPasswordHistory(prev => {
        const newHistory = [
          { 
            password: result, 
            timestamp: Date.now(), 
            strength: strengthRef.current 
          },
          ...prev.slice(0, 9)
        ];
        return newHistory;
      });
    }
  };

  const collectMouseEntropy = (e: MouseEvent) => {
    if (entropyCollected >= 100) return;

    const generatorBox = generatorBoxRef.current;
    if (!generatorBox) return;

    const rect = generatorBox.getBoundingClientRect();
    
    if (!isMobile && 
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      return;
    }

    if (!checkValidFilters()) {
      setPassword('');
      setStrength(0);
      return;
    }

    const now = Date.now();
    if (now - lastUpdateRef.current < 50) return;
    
    mousePointsRef.current.push(e.clientX, e.clientY, now % 256);
    const newEntropy = Math.min(100, mousePointsRef.current.length / 6);
    setEntropyCollected(newEntropy);
    lastUpdateRef.current = now;

    if (newEntropy < 100) {
      generatePassword();
    }
  };

  const collectTouchEntropy = (e: TouchEvent) => {
    if (entropyCollected >= 100) return;
    if (!isMobile) return;

    const touch = e.touches[0];
    if (!touch) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < 100) return; // Aumentado el tiempo entre actualizaciones

    // Solo 2 puntos por toque (antes eran 5)
    for (let i = 0; i < 2; i++) {
      mousePointsRef.current.push(
        touch.clientX + Math.random() * 10 - 5,
        touch.clientY + Math.random() * 10 - 5,
        (now % 256) + i
      );
    }

    const newEntropy = Math.min(100, mousePointsRef.current.length / 6); // Más lento que antes (/4.5)
    setEntropyCollected(newEntropy);
    lastUpdateRef.current = now;

    if (newEntropy < 100) {
      generatePassword();
    }
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    const length = pwd.length;
    
    score += Math.min(30, (length / 32) * 30);
    
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    
    const charTypes = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
    score += charTypes * 10;

    const charCounts = new Map();
    for (const char of pwd) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }
    
    const maxCount = Math.max(...charCounts.values());
    const distributionScore = 30 * (1 - (maxCount / length));
    score += distributionScore;

    const hasRepeatingChars = /(.)\1{2,}/.test(pwd);
    const hasSequential = /(abc|bcd|cde|def|efg|123|234|345|456|567|678|789)/.test(pwd.toLowerCase());
    
    if (hasRepeatingChars) score -= 10;
    if (hasSequential) score -= 10;
    
    setStrength(Math.max(0, Math.min(100, Math.round(score))));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPassword = () => {
    const blob = new Blob([password], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'password.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    document.addEventListener('mousemove', collectMouseEntropy);
    document.addEventListener('touchmove', collectTouchEntropy);
    return () => {
      document.removeEventListener('mousemove', collectMouseEntropy);
      document.removeEventListener('touchmove', collectTouchEntropy);
    };
  }, [isMobile]);

  useEffect(() => {
    if (entropyCollected < 100) {
      if (!checkValidFilters()) {
        setPassword('');
        setStrength(0);
      } else if (mousePointsRef.current.length > 0) {
        generatePassword();
      }
    }
  }, [options]);

  const resetGenerator = () => {
    setEntropyCollected(0);
    mousePointsRef.current = [];
    setPassword('');
    setStrength(0);
  };

  const getStrengthLabel = (score: number) => {
    if (score < 40) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  const hasNoFilters = !options.uppercase && !options.lowercase && 
                      !options.numbers && !options.symbols;

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen ${darkMode ? 
        'bg-gradient-to-br from-gray-900 to-gray-800' : 
        'bg-gradient-to-br from-purple-600 to-blue-500'} flex flex-col`}
    >
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <KeyRound className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">SecurePass</h1>
            <p className="text-sm opacity-80">Advanced Entropy-Based Generator</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-white/80 hover:text-white transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="p-2 text-white/80 hover:text-white transition-colors"
            title="Keyboard Shortcuts (Shift+K)"
          >
            <Keyboard className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 text-white/80 hover:text-white transition-colors"
            title="Password History (Shift+H)"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div 
          ref={generatorBoxRef}
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-2xl shadow-2xl p-8 w-full max-w-2xl space-y-6`}
        >
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Generate Your Password</h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {isMobile ? 
                "Move your finger anywhere on the screen to create entropy" : 
                "Move your mouse outside this box to create entropy"}
            </p>
          </div>

          {hasNoFilters && (
            <div className={`${darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-400'} border-l-4 p-4 flex items-start gap-3`}>
              <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-400'} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className={darkMode ? 'font-medium text-purple-300' : 'font-medium text-purple-800'}>No character types selected</h3>
                <p className={darkMode ? 'text-purple-200 text-sm mt-1' : 'text-purple-700 text-sm mt-1'}>
                  Please select at least one character type (uppercase, lowercase, numbers, or symbols) to generate a password.
                </p>
              </div>
            </div>
          )}

          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out ${
                entropyCollected >= 100 ? 'animate-pulse' : ''
              }`}
              style={{ width: `${entropyCollected}%` }}
            />
          </div>

          <div className="relative">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg break-all font-mono text-lg min-h-[4rem] flex items-center overflow-x-auto max-h-24 overflow-y-auto`}>
              {password || 'Your password will appear here'}
            </div>
            {password && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded-full transition-colors`}
                  title="Copy to clipboard (Shift+C)"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                </button>
                <button
                  onClick={downloadPassword}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded-full transition-colors`}
                  title="Download password (Shift+D)"
                >
                  <Download className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
            )}
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1`}>
                  <Shield className="w-4 h-4" />
                  Password Strength: <span className="font-medium">{getStrengthLabel(strength)}</span>
                  <button
                    onClick={() => setShowStrengthInfo(true)}
                    className={`p-1 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                    title="Show strength calculation info"
                  >
                    <Info className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </button>
                </span>
                <span className="text-sm font-medium">{strength}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    strength < 40 ? 'bg-red-500' : 
                    strength < 60 ? 'bg-yellow-500' : 
                    strength < 80 ? 'bg-green-500' : 
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Password Length: {options.length}</label>
              <input
                type="range"
                min="8"
                max="32"
                value={options.length}
                onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={entropyCollected >= 100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={(e) => setOptions(prev => ({ ...prev, uppercase: e.target.checked }))}
                  className="rounded text-purple-500 focus:ring-purple-500"
                  disabled={entropyCollected >= 100}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.lowercase}
                  onChange={(e) => setOptions(prev => ({ ...prev, lowercase: e.target.checked }))}
                  className="rounded text-purple-500 focus:ring-purple-500"
                  disabled={entropyCollected >= 100}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lowercase (a-z)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.numbers}
                  onChange={(e) => setOptions(prev => ({ ...prev, numbers: e.target.checked }))}
                  className="rounded text-purple-500 focus:ring-purple-500"
                  disabled={entropyCollected >= 100}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Numbers (0-9)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.symbols}
                  onChange={(e) => setOptions(prev => ({ ...prev, symbols: e.target.checked }))}
                  className="rounded text-purple-500 focus:ring-purple-500"
                  disabled={entropyCollected >= 100}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Symbols (!@#$...)</span>
              </label>
            </div>
          </div>

          <button
            onClick={resetGenerator}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Generate New Password
          </button>
        </div>
      </main>

      {/* Los modales (showHistory, showStrengthInfo, showKeyboardShortcuts) permanecen igual */}
      {/* ... */}

      <footer className="text-center p-4 text-white/80 text-sm flex items-center justify-center gap-2">
        <p>© 2025 SecurePass. Built with security and privacy in mind.</p>
        <a 
          href="https://github.com/aisurf3r/securepass.git" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
        >
          <Github className="w-5 h-5" />
        </a>
      </footer>
    </div>
  );
}

export default App;
