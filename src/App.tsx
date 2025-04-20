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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
    const newEntropy = Math.min(100, (mousePointsRef.current.length / 3) / 2);
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
    if (now - lastUpdateRef.current < 50) return;

    // Añadir múltiples puntos de entropía por cada toque para acelerar el proceso
    for (let i = 0; i < 5; i++) {
      mousePointsRef.current.push(
        touch.clientX + Math.random() * 10 - 5,
        touch.clientY + Math.random() * 10 - 5,
        (now % 256) + i
      );
    }

    const newEntropy = Math.min(100, (mousePointsRef.current.length / 3) / 1.5); // Más rápido que con mouse
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
    
    setStrength(Math.max(0, Math.min(100, Math.round(score)));
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
      {/* Resto del código permanece exactamente igual */}
      {/* ... */}
    </div>
  );
}

export default App;
