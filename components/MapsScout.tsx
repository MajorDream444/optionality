import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppMode } from '../types';
import { ArrowLeft, MapPin, Search, ExternalLink } from 'lucide-react';

interface Props {
  setMode: (m: AppMode) => void;
}

const MapsScout: React.FC<Props> = ({ setMode }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [mapLinks, setMapLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setMapLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Attempt to get location for grounding
      let locationConfig = {};
      try {
         const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
         });
         locationConfig = {
            toolConfig: {
              googleSearchRetrieval: {
                  dynamicRetrievalConfig: {
                      mode: 'MODE_DYNAMIC',
                      dynamicThreshold: 0.7,
                  }
              },
               retrievalConfig: {
                 latLng: {
                   latitude: pos.coords.latitude,
                   longitude: pos.coords.longitude
                 }
               }
             }
         };
      } catch (e) {
        console.warn("Location access denied or timed out, proceeding without local context.");
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleMaps: {} }],
          ...locationConfig
        }
      });

      if (response.text) {
        setResult(response.text);
      }

      // Extract Maps Links
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks
        .filter((c: any) => c.web?.uri || c.maps?.uri)
        .map((c: any) => ({
             title: c.web?.title || c.maps?.title || "View on Map",
             uri: c.web?.uri || c.maps?.uri
        }));
      
      setMapLinks(links);

    } catch (err) {
      console.error(err);
      setResult("Unable to retrieve location data at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-12 animate-fade-in">
       <div className="flex justify-between items-center mb-12">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-zinc-500 uppercase tracking-widest text-xs">Maps Scout</div>
      </div>

      <div className="space-y-8">
        <div className="text-center space-y-4">
            <h2 className="text-3xl font-light text-white">Location Intelligence</h2>
            <p className="text-zinc-400">Find hubs, resources, and safe havens vetted by real-time data.</p>
        </div>

        <div className="relative">
             <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., Co-working spaces in Lisbon with fiber internet..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-4 pl-12 pr-4 text-white focus:border-emerald-500 focus:outline-none transition-colors"
             />
             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
             <button 
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors disabled:opacity-50"
             >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
             </button>
        </div>

        {(result || mapLinks.length > 0) && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
                {result && (
                    <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
                         {result.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                )}
                
                {mapLinks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
                        {mapLinks.map((link, idx) => (
                            <a 
                                key={idx} 
                                href={link.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                            >
                                <div className="p-2 rounded-full bg-zinc-900 text-emerald-500 group-hover:scale-110 transition-transform">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm text-zinc-300 truncate flex-1">{link.title}</span>
                                <ExternalLink size={14} className="text-zinc-600 group-hover:text-white" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MapsScout;