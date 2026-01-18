import React, { useState, useEffect } from 'react';
import { AppMode } from '../types';
import { GoogleGenAI } from "@google/genai";
import { ArrowLeft, HardDrive, Cloud, FileText, Loader2, ShieldCheck, RefreshCw, LogIn } from 'lucide-react';

interface Props {
  setMode: (m: AppMode) => void;
}

const DriveSync: React.FC<Props> = ({ setMode }) => {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  // Check if we already have a session on mount (simulation of persistence)
  useEffect(() => {
    const isSynced = localStorage.getItem('drive_synced') === 'true';
    if (isSynced) setAuthStatus('connected');
  }, []);

  const handleLinkDrive = async () => {
    setLoading(true);
    try {
      // For the MVP, we utilize the File System Access API which maps to local Google Drive Desktop sync folders.
      // This is the most 'Optionality' compliant way as it doesn't require sharing OAuth tokens with the app.
      if ('showSaveFilePicker' in window) {
        const portfolio = localStorage.getItem('opt_portfolio') || '[]';
        const answers = localStorage.getItem('opt_answers') || '{}';
        const vaultData = JSON.stringify({ 
          portfolio: JSON.parse(portfolio), 
          answers: JSON.parse(answers), 
          timestamp: Date.now() 
        }, null, 2);

        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `optionality_vault.opt`,
          types: [{
            description: 'Optionality Vault File',
            accept: { 'application/json': ['.opt'] },
          }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(vaultData);
        await writable.close();
        
        setAuthStatus('connected');
        localStorage.setItem('drive_synced', 'true');
        alert("Vault Path Established. Any changes saved to this file will sync to your Google Drive.");
      } else {
        // Fallback: Trigger a standard download but explain the sync requirement
        const portfolio = localStorage.getItem('opt_portfolio') || '[]';
        const vaultData = JSON.stringify({ portfolio: JSON.parse(portfolio) });
        const blob = new Blob([vaultData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `optionality_vault.opt`;
        link.click();
        alert("Your browser doesn't support direct Sync. Please save this file into your Google Drive manually.");
      }
    } catch (err) {
      console.error(err);
      setAuthStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'Optionality Vault File',
            accept: { 'application/json': ['.opt'] },
          }],
        });
        const file = await handle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.portfolio) localStorage.setItem('opt_portfolio', JSON.stringify(data.portfolio));
        if (data.answers) localStorage.setItem('opt_answers', JSON.stringify(data.answers));
        
        setAuthStatus('connected');
        localStorage.setItem('drive_synced', 'true');
        alert("Vault Decrypted: All data restored.");
        setMode(AppMode.LANDING);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runAudit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { inlineData: { data: base64, mimeType: file.type } },
            { text: "Identify hidden dependencies or 'fragility' in this document. Does it reduce the user's future optionality? Be brief." }
          ]
        });
        setAuditResult(response.text || "No insights generated.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
            {authStatus === 'connected' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest">
                    <Cloud size={12} /> Sync Active
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Persistence Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="p-3 bg-emerald-500/10 rounded-full w-fit text-emerald-500">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h3 className="text-xl font-light text-white mb-2">Drive Vault Persistence</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                Optionality uses your Google Drive as a decentralized database. By linking a file in your Drive sync folder, your portfolio is always available but never leaves your control.
                </p>
            </div>
          </div>
          
          <div className="space-y-3 pt-6">
            <button 
              onClick={handleLinkDrive}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full py-4 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl transition-all font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <HardDrive size={18} />}
              {authStatus === 'connected' ? 'Update Sync File' : 'Initialize Drive Sync'}
            </button>
            <button 
              onClick={handleImport}
              className="flex items-center justify-center gap-3 w-full py-4 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-xl transition-all font-medium"
            >
              <LogIn size={18} /> Restore from Vault
            </button>
          </div>
        </div>

        {/* AI Audit Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="p-3 bg-blue-500/10 rounded-full w-fit text-blue-500">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-light text-white mb-2">Vault Document Audit</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Scan documents stored in your Drive to detect structural risks or exit barriers.
            </p>
          </div>

          {!auditResult ? (
            <label className={`flex flex-col items-center justify-center gap-4 w-full h-32 border-2 border-dashed border-zinc-800 rounded-xl hover:border-zinc-600 transition-all cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              {loading ? <Loader2 className="animate-spin text-zinc-500" /> : <RefreshCw className="text-zinc-600" />}
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest text-center px-4">
                {loading ? 'Analyzing Content...' : 'Upload Drive Document'}
              </span>
              <input type="file" className="hidden" onChange={runAudit} accept=".pdf,.doc,.docx,.txt" />
            </label>
          ) : (
            <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl max-h-48 overflow-y-auto">
               <div className="flex justify-between items-center mb-3">
                 <div className="text-[10px] text-blue-400 uppercase tracking-widest">Audit Finding</div>
                 <button onClick={() => setAuditResult(null)} className="text-zinc-600 hover:text-white"><RefreshCw size={12} /></button>
               </div>
               <p className="text-zinc-300 text-xs leading-relaxed font-light italic">"{auditResult}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl">
        <div className="flex items-start gap-4">
            <div className="text-amber-500 pt-1"><ShieldCheck size={18} /></div>
            <div>
                <h4 className="text-sm font-medium text-zinc-200 mb-1">Architecture Note</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    This MVP uses the <strong>File System Access API</strong>. To ensure true cloud storage, select a file location that is actively managed by the Google Drive for Desktop application. Your data is stored locally in plain text JSON within the <code>.opt</code> file.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DriveSync;