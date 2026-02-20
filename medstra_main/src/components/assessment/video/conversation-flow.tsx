"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationFlowProps {
  onResponse: (response: string) => void;
  currentQuestion: string;
  isListening?: boolean;
}

export function ConversationFlow({ 
  onResponse, 
  currentQuestion,
  isListening 
}: ConversationFlowProps) {
  const [inputMethod, setInputMethod] = useState<"voice" | "text">("voice");
  const [textInput, setTextInput] = useState("");

  return (
    <div className="rounded-lg border bg-card p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {/* Question Display */}
          <div className="text-lg font-medium">{currentQuestion}</div>

          {/* Input Methods */}
          <div className="flex gap-4">
            <div className="flex-1">
              {inputMethod === "voice" ? (
                <Button
                  variant={isListening ? "default" : "outline"}
                  className="w-full gap-2"
                  onClick={() => {/* Toggle voice recognition */}}
                >
                  {isListening ? (
                    <>
                      <Mic className="h-4 w-4 animate-pulse" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <MicOff className="h-4 w-4" />
                      Click to Speak
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your response..."
                  />
                  <Button onClick={() => onResponse(textInput)}>Send</Button>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setInputMethod(inputMethod === "voice" ? "text" : "voice")}
            >
              {inputMethod === "voice" ? (
                <MessageCircle className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 