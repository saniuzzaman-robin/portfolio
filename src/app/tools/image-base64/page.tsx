'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { FileImage, Upload, X } from 'lucide-react';

export default function ImageBase64Page() {
  const [imageData, setImageData] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState('');
  const [dataUri, setDataUri] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      setImageData(base64);
      setFileName(file.name);
      setFileSize(file.size);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setImageData('');
    setFileName('');
    setFileSize(0);
    setMimeType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getOutput = () => {
    if (!imageData) return '';
    return dataUri ? `data:${mimeType};base64,${imageData}` : imageData;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Image to Base64"
        subtitle="Convert & Embed"
        description="Convert images to Base64 encoding. Perfect for embedding images in HTML, CSS, or JSON without external files."
        icon={FileImage}
        accent="primary"
      >
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Upload */}
          <ToolPanel label="Upload Image" accent="primary">
            <div className="p-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-primary-50/30 hover:border-primary-50/50 hover:bg-primary-50/5 flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-8 text-center transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="text-primary-50 mb-4 h-12 w-12" />
                <p className="text-midnight-700 mb-2 text-sm font-medium">
                  Drop an image here or click to browse
                </p>
                <p className="text-midnight-500 text-xs">Supports: PNG, JPG, GIF, WebP, SVG</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {fileName && (
                <div className="bg-primary-50/10 border-primary-50/20 mt-4 flex items-center justify-between rounded-sm border p-3">
                  <div className="flex-1">
                    <p className="text-midnight-900 text-sm font-medium">{fileName}</p>
                    <p className="text-midnight-500 text-xs">
                      {mimeType} · {formatFileSize(fileSize)}
                    </p>
                  </div>
                  <button
                    onClick={clearImage}
                    className="text-midnight-500 transition-colors hover:text-red-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="mt-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dataUri}
                    onChange={(e) => setDataUri(e.target.checked)}
                    className="accent-primary-50 h-4 w-4"
                  />
                  <span className="text-midnight-700 text-sm">
                    Include Data URI prefix{' '}
                    <code className="text-primary-50 text-xs">data:image/...;base64,</code>
                  </span>
                </label>
              </div>
            </div>
          </ToolPanel>

          {/* Preview */}
          <ToolPanel label="Image Preview" accent="secondary">
            <div className="flex min-h-75 items-center justify-center p-4">
              {imageData ? (
                <div className="relative max-h-70 max-w-full">
                  <Image
                    src={`data:${mimeType};base64,${imageData}`}
                    alt="Preview"
                    width={500}
                    height={280}
                    className="h-auto max-h-70 w-auto max-w-full rounded-sm border border-white/10 object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="text-midnight-500 text-center text-sm">
                  Upload an image to see preview
                </div>
              )}
            </div>
          </ToolPanel>
        </div>

        {/* Output */}
        {imageData && (
          <ToolPanel
            label="Base64 Output"
            accent="tertiary"
            action={<CopyButton text={getOutput()} accent="tertiary" />}
          >
            <ToolTextarea value={getOutput()} readOnly rows={8} accent="tertiary" mono />
            <div className="text-midnight-500 border-t border-white/5 px-4 py-2 text-xs">
              {getOutput().length.toLocaleString()} characters
            </div>
          </ToolPanel>
        )}

        {/* Info */}
        <ToolPanel label="Usage Examples" accent="primary">
          <div className="text-midnight-700 space-y-3 p-4 text-sm">
            <div>
              <p className="text-midnight-900 mb-2 font-medium">HTML:</p>
              <code className="bg-midnight-100 text-primary-50 block rounded-sm p-2 text-xs">
                {'<img src="data:image/png;base64,..." alt="Embedded" />'}
              </code>
            </div>
            <div>
              <p className="text-midnight-900 mb-2 font-medium">CSS:</p>
              <code className="bg-midnight-100 text-primary-50 block rounded-sm p-2 text-xs">
                {'background-image: url(data:image/png;base64,...);'}
              </code>
            </div>
            <div>
              <p className="text-midnight-900 mb-2 font-medium">💡 Benefits:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>No external file dependencies</li>
                <li>Single HTTP request</li>
                <li>Works in emails and offline apps</li>
                <li>Perfect for small icons and logos</li>
              </ul>
            </div>
          </div>
        </ToolPanel>
      </ToolShell>
    </>
  );
}
