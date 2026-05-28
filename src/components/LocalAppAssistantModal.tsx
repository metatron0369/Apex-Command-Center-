import React, { useState } from 'react';
import { Tool } from '../types';
import Icon from './Icon';

interface LocalAppAssistantModalProps {
  isOpen: boolean;
  tool: Tool | null;
  onClose: () => void;
}

export default function LocalAppAssistantModal({
  isOpen,
  tool,
  onClose,
}: LocalAppAssistantModalProps) {
  const [os, setOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [copiedText, setCopiedText] = useState<'path' | 'command' | 'protocol' | null>(null);

  if (!isOpen || !tool) return null;

  const localPath = tool.localPath || tool.url;
  const isWebProtocol = /^https?:\/\//i.test(localPath);
  const isAppUrlScheme = /^[a-zA-Z0-9-]{2,15}:\/\//i.test(localPath) && !isWebProtocol;

  // Generate system run scripts based on chosen OS
  const getTerminalCommand = () => {
    if (os === 'windows') {
      return `start "" "${localPath.replace(/\//g, '\\')}"`;
    } else if (os === 'mac') {
      return `open "${localPath}"`;
    } else {
      return `xdg-open "${localPath}"`;
    }
  };

  const handleCopy = (text: string, type: 'path' | 'command' | 'protocol') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with elegant blur */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gold-500/20 bg-slate-950 p-6 text-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-250 shadow-2xl shadow-gold-500/5">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-gold-550/40 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded bg-gold-950/60 border border-gold-550/30 text-gold-500">
              <Icon name="Cpu" size={22} className="stroke-[2]" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold-500 font-bold">DESKTOP APPLICATION PORTAL</span>
              <h2 className="text-lg font-black font-display tracking-wide text-white uppercase mt-0.5">
                {tool.name} Launch System
              </h2>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Path Card Block */}
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Registered Local Path:</span>
            <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 bg-slate-950 border border-slate-850 rounded">
              {isAppUrlScheme ? 'Custom URI Protocol' : 'Absolute Executable Path'}
            </span>
          </div>
          
          <code className="text-xs bg-slate-950 p-3 rounded border border-slate-850 break-all font-mono text-gold-400 block max-h-24 overflow-y-auto">
            {localPath}
          </code>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => handleCopy(localPath, 'path')}
              className="px-3 py-2 text-[11px] rounded bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 flex items-center justify-center gap-1.5 text-slate-300 font-mono transition-colors"
            >
              <Icon name={copiedText === 'path' ? 'Check' : 'Copy'} size={12} className={copiedText === 'path' ? 'text-emerald-400' : ''} />
              <span>{copiedText === 'path' ? 'COPIED!' : 'COPY PATH'}</span>
            </button>
            <button
              onClick={() => handleCopy(getTerminalCommand(), 'command')}
              className="px-3 py-2 text-[11px] rounded bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 flex items-center justify-center gap-1.5 text-slate-300 font-mono transition-colors"
            >
              <Icon name={copiedText === 'command' ? 'Check' : 'Terminal'} size={12} className={copiedText === 'command' ? 'text-emerald-400' : ''} />
              <span>{copiedText === 'command' ? 'COPIED SCRIPT' : 'TERMINAL RUN'}</span>
            </button>
          </div>
        </div>

        {/* Platform Target OS Selector */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Select Machine OS:</span>
          <div className="flex rounded border border-slate-850 p-0.5 bg-slate-900">
            {(['windows', 'mac', 'linux'] as const).map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => setOs(platform)}
                className={`px-2.5 py-1 text-[10px] rounded font-mono font-bold uppercase transition-colors ${
                  os === platform
                    ? 'bg-gold-500/10 border border-gold-550/20 text-gold-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Helper Instructions Accordion */}
        <div className="text-[11px] font-sans leading-relaxed text-slate-400 space-y-3 max-h-56 overflow-y-auto pr-1">
          {/* Windows Help */}
          {os === 'windows' && (
            <div className="space-y-2">
              <h3 className="font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span> Windows Execution Directives
              </h3>
              <p>
                1. <strong>Terminal Run:</strong> Paste the copied terminal command into your <code>PowerShell</code> or <code>CMD</code> to trigger the local .exe.
              </p>
              <p>
                2. <strong>URL Scheme Bypass (Highly Recommended):</strong> Some modern apps have URI protocols like <code>slack://</code> or <code>vscode://</code>. If you specify them, clicking the portal will open the local app directly with zero friction.
              </p>
              <p>
                3. <strong>Custom Protocol Maker:</strong> You can configure custom protocol URIs on Windows by adding a key to your Windows Registry (e.g. mapping <code>myApp://</code> to boot a launcher script).
              </p>
            </div>
          )}

          {/* Mac Help */}
          {os === 'mac' && (
            <div className="space-y-2">
              <h3 className="font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span> MacOS Launch Directives
              </h3>
              <p>
                1. <strong>Spotlight Command:</strong> Hit <code>Cmd+Space</code> and run your application directly, or execute <code>open "/Applications/AppName.app"</code> in your Terminal.
              </p>
              <p>
                2. <strong>Direct Protocol Link:</strong> Native MacOS apps like Slate, Slack, Spotify, and Obsidian support custom redirect links (e.g., <code>slack://</code>, <code>obsidian://</code>). Entering these directly will hook into the system launcher instantly.
              </p>
            </div>
          )}

          {/* Linux Help */}
          {os === 'linux' && (
            <div className="space-y-2">
              <h3 className="font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span> Linux / Unix Directives
              </h3>
              <p>
                Type the copied xdg-open script commands into your shell to mount and launch native application portals, or register desktop MIME schemes within <code>~/.local/share/applications</code>.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-slate-900 pt-4 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-mono tracking-wider rounded font-bold bg-gold-500 hover:bg-gold-400 text-slate-950 active:scale-95 transition-all text-center"
          >
            CONFIRM READY
          </button>
        </div>

      </div>
    </div>
  );
}
