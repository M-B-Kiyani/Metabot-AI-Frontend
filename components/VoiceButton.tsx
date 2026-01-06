import React, { useState, useEffect, useRef } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

interface VoiceButtonProps {
  onTranscript?: (text: string, role: "user" | "agent") => void;
  agentId?: string;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  agentId = import.meta.env.VITE_RETELL_AGENT_ID ||
    "your_retell_agent_id_heredb",
  disabled = false,
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    // Initialize Retell client
    retellClientRef.current = new RetellWebClient();

    // Set up event listeners
    const client = retellClientRef.current;

    client.on("call_started", () => {
      console.log("Call started");
      setIsCallActive(true);
      setIsConnecting(false);
      setError(null);
    });

    client.on("call_ended", () => {
      console.log("Call ended");
      setIsCallActive(false);
      setIsConnecting(false);
    });

    client.on("agent_start_talking", () => {
      console.log("Agent started talking");
    });

    client.on("agent_stop_talking", () => {
      console.log("Agent stopped talking");
    });

    client.on("audio", (audio: Uint8Array) => {
      // Audio data received
      console.log("Audio data received:", audio.length);
    });

    client.on("update", (update: any) => {
      // Transcript updates - log full structure for debugging
      console.log(
        "Retell update event received:",
        JSON.stringify(update, null, 2)
      );

      if (
        update.transcript &&
        Array.isArray(update.transcript) &&
        onTranscript
      ) {
        // Process each transcript entry
        update.transcript.forEach((entry: any, index: number) => {
          console.log(`Transcript entry ${index}:`, {
            role: entry.role,
            content: entry.content,
          });
        });

        // Get the last message
        const lastMessage = update.transcript[update.transcript.length - 1];
        if (lastMessage && lastMessage.content) {
          const role = lastMessage.role === "user" ? "user" : "agent";
          console.log(
            `Sending transcript to chat: [${role}] ${lastMessage.content}`
          );
          onTranscript(lastMessage.content, role);
        }
      }
    });

    client.on("error", (error: any) => {
      console.error("Retell error:", error);
      setError(error.message || "An error occurred");
      setIsCallActive(false);
      setIsConnecting(false);
    });

    return () => {
      // Cleanup
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, [onTranscript]);

  const startCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if we're in an iframe context
      const isInIframe = window !== window.parent;

      // Request microphone permission first
      console.log("Requesting microphone permission...");
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            isInIframe
              ? "Microphone not available in iframe. Please open widget in new window."
              : "Microphone not supported in this browser."
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        stream.getTracks().forEach((track) => track.stop()); // Stop the test stream
        console.log("Microphone permission granted");
      } catch (permErr: any) {
        console.error("Microphone permission error:", permErr);

        let errorMessage = "Microphone access denied.";

        if (isInIframe) {
          errorMessage =
            "Microphone blocked in iframe. Try opening widget in new window.";
        } else if (permErr.name === "NotAllowedError") {
          errorMessage = "Please allow microphone access and try again.";
        } else if (permErr.name === "NotFoundError") {
          errorMessage = "No microphone found. Please connect a microphone.";
        } else if (permErr.name === "NotSupportedError") {
          errorMessage = "Microphone not supported in this browser.";
        }

        throw new Error(errorMessage);
      }

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        "https://metabot-ai-backend-production.up.railway.app";

      console.log("Registering call with backend...", { apiBaseUrl, agentId });

      // Register call with backend
      const response = await fetch(`${apiBaseUrl}/api/retell/register-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          sessionId: `web-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to register call: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Backend registration failed:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error("Backend registration failed:", errorText);
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Call registered successfully:", { callId: data.callId });

      if (!data.success || !data.accessToken) {
        throw new Error("Invalid response from server");
      }

      // Start the call with Retell
      console.log("Starting Retell call with access token...");
      await retellClientRef.current?.startCall({
        accessToken: data.accessToken,
        sampleRate: 24000, // Explicitly set sample rate
      });

      console.log("Retell call started successfully");
    } catch (err) {
      console.error("Error starting call:", err);
      setError(err instanceof Error ? err.message : "Failed to start call");
      setIsConnecting(false);
    }
  };

  const stopCall = () => {
    retellClientRef.current?.stopCall();
    setIsCallActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={isCallActive ? stopCall : startCall}
        disabled={isConnecting || disabled}
        className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
          isCallActive
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse shadow-red-500/30"
            : isConnecting
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 cursor-wait shadow-yellow-500/30"
            : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30"
        } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        title={
          isCallActive
            ? "End voice call"
            : isConnecting
            ? "Connecting..."
            : "Start voice call"
        }
        aria-label={
          isCallActive
            ? "End voice call"
            : isConnecting
            ? "Connecting to voice"
            : "Start voice call"
        }
      >
        {/* Ripple effect for active call */}
        {isCallActive && (
          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping"></div>
        )}

        {isConnecting ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isCallActive ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>

      {/* Status indicators */}
      {error && (
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-200 max-w-xs text-center">
          <div className="mb-1">{error}</div>
          {error.includes("iframe") && (
            <button
              onClick={() => {
                window.open(
                  "https://metabot-ai-frontend-production.up.railway.app/widget",
                  "_blank",
                  "width=400,height=600,scrollbars=yes,resizable=yes"
                );
              }}
              className="mt-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs transition-colors"
            >
              Open in New Window
            </button>
          )}
        </div>
      )}

      {isCallActive && !error && (
        <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl px-3 py-2 text-xs text-green-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">Live Call</span>
        </div>
      )}

      {isConnecting && (
        <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-yellow-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <span className="font-medium">Connecting...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
