import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { AppMode } from '../types';
import { ArrowLeft, Send, Sparkles, User } from 'lucide-react';

interface Props {
  setMode: (m: AppMode) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC<Props> = ({ setMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "I am ready to explore your constraints and options. What is on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Chat
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const resultStream = await chatRef.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponse += c.text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].text = fullResponse;
            return newArr;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[85vh] flex flex-col p-4 md:p-8 animate-fade-in relative">
       <div className="absolute top-6 left-6 z-10">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pt-12 pb-24 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Sparkles size={14} className="text-emerald-500" />
              </div>
            )}
            
            <div className={`max-w-[80%] p-4 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
                : 'bg-transparent text-zinc-300'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-2 last:mb-0">{line}</p>
              ))}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                <User size={14} className="text-zinc-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
           <div className="flex gap-4 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0" />
            <div className="h-10 w-24 bg-zinc-900 rounded-lg"></div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-zinc-950 to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a strategic question..."
            className="w-full bg-zinc-900/90 border border-zinc-700 rounded-full py-4 pl-6 pr-14 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-lg backdrop-blur-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;