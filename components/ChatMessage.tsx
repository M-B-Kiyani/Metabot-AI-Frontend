import React from "react";
import { Message, Role } from "../types";
import BotIcon from "./icons/BotIcon";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;
  const isVoice = message.source === "voice";

  return (
    <div
      className={`flex items-start gap-4 ${
        isModel ? "justify-start" : "justify-end"
      } group`}
    >
      {isModel && (
        <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
          <BotIcon />
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[75%] md:max-w-[65%]">
        <div
          className={`relative p-4 rounded-2xl whitespace-pre-wrap transition-all duration-200 group-hover:shadow-lg ${
            isModel
              ? "bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-tl-md shadow-md"
              : "bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md shadow-lg"
          }`}
        >
          {/* Message content */}
          <div className="relative z-10">{message.text}</div>

          {/* Subtle gradient overlay for bot messages */}
          {isModel && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
          )}

          {/* Message tail */}
          <div
            className={`absolute w-3 h-3 ${
              isModel
                ? "left-0 top-4 -translate-x-1 bg-white/10 border-l border-t border-white/20"
                : "right-0 bottom-4 translate-x-1 bg-gradient-to-r from-purple-500 to-blue-500"
            } rotate-45 rounded-tl-sm`}
          ></div>
        </div>

        {/* Message metadata */}
        <div
          className={`flex items-center gap-2 text-xs text-white/60 ${
            isModel ? "justify-start ml-2" : "justify-end mr-2"
          }`}
        >
          {isVoice && (
            <>
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Voice</span>
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            </>
          )}
          <span className="font-medium">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {!isModel && (
        <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
