import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage, Doctor } from '../types';
import { useNavigate } from 'react-router-dom';

const SYSTEM_PROMPT = `You are a medical assistant chatbot for MediConnect AI. 
Your goal is to help patients find the right doctor specialization based on their symptoms.
Guidelines:
1. Ask clear questions about their symptoms.
2. Analyze symptoms and map them to: General Physician, Cardiologist, Neurologist, or Dermatologist.
3. Suggest the specialization clearly.
4. IMPORTANT: Do not provide real medical advice or diagnoses. Always include a disclaimer.
5. Keep responses concise and empathetic.
6. When you identify a specialization, format it as: "RECOMMENDATION: [Specialization]" so the app can filter doctors.

Example Mappings:
- Fever, cold, cough, general pain -> General Physician
- Chest pain, palpitations, high blood pressure -> Cardiologist
- Headaches, seizures, numbness, memory loss -> Neurologist
- Rashes, acne, skin patches, itching -> Dermatologist
`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm your AI health assistant. Tell me, what symptoms are you experiencing today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpen);
    return () => window.removeEventListener('open-chat', handleOpen);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
           systemInstruction: SYSTEM_PROMPT
        }
      });

      const response = await chat.sendMessage({
        message: userMsg
      });

      const aiContent = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);

      // Check for recommendation
      if (aiContent.includes("RECOMMENDATION:")) {
        const spec = aiContent.split("RECOMMENDATION:")[1].trim().split(/[.!?\n]/)[0].trim();
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `I've found some specialists in ${spec} for you. [Click here to view doctors](/doctors?specialization=${encodeURIComponent(spec)})` 
            }]);
        }, 1000);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[520px] glass rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white"
          >
            {/* Header */}
            <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">AI Assistant</h3>
                  <p className="text-blue-100 text-xs font-medium">Online & ready to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/30">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50'
                    }`}>
                      {msg.content.includes("[Click here") ? (
                          <>
                            {msg.content.split("[")[0]}
                            <button 
                                onClick={() => {
                                    const url = msg.content.match(/\((.*?)\)/)?.[1];
                                    if (url) navigate(url);
                                    setIsOpen(false);
                                }}
                                className="mt-3 block w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                View Recommended Doctors
                            </button>
                          </>
                      ) : msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200/50 flex gap-1 items-center">
                      <p className="text-sm text-slate-500 italic mr-2">Analyzing...</p>
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-white/50 border-t border-slate-100/50">
                <div className="flex flex-wrap gap-2 mb-4">
                    {['Chest pain', 'Skin rash', 'Stomach ache'].map((reply) => (
                        <button
                            key={reply}
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1.5 text-[10px] bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            "{reply}"
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type symptoms..."
                        className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-5 pr-14 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isTyping || !input.trim()}
                        className="absolute right-2 top-1.5 w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center shadow-lg shadow-blue-100"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <AlertCircle size={10} />
                    AI recommendations are not formal diagnoses.
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center group overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={28} />
              <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
