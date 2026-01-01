import React from "react";
import Chatbot from "./Chatbot";

const WidgetApp: React.FC = () => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Subtle background elements for widget */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Widget Header - Compact for embedded use */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface - Optimized for widget */}
      <main className="flex-grow flex flex-col bg-white/5 backdrop-blur-xl overflow-hidden relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <Chatbot />
      </main>

      <style jsx>{`
        /* Widget-specific styles */
        .h-screen {
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile */
        }

        /* Ensure proper scrolling in widget */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        *::-webkit-scrollbar {
          width: 4px;
        }

        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default WidgetApp;
