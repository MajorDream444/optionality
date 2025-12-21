import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppMode } from '../types';
import { ArrowLeft, Image as ImageIcon, Wand2, Upload, Loader2, Download } from 'lucide-react';

interface Props {
  setMode: (m: AppMode) => void;
}

const VisionLab: React.FC<Props> = ({ setMode }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Clean base64 string
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt }
            ]
        }
      });

      // Find image part
      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  const base64Str = part.inlineData.data;
                  setGeneratedImage(`data:image/png;base64,${base64Str}`);
                  foundImage = true;
                  break;
              }
          }
      }
      
      if (!foundImage) {
        console.warn("No image returned, checking text");
        if (response.text) {
             alert(`Model response (no image): ${response.text}`);
        }
      }

    } catch (err) {
      console.error(err);
      alert("Failed to process image. Try a clearer prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 animate-fade-in">
       <div className="flex justify-between items-center mb-8">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-zinc-500 uppercase tracking-widest text-xs">Vision Lab</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Side */}
        <div className="space-y-6">
            <div className="text-left space-y-2">
                <h2 className="text-2xl font-light text-white">Input</h2>
                <p className="text-zinc-400 text-sm">Upload an image and describe the edit.</p>
            </div>

            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                    selectedImage ? 'border-emerald-500/50 bg-zinc-900' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50'
                }`}
            >
                {selectedImage ? (
                    <img src={selectedImage} alt="Original" className="w-full h-full object-contain p-2" />
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-zinc-800 rounded-full inline-flex group-hover:bg-zinc-700 transition-colors">
                            <Upload size={24} className="text-zinc-400" />
                        </div>
                        <p className="text-zinc-500 text-sm uppercase tracking-widest">Click to Upload</p>
                    </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="relative">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='e.g., "Add a retro VHS filter", "Remove the background"'
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-4 pl-4 pr-14 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !selectedImage || !prompt}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-md transition-colors"
                >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                </button>
            </div>
        </div>

        {/* Output Side */}
        <div className="space-y-6">
             <div className="text-left space-y-2">
                <h2 className="text-2xl font-light text-white">Output</h2>
                <p className="text-zinc-400 text-sm">Generated by Gemini 2.5 Flash Image.</p>
            </div>
            
            <div className="relative aspect-square rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
                {generatedImage ? (
                    <>
                    <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                    <a 
                        href={generatedImage} 
                        download="optionality-edit.png"
                        className="absolute bottom-4 right-4 p-3 bg-zinc-900/80 hover:bg-white hover:text-black text-white rounded-full backdrop-blur-sm transition-all shadow-lg"
                    >
                        <Download size={20} />
                    </a>
                    </>
                ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-2">
                         <ImageIcon size={48} className="opacity-20" />
                         <span className="text-xs uppercase tracking-widest opacity-50">Waiting for generation</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VisionLab;