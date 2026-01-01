import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message, Role, BookingDetails } from "../types";
import {
  createChatSession,
  sendMessageWithContext,
} from "../services/geminiService";
import { knowledgeService } from "../services/knowledgeService";
import { Chat } from "@google/genai";
import ChatMessage from "./ChatMessage";
import BookingModal from "./BookingModal";
import SendIcon from "./icons/SendIcon";
import VoiceButton from "./VoiceButton";
import { GenerateContentResponse } from "@google/genai";

const Chatbot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.MODEL,
      text: "Welcome to Metalogics.io. How may I help you today—learn about our services, book a consultation, or explore both options?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = createChatSession();
    if (session) {
      setChat(session);

      // Check knowledge base status
      const stats = knowledgeService.getStats();
      if (!stats.loaded || stats.chunks === 0) {
        console.warn(
          "⚠️ Knowledge base not loaded. Run: npm run build:knowledge:all"
        );
      } else {
        console.log(
          `✅ Knowledge base loaded: ${stats.chunks} chunks from multiple sources`
        );
      }
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: Role.MODEL,
          text: "Error: Gemini API key is not configured. Please set the API_KEY environment variable.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const streamToMessageHandler = useCallback(
    async (stream: AsyncGenerator<GenerateContentResponse>) => {
      let fullResponseText = "";
      let modelMessageIndex = -1;

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponseText += chunkText;

        if (modelMessageIndex === -1) {
          // Create new message on first chunk
          setMessages((prev) => {
            modelMessageIndex = prev.length;
            return [...prev, { role: Role.MODEL, text: fullResponseText }];
          });
        } else {
          // Update existing message
          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages[modelMessageIndex]) {
              newMessages[modelMessageIndex] = {
                role: Role.MODEL,
                text: fullResponseText,
              };
            }
            return newMessages;
          });
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          if (chunk.functionCalls[0].name === "request_booking_info") {
            setIsBookingModalOpen(true);
          }
        }
      }
    },
    []
  );

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading || !chat) return;

      setIsLoading(true);
      const newUserMessage: Message = { role: Role.USER, text: messageText };
      setMessages((prev) => [...prev, newUserMessage]);
      setUserInput("");

      try {
        // Use enhanced message sending with RAG context
        const stream = await sendMessageWithContext(chat, messageText);
        await streamToMessageHandler(stream);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: Role.MODEL,
            text: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, chat, streamToMessageHandler]
  );

  const handleBookingSubmit = async (details: BookingDetails) => {
    setIsBookingModalOpen(false);
    const bookingConfirmation = `Great, the form is submitted with the following details:
        - Name: ${details.name}
        - Company: ${details.company}
        - Email: ${details.email}
        - Phone: ${details.phone}
        - Time: ${details.timeSlot?.startTime.toLocaleString()} for ${
      details.timeSlot?.duration
    } minutes.
        - Inquiry: ${details.inquiry}
        
        I will now confirm the booking.`;

    await handleSendMessage(bookingConfirmation);
  };

  const handleVoiceTranscript = useCallback(
    async (transcript: string, role: "user" | "agent") => {
      // When voice transcript is received, add it to the chat
      console.log(
        `Voice transcript received - Role: ${role}, Text: "${transcript}"`
      );

      if (!transcript || transcript.trim().length === 0) {
        console.log("Skipping empty transcript");
        return;
      }

      setMessages((prev) => {
        const messageRole = role === "user" ? Role.USER : Role.MODEL;
        const lastMsg = prev[prev.length - 1];

        // Check if we should update the last message or create a new one
        if (
          lastMsg &&
          lastMsg.role === messageRole &&
          lastMsg.source === "voice"
        ) {
          // If the transcript is different, update it (handles streaming updates)
          if (lastMsg.text !== transcript) {
            console.log(
              `Updating last ${role} message from "${lastMsg.text}" to "${transcript}"`
            );
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: messageRole,
              text: transcript,
              source: "voice",
            };
            return updated;
          }
          // Same content, no update needed
          console.log(`Skipping duplicate transcript for ${role}`);
          return prev;
        }

        // Add new message
        console.log(`Adding new ${role} message: "${transcript}"`);
        return [
          ...prev,
          {
            role: messageRole,
            text: transcript,
            source: "voice",
          },
        ];
      });

      // If this is a user message and we have a chat session,
      // also send it through Gemini for context continuity
      // (The voice AI will handle the actual response, but this keeps the chat in sync)
      if (role === "user" && chat) {
        console.log("Syncing voice message with Gemini chat context");
        try {
          // Send to Gemini but don't display the response (voice AI handles that)
          await chat.sendMessage({ message: transcript });
        } catch (error) {
          console.error("Error syncing voice message with Gemini:", error);
        }
      }
    },
    [chat]
  );

  return (
    <>
      <div
        ref={chatContainerRef}
        className="flex-grow p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent to-black/5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.3) transparent",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={`msg-${index}-${msg.text.substring(0, 20)}`}
            className="animate-message-appear"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ChatMessage message={msg} />
          </div>
        ))}
        {isLoading && messages[messages.length - 1].role === Role.USER && (
          <div className="flex justify-start items-center space-x-3 animate-fade-in">
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm text-white/80 font-medium">
                AI is thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border-t border-white/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(userInput);
          }}
          className="flex items-center space-x-4"
        >
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            disabled={isLoading || !chat}
          />
          <div className="flex-grow relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message or use voice..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:outline-none transition-all duration-200 hover:bg-white/15"
              disabled={isLoading || !chat}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !chat}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl p-4 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            aria-label="Send message"
            title="Send message"
          >
            <SendIcon />
          </button>
        </form>

        <div className="flex items-center justify-center mt-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span>Secure • End-to-end encrypted</span>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookingSubmit}
      />

      <style jsx>{`
        @keyframes message-appear {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-message-appear {
          animation: message-appear 0.5s ease-out forwards;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Chatbot;
