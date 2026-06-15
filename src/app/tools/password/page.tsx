'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, CopyButton } from '@/components/tools/tool-shell';
import { Lock, RotateCw } from 'lucide-react';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const generatePassword = (options: PasswordOptions): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (options.uppercase) chars += uppercase;
  if (options.lowercase) chars += lowercase;
  if (options.numbers) chars += numbers;
  if (options.symbols) chars += symbols;

  if (chars.length === 0) chars = lowercase;

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

const calculateStrength = (
  password: string
): { strength: string; score: number; color: string } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

  if (score <= 2) return { strength: 'Weak', score, color: 'text-red-400' };
  if (score <= 4) return { strength: 'Fair', score, color: 'text-yellow-400' };
  if (score <= 6) return { strength: 'Good', score, color: 'text-blue-400' };
  return { strength: 'Strong', score, color: 'text-green-400' };
};

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = () => {
    const newPasswords = Array.from({ length: 5 }, () => generatePassword(options));
    setPasswords(newPasswords);
  };

  const handleOptionChange = (
    key: keyof PasswordOptions,
    value: PasswordOptions[keyof PasswordOptions]
  ) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Password Generator"
        subtitle="Secure & Customizable"
        description="Generate strong, random passwords with customizable length and character sets. Copy with one click."
        icon={Lock}
        accent="secondary"
      >
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Options */}
          <ToolPanel label="Settings" accent="secondary">
            <div className="space-y-5">
              {/* Length slider */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-neutral-80 text-sm font-medium">Length</label>
                  <span className="text-lg font-bold text-cyan-400">{options.length}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={options.length}
                  onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-cyan-500"
                />
                <div className="text-neutral-60 mt-1 text-xs">Min: 4, Max: 64</div>
              </div>

              {/* Character sets */}
              <div className="border-neutral-20 space-y-3 border-t pt-2">
                <label className="text-neutral-80 block text-sm font-medium">Character Sets</label>

                {[
                  { key: 'uppercase', label: 'Uppercase (A-Z)' },
                  { key: 'lowercase', label: 'Lowercase (a-z)' },
                  { key: 'numbers', label: 'Numbers (0-9)' },
                  { key: 'symbols', label: 'Symbols (!@#$%)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={options[key as keyof PasswordOptions] as boolean}
                      onChange={(e) =>
                        handleOptionChange(key as keyof PasswordOptions, e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded"
                    />
                    <span className="text-neutral-80 text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                className="font-poppins flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-cyan-700 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-cyan-700 lg:text-sm"
              >
                <RotateCw className="h-4 w-4" />
                Generate Passwords
              </button>
            </div>
          </ToolPanel>

          {/* Info */}
          <ToolPanel label="Info" accent="secondary">
            <div className="text-neutral-80 space-y-4 text-sm">
              <div>
                <p className="text-neutral-90 mb-2 font-medium">Recommended Length</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>Social media: 12-16 characters</li>
                  <li>Email/banking: 16-20 characters</li>
                  <li>Critical systems: 20+ characters</li>
                </ul>
              </div>
              <div>
                <p className="text-neutral-90 mb-2 font-medium">Best Practices</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>Use all character types</li>
                  <li>Avoid dictionary words</li>
                  <li>Never reuse passwords</li>
                  <li>Use a password manager</li>
                </ul>
              </div>
            </div>
          </ToolPanel>
        </div>

        {/* Generated passwords */}
        {passwords.length > 0 && (
          <div>
            <h3 className="text-neutral-90 mb-4 text-sm font-semibold">Generated Passwords</h3>
            <div className="grid gap-3">
              {passwords.map((password, index) => {
                const strength = calculateStrength(password);
                return (
                  <div
                    key={index}
                    className="border-neutral-20 bg-neutral-10 flex items-center gap-3 rounded-sm border p-3"
                  >
                    <div className="flex-1">
                      <div className="text-neutral-90 mb-1 font-mono text-sm break-all">
                        {password}
                      </div>
                      <div className={`text-xs font-medium ${strength.color}`}>
                        Strength: {strength.strength}
                      </div>
                    </div>
                    <CopyButton text={password} accent="secondary" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ToolShell>
    </>
  );
}
