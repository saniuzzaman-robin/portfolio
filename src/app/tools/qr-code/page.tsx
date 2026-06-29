'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  ToolActionButton,
  ToolSecondaryButton,
  ToolError,
  ToolInfo,
} from '@/components/tools/tool-shell';
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
      >
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <ToolPanel label="Input & Settings">
            <div className="space-y-5 p-4">
              <div>
                <label className="text-midnight-950 mb-2 block text-sm font-medium">
                  Text or URL
                </label>
                <ToolTextarea
                  value={input}
                  onChange={setInput}
                  placeholder="Enter text, URL, email, phone number, vCard, etc…"
                  rows={6}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-midnight-950 text-sm font-medium">QR Code Size</label>
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

              <div className="flex flex-col gap-3">
                <ToolActionButton
                  onClick={handleGenerate}
                  disabled={!input.trim() || isGenerating}
                  icon={QrCode}
                  label="Generate QR Code"
                  fullWidth
                />
                <ToolSecondaryButton
                  onClick={handleDownload}
                  icon={Download}
                  label="Download PNG"
                />
              </div>

              {error && <ToolError message={error} />}
            </div>
          </ToolPanel>

          <ToolPanel label="QR Code Preview · Generated Locally">
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              {isGenerating && (
                <div className="text-tertiary-50 flex items-center gap-2 text-sm">
                  <div className="border-tertiary-50 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Generating...
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="border-midnight-200 h-auto max-w-full rounded-sm border-2 bg-white p-2 shadow-lg"
              />
              <div className="text-midnight-500 text-center text-xs">
                Actual size: {size}x{size}px · Generated in browser
              </div>
            </div>
          </ToolPanel>
        </div>

        <div className="flex flex-col gap-4">
          <ToolInfo title="What can you encode?">
            <ul className="text-midnight-950 list-inside list-disc space-y-1 text-xs">
              <li>URLs and website links</li>
              <li>Email addresses (mailto:)</li>
              <li>Phone numbers (tel:)</li>
              <li>WiFi credentials</li>
              <li>Contact information (vCard)</li>
              <li>Plain text messages</li>
            </ul>
          </ToolInfo>

          <ToolInfo title="Tips">
            <ul className="text-midnight-950 list-inside list-disc space-y-1 text-xs">
              <li>Larger QR codes are easier to scan from distance</li>
              <li>Keep text content under 3000 characters for best results</li>
              <li>Use full URLs for web links (include https://)</li>
              <li>Generated locally - no data sent to external servers</li>
            </ul>
          </ToolInfo>
        </div>
      </ToolShell>
    </>
  );
}
