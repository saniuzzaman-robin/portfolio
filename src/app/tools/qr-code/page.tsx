'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea } from '@/components/tools/tool-shell';
import { QrCode, Download } from 'lucide-react';

// Simple QR code generator using canvas
const generateQRCode = (text: string, size: number = 300): string => {
  try {
    const encoded = encodeURIComponent(text);
    // Using a simple QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  } catch {
    return '';
  }
};

export default function QRCodePage() {
  const [input, setInput] = useState('https://saniuzzaman.dev');
  const [size, setSize] = useState(300);
  const [qrUrl, setQrUrl] = useState(generateQRCode('https://saniuzzaman.dev', 300));
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text or URL');
      return;
    }
    try {
      const url = generateQRCode(input, size);
      setQrUrl(url);
    } catch (e) {
      setError('Failed to generate QR code' + (e instanceof Error ? `: ${e.message}` : ''));
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      setError('Failed to download QR code' + (e instanceof Error ? `: ${e.message}` : ''));
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="QR Code"
        subtitle="Generator & Decoder"
        description="Generate QR codes from any text or URL. Download as PNG. Perfect for sharing links and contact info."
        icon={QrCode}
        accent="tertiary"
      >
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Input & Settings */}
          <ToolPanel label="Input & Settings" accent="tertiary">
            <div className="space-y-5 p-4">
              <div>
                <label className="text-neutral-80 mb-2 block text-sm font-medium">
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
                  <label className="text-neutral-80 text-sm font-medium">QR Code Size</label>
                  <span className="text-lg font-bold text-cyan-400">{size}px</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="800"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-cyan-500"
                />
                <div className="text-neutral-60 mt-1 text-xs">Min: 150px, Max: 800px</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  className="font-poppins flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-cyan-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-cyan-700 lg:text-sm"
                >
                  <QrCode className="h-4 w-4" />
                  Generate
                </button>
                {qrUrl && (
                  <button
                    onClick={handleDownload}
                    className="font-poppins flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-green-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-green-700 lg:text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}
            </div>
          </ToolPanel>

          {/* Preview */}
          <ToolPanel label="QR Code Preview" accent="tertiary">
            {qrUrl ? (
              <div className="flex flex-col items-center justify-center gap-4 p-4">
                <Image
                  src={qrUrl}
                  alt="Generated QR Code"
                  width={Math.min(size, 300)}
                  height={Math.min(size, 300)}
                  className="border-neutral-20 rounded-sm border-2"
                />
                <div className="text-neutral-60 text-center text-xs">
                  Actual size: {size}x{size}px
                </div>
              </div>
            ) : (
              <div className="text-neutral-60 flex h-64 items-center justify-center p-4 text-sm">
                QR code preview will appear here
              </div>
            )}
          </ToolPanel>
        </div>

        {/* Info */}
        <ToolPanel label="Info" accent="tertiary">
          <div className="text-neutral-80 space-y-3 p-4 text-sm">
            <div>
              <p className="text-neutral-90 mb-2 font-medium">What can you encode?</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>URLs and website links</li>
                <li>Email addresses (mailto:)</li>
                <li>Phone numbers (tel:)</li>
                <li>WiFi credentials</li>
                <li>Contact information (vCard)</li>
                <li>Plain text</li>
              </ul>
            </div>
            <div>
              <p className="text-neutral-90 mb-2 font-medium">Tips</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Larger QR codes are easier to scan</li>
                <li>Keep text content under 3000 characters</li>
                <li>Use full URLs for web links</li>
              </ul>
            </div>
          </div>
        </ToolPanel>
      </ToolShell>
    </>
  );
}
