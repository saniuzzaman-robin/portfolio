'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea } from '@/components/tools/tool-shell';
import { QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const [input, setInput] = useState('https://saniuzzaman.dev');
  const [size, setSize] = useState(300);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text or URL');
      return;
    }

    if (!canvasRef.current) return;

    setIsGenerating(true);
    try {
      await QRCode.toCanvas(canvasRef.current, input, {
        width: size,
        margin: 2,
        color: {
          dark: '#0F172A', // Dark navy
          light: '#F8FAFC', // Light background
        },
      });
    } catch (e) {
      setError('Failed to generate QR code' + (e instanceof Error ? `: ${e.message}` : ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    try {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setError('Failed to download QR code' + (e instanceof Error ? `: ${e.message}` : ''));
    }
  };

  // Generate on mount
  useEffect(() => {
    const generateInitialQR = async () => {
      if (!canvasRef.current || !input.trim()) return;

      setIsGenerating(true);
      try {
        await QRCode.toCanvas(canvasRef.current, input, {
          width: size,
          margin: 2,
          color: {
            dark: '#0F172A',
            light: '#F8FAFC',
          },
        });
      } catch (e) {
        setError('Failed to generate QR code' + (e instanceof Error ? `: ${e.message}` : ''));
      } finally {
        setIsGenerating(false);
      }
    };

    generateInitialQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navigation />
      <ToolShell
        title="QR Code"
        subtitle="Generator · Local"
        description="Generate QR codes from any text or URL locally in your browser. Download as PNG. Perfect for sharing links and contact info."
        icon={QrCode}
        accent="tertiary"
      >
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Input & Settings */}
          <ToolPanel label="Input & Settings" accent="tertiary">
            <div className="space-y-5 p-4">
              <div>
                <label className="text-midnight-700 mb-2 block text-sm font-medium">
                  Text or URL
                </label>
                <ToolTextarea
                  value={input}
                  onChange={setInput}
                  placeholder="Enter text, URL, email, phone number, vCard, etc…"
                  rows={6}
                  accent="tertiary"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-midnight-700 text-sm font-medium">QR Code Size</label>
                  <span className="text-tertiary-50 text-lg font-bold">{size}px</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="800"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="accent-tertiary-50 w-full cursor-pointer"
                />
                <div className="text-midnight-500 mt-1 text-xs">Min: 150px, Max: 800px</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="font-poppins bg-tertiary-50 hover:bg-tertiary-60 flex flex-1 items-center justify-center gap-2 rounded-sm px-6 py-2.5 text-sm font-bold text-black uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="font-poppins border-tertiary-50/30 text-tertiary-50 hover:bg-tertiary-50/10 flex flex-1 items-center justify-center gap-2 rounded-sm border px-6 py-2.5 text-sm font-bold uppercase transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

              {error && (
                <div className="animate-shake rounded-sm bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          </ToolPanel>

          {/* Preview */}
          <ToolPanel label="QR Code Preview · Generated Locally" accent="tertiary">
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <canvas
                ref={canvasRef}
                className="rounded-sm border-2 border-white/10 bg-white p-2 shadow-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <div className="text-midnight-500 text-center text-xs">
                Actual size: {size}x{size}px · Generated in browser
              </div>
            </div>
          </ToolPanel>
        </div>

        {/* Info */}
        <ToolPanel label="Info" accent="tertiary">
          <div className="text-midnight-700 space-y-3 p-4 text-sm">
            <div>
              <p className="text-midnight-900 mb-2 font-medium">✨ What can you encode?</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>URLs and website links</li>
                <li>Email addresses (mailto:)</li>
                <li>Phone numbers (tel:)</li>
                <li>WiFi credentials</li>
                <li>Contact information (vCard)</li>
                <li>Plain text messages</li>
              </ul>
            </div>
            <div>
              <p className="text-midnight-900 mb-2 font-medium">💡 Tips</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Larger QR codes are easier to scan from distance</li>
                <li>Keep text content under 3000 characters for best results</li>
                <li>Use full URLs for web links (include https://)</li>
                <li>Generated locally - no data sent to external servers</li>
              </ul>
            </div>
          </div>
        </ToolPanel>
      </ToolShell>
    </>
  );
}
