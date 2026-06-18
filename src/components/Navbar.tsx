import { GraduationCap, Sparkles, BookOpen, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center shadow-emerald-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
              CareerNavigator <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">AI</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">სტუდენტების კარიერული ასისტენტი</p>
          </div>
        </div>

        {/* Info badges */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-xs text-gray-600 bg-emerald-50/70 border border-emerald-100 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="font-medium">Google Search Grounding ჩართულია</span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-600 bg-emerald-50/70 border border-emerald-100 px-3 py-1.5 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">სილაბუსის + CV სკანერი</span>
          </div>
        </div>

        {/* Student Profile Identity Indicator */}
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-gray-700">სტუდენტი მენტორი</span>
        </div>
      </div>
    </header>
  );
}
