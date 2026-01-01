import React from "react";
import Chatbot from "./components/Chatbot";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="w-full max-w-4xl h-[95vh] flex flex-col relative z-10">
        <header className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Metalogics AI
            </h1>
          </div>
          <p className="text-slate-300 text-lg font-medium">
            Your intelligent assistant for seamless conversations and smart
            solutions
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI Assistant Online</span>
          </div>
        </header>

        <main className="flex-grow flex flex-col bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <Chatbot />
        </main>

        <footer
          className="text-center mt-6 text-sm text-slate-400 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-white">
                Powered by Metalogics
              </span>
              <span className="text-slate-500">|</span>
              <span>&copy; 2025-26</span>
            </p>
            <a
              href="https://metalogics.io/"
              className="text-purple-300 hover:text-purple-200 transition-colors duration-200 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              metalogics.io
            </a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
