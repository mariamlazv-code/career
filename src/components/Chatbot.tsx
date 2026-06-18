import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, RefreshCw, User, Brain, AlertCircle } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatbotProps {
  cvText: string;
  syllabusText: string;
}

export default function Chatbot({ cvText, syllabusText }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "model",
      content: "გამარჯობა! მე ვარ შენი კარიერული მენტორი AI. 🌟 კარიერის მენეჯმენტი და სტუდენტური ვაკანსიების შეთანხმება ჩემი ძლიერი მხარეა.\n\nჩამიგდე შენი CV ან სილაბუსის ტექსტი მარცხენა პანელში, ან უბრალოდ დამისვი კითხვა: როგორ გავაუმჯობესო შენი რეზიუმე, როგორ მოემზადო გასაუბრებისთვის ან რა უნარების განვითარება გჭირდება დასასაქმებლად?",
      timestamp: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          studentProfile: {
            cvText: cvText,
            syllabusText: syllabusText,
            analysisDone: !!(cvText || syllabusText)
          }
        })
      });

      if (!response.ok) {
        throw new Error("სერვერმა დააბრუნა უარყოფითი სტატუსი.");
      }

      const resData = await response.json();
      if (resData.success) {
        setMessages(prev => [
          ...prev,
          {
            id: "msg-ai-" + Date.now(),
            role: "model",
            content: resData.reply,
            timestamp: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error(resData.error || "პასუხის მიღება ვერ მოხერხდა.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("კავშირი ვერ დამყარდა. დარწმუნდით, რომ სერვერი აქტიურია.");
    } finally {
      setLoading(false);
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputVal);
  };

  const selectQuickHint = (hint: string) => {
    handleSendMessage(hint);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "initial-welcome-reset",
        role: "model",
        content: "კარიერული ტრენინგი განახლებულია! 🚀 როგორ შემიძლია დღეს დაგეხმარო?",
        timestamp: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setErrorMsg("");
  };

  const suggestions = [
    "📝 როგორ გავაუმჯობესო ჩემი CV?",
    "💼 რა შეცდომებს უშვებენ სტუდენტები გასაუბრებაზე?",
    "🎓 როგორ მივუდგე სილაბუსის უნარებს CV-ში?"
  ];

  return (
    <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-xl shadow-emerald-50/50 flex flex-col h-[650px] lg:h-[700px]">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Brain className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">კარიერული მენტორი AI</h3>
            <p className="text-[10px] text-emerald-100/85">საკონსულტაციო ჩატბოტი</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="ჩატის გასუფთავება"
          className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-xl transition duration-150 flex items-center gap-1 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">გასუფთავება</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map(msg => {
          const isAi = msg.role === "model";
          return (
            <div key={msg.id} className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-2.5`}>
              {isAi && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 shadow-md shadow-emerald-200">
                  <Brain className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isAi
                    ? "bg-white text-gray-800 border border-slate-100 rounded-tl-none"
                    : "bg-emerald-600 text-white rounded-tr-none"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div className={`text-[9px] mt-1.5 text-right font-mono ${isAi ? "text-gray-400" : "text-emerald-200"}`}>
                  {msg.timestamp}
                </div>
              </div>
              {!isAi && (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 animate-spin">
              <Brain className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-100 text-gray-500 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
              <span className="flex space-x-1">
                <span className="animate-bounce delay-100 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="animate-bounce delay-200 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="animate-bounce delay-300 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              </span>
              <span className="text-xs font-medium font-mono text-emerald-700">მენტორი ფიქრობს...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested chips (show only if story is short) */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
        {suggestions.map((hint, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => selectQuickHint(hint)}
            className="text-[11px] font-medium text-emerald-800 bg-emerald-100/60 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1.5 rounded-full shrink-0 transition duration-150 disabled:opacity-55"
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Input container */}
      <form onSubmit={submitForm} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          disabled={loading}
          placeholder="ჰკითხე მენტორს AI..."
          className="flex-1 text-sm border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none rounded-xl px-3.5 py-2.5 transition duration-150 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition duration-150 disabled:opacity-40 disabled:hover:bg-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
