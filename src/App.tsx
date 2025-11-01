import { useState } from 'react';
import { generateMultipleMnemonicsAsync } from './lib/mnemonicAsync';
import { validateMnemonic } from './lib/mnemonic';
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Copy, Loader2, Shield, Wifi, WifiOff } from 'lucide-react';

interface GeneratedWallet {
  index: number;
  mnemonic: string;
}

function App() {
  const [masterSeed, setMasterSeed] = useState('');
  const [seedMode, setSeedMode] = useState<'text' | 'bip39'>('text');
  const [bip39Seed, setBip39Seed] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [count, setCount] = useState(3);
  const [wordCount, setWordCount] = useState<12 | 15 | 18 | 21 | 24>(12);
  const [iterations, setIterations] = useState(100000);
  const [wallets, setWallets] = useState<GeneratedWallet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setProgress(0);
    
    // Determine the effective master seed based on mode
    let effectiveMasterSeed = '';
    
    if (seedMode === 'text') {
      if (!masterSeed.trim()) {
        setError('Please enter a master seed');
        return;
      }
      effectiveMasterSeed = masterSeed;
    } else {
      // BIP39 mode with plausible deniability
      if (!bip39Seed.trim()) {
        setError('Please enter a BIP39 seed phrase');
        return;
      }
      
      // Validate BIP39 seed phrase
      if (!validateMnemonic(bip39Seed.trim())) {
        setError('Invalid BIP39 seed phrase. Please enter a valid seed phrase.');
        return;
      }
      
      if (!password.trim()) {
        setError('Please enter a password');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Combine BIP39 seed with password
      effectiveMasterSeed = `${bip39Seed}:${password}`;
    }

    if (count < 1 || count > 20) {
      setError('Count must be between 1 and 20');
      return;
    }

    if (iterations < 1 || iterations > 1000000) {
      setError('Iterations must be between 1 and 1,000,000');
      return;
    }

    setIsGenerating(true);
    
    try {
      const mnemonics = await generateMultipleMnemonicsAsync(
        effectiveMasterSeed,
        count,
        wordCount,
        iterations,
        (completed, total) => {
          setProgress(Math.round((completed / total) * 100));
        }
      );
      
      const generatedWallets: GeneratedWallet[] = mnemonics.map((mnemonic, index) => ({
        index,
        mnemonic,
      }));
      
      setWallets(generatedWallets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Seed phrase copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
            Wallet Mnemonic Generator
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Generate crypto wallet recovery phrases offline</p>
        </div>

        {/* Security Warning */}
        <Alert variant="destructive" className="mb-6 sm:mb-8 bg-red-900/30 border-red-500">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          <AlertTitle className="text-red-300 font-bold text-sm sm:text-base">CRITICAL SECURITY WARNING</AlertTitle>
          <AlertDescription className="text-red-200 text-xs sm:text-sm">
            <ul className="space-y-1 mt-2">
              <li>• Use this tool OFFLINE ONLY - disconnect from internet</li>
              <li>• Never enter your real master seed on any connected device</li>
              <li>• Keep your master seed absolutely secret</li>
              <li>• DO NOT write down generated mnemonics - regenerate from master seed when needed</li>
              <li>• Anyone with your master seed can generate all your wallets</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Network Status */}
        <Alert className={`mb-4 sm:mb-6 ${
          navigator.onLine 
            ? 'bg-yellow-900/30 border-yellow-500 text-yellow-300' 
            : 'bg-green-900/30 border-green-500 text-green-300'
        }`}>
          {navigator.onLine ? (
            <>
              <Wifi className="h-4 w-4 sm:h-5 sm:w-5" />
              <AlertTitle className="text-sm sm:text-base">Internet Connection Detected</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                Please disconnect before generating wallets
              </AlertDescription>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 sm:h-5 sm:w-5" />
              <AlertTitle className="text-sm sm:text-base">Offline Mode</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                Safe to generate wallets
              </AlertDescription>
            </>
          )}
        </Alert>

        {/* Input Form */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Seed Mode Toggle */}
              <div className="space-y-2">
                <Label className="text-sm">Master Seed Input Mode</Label>
                <Select
                  value={seedMode}
                  onValueChange={(value) => setSeedMode(value as 'text' | 'bip39')}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Simple Text Seed</SelectItem>
                    <SelectItem value="bip39">BIP39 Seed + Password (Plausible Deniability)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Mode Input */}
              {seedMode === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="master-seed" className="text-sm">
                    Master Seed (Keep Secret!)
                  </Label>
                  <Input
                    id="master-seed"
                    type="text"
                    value={masterSeed}
                    onChange={(e) => setMasterSeed(e.target.value)}
                    placeholder="Enter your master seed..."
                    className={`text-sm ${error === 'Please enter a master seed' ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    autoComplete="off"
                  />
                  {error === 'Please enter a master seed' && (
                    <p className="text-xs text-red-400">Master seed is required</p>
                  )}
                </div>
              )}

              {/* BIP39 Mode Inputs */}
              {seedMode === 'bip39' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bip39-seed" className="text-sm">
                      BIP39 Seed Phrase (Plausible Deniability Wallet)
                    </Label>
                    <Input
                      id="bip39-seed"
                      type="text"
                      value={bip39Seed}
                      onChange={(e) => setBip39Seed(e.target.value)}
                      placeholder="Enter valid BIP39 seed phrase..."
                      className={`text-sm ${
                        (bip39Seed && !validateMnemonic(bip39Seed.trim())) || 
                        error === 'Please enter a BIP39 seed phrase' || 
                        error === 'Invalid BIP39 seed phrase. Please enter a valid seed phrase.'
                          ? 'border-red-400 focus-visible:ring-red-400' 
                          : ''
                      }`}
                      autoComplete="off"
                    />
                    {bip39Seed && !validateMnemonic(bip39Seed.trim()) ? (
                      <p className="text-xs text-red-400">Invalid BIP39 seed phrase</p>
                    ) : error === 'Please enter a BIP39 seed phrase' ? (
                      <p className="text-xs text-red-400">BIP39 seed phrase is required</p>
                    ) : error === 'Invalid BIP39 seed phrase. Please enter a valid seed phrase.' ? (
                      <p className="text-xs text-red-400">Invalid BIP39 seed phrase</p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        This should be a valid existing wallet seed phrase
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">
                      Password (Secret Extension)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className={`text-sm ${error === 'Please enter a password' ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                      autoComplete="off"
                    />
                    {error === 'Please enter a password' && (
                      <p className="text-xs text-red-400">Password is required</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password..."
                      className={`text-sm ${
                        (password && confirmPassword && password !== confirmPassword) || 
                        error === 'Passwords do not match'
                          ? 'border-red-400 focus-visible:ring-red-400' 
                          : ''
                      }`}
                      autoComplete="off"
                    />
                    {((password && confirmPassword && password !== confirmPassword) || error === 'Passwords do not match') && (
                      <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-count" className="text-sm">
                    Number of Wallets
                  </Label>
                  <Input
                    id="wallet-count"
                    type="number"
                    min="1"
                    max="20"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className={`text-sm ${error === 'Count must be between 1 and 20' ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  {error === 'Count must be between 1 and 20' && (
                    <p className="text-xs text-red-400">Count must be between 1 and 20</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="word-count" className="text-sm">
                    Words per Mnemonic
                  </Label>
                  <Select
                    value={wordCount.toString()}
                    onValueChange={(value) => setWordCount(parseInt(value) as 12 | 15 | 18 | 21 | 24)}
                  >
                    <SelectTrigger id="word-count" className="text-sm">
                      <SelectValue placeholder="Select word count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 words</SelectItem>
                      <SelectItem value="15">15 words</SelectItem>
                      <SelectItem value="18">18 words</SelectItem>
                      <SelectItem value="21">21 words</SelectItem>
                      <SelectItem value="24">24 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iterations" className="text-sm">
                  PBKDF2 Iterations (higher = more secure but slower)
                </Label>
                <Input
                  id="iterations"
                  type="number"
                  min="1"
                  max="1000000"
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value) || 10000)}
                  placeholder="10000"
                  required
                  className={`text-sm ${error === 'Iterations must be between 1 and 1,000,000' ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                />
                {error === 'Iterations must be between 1 and 1,000,000' ? (
                  <p className="text-xs text-red-400">Iterations must be between 1 and 1,000,000</p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Recommended: 100,000. Higher values provide better protection against brute-force attacks if your master seed is partially compromised.
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="text-sm text-red-600 bg-red-900/20 border-red-400">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <AlertDescription>{error}</AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Generating... {progress}%</span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base">Generate Wallets</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Wallets */}
        {wallets.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Generated Wallets</h2>
            
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2">
                  {wallets.map((wallet) => (
                    <div 
                      key={wallet.index}
                      className="flex items-center gap-1.5 py-2 px-2 sm:px-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-gray-400 mr-1">
                        #{wallet.index + 1}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <code className="text-xs sm:text-sm text-gray-300 truncate block">
                          {wallet.mnemonic}
                        </code>
                      </div>
                      
                      <Button
                        onClick={() => copyToClipboard(wallet.mnemonic)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                      >
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert className="mt-4 sm:mt-6 bg-yellow-900/30 border-yellow-500">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" />
              <AlertTitle className="text-yellow-300 text-sm sm:text-base">Important Reminders:</AlertTitle>
              <AlertDescription className="text-yellow-200 text-xs sm:text-sm">
                <ul className="space-y-1 mt-2">
                  <li>• DO NOT write down these generated mnemonics anywhere</li>
                  <li>• Only your master seed should be securely stored</li>
                  <li>• Regenerate wallets from your master seed whenever needed</li>
                  <li>• Test each wallet with a small amount first</li>
                  <li>• Use the same master seed + index to recreate the same wallet</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
          <p>This tool runs entirely in your browser with no network calls.</p>
          <p className="mt-1">Always use offline for maximum security.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
