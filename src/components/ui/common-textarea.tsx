"use client";

import { forwardRef, useRef, useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { SendIcon, MicIcon, MicOffIcon, PaperclipIcon } from "lucide-react";
import { useAutosizeTextArea } from "~/hooks/use-autosize-textarea";
import { AudioVisualizer } from "./audio-visualizer";
import {
  PromptInputToolbar,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
} from "~/components/ui/shadcn-io/ai/prompt-input";

interface Model {
  id: string;
  label: string;
  description: string;
}

interface CommonTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showSubmitButton?: boolean;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  // Model selection props
  models?: Model[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showModelSelector?: boolean;
  // Audio props
  showAudioButton?: boolean;
  onAudioTranscription?: (text: string) => void;
  // File upload props
  showFileUpload?: boolean;
  onFileUpload?: (files: FileList) => void;
  acceptedFileTypes?: string;
}

export const CommonTextarea = forwardRef<
  HTMLTextAreaElement,
  CommonTextareaProps
>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder = "Type your message...",
      disabled = false,
      isLoading = false,
      showSubmitButton = true,
      minHeight = 120,
      maxHeight = 200,
      className = "",
      models = [],
      selectedModel,
      onModelChange,
      showModelSelector = false,
      showAudioButton = false,
      onAudioTranscription,
      showFileUpload = false,
      onFileUpload,
      acceptedFileTypes = "*",
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useAutosizeTextArea({
      ref: textareaRef,
      maxHeight,
      dependencies: [value],
    });

    // Audio recording functions
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setAudioStream(stream);
        setIsRecording(true);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          // Here you would typically send the audio to a speech-to-text service
          // For now, we'll just add a placeholder transcription
          if (onAudioTranscription) {
            onAudioTranscription(
              "This is a placeholder transcription from audio recording.",
            );
          }
          setIsRecording(false);
          setAudioStream(null);
        };

        mediaRecorder.start();
      } catch (error) {
        console.error("Error starting recording:", error);
        setIsRecording(false);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop());
        }
      }
    };

    const handleAudioClick = () => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    const handleFileUpload = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onFileUpload) {
        onFileUpload(files);
      }
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && !isLoading && value.trim()) {
          onSubmit();
        }
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!disabled && !isLoading && value.trim()) {
        onSubmit();
      }
    };

    return (
      <div className={`relative ${className}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="relative"
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className={`min-h-[${minHeight}px] resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-base shadow-lg focus:border-purple-500 focus:ring-0`}
            disabled={disabled || isLoading}
            {...props}
          />

          {/* Bottom Controls Container */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-2">
            {/* Audio Button/Visualizer */}
            {showAudioButton && (
              <div className="h-8 w-8">
                {isRecording ? (
                  <AudioVisualizer
                    stream={audioStream}
                    isRecording={isRecording}
                    onClick={handleAudioClick}
                  />
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAudioClick}
                    disabled={disabled || isLoading}
                    className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <MicIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* File Upload Button */}
            {showFileUpload && (
              <Button
                type="button"
                size="icon"
                onClick={handleFileUpload}
                disabled={disabled || isLoading}
                className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
            )}
            {/* Model Selector - Integrated with bottom controls */}

            {showModelSelector &&
              selectedModel &&
              onModelChange &&
              models.length > 0 && (
                <div className="flex items-center">
                  <PromptInputToolbar>
                    <PromptInputModelSelect
                      value={selectedModel}
                      onValueChange={onModelChange}
                    >
                      <PromptInputModelSelectTrigger className="h-8 w-21 text-xs">
                        <PromptInputModelSelectValue>
                          {models.find((model) => model.id === selectedModel)
                            ?.label || "Select model"}
                        </PromptInputModelSelectValue>
                      </PromptInputModelSelectTrigger>
                      <PromptInputModelSelectContent>
                        {models.map((model) => (
                          <PromptInputModelSelectItem
                            key={model.id}
                            value={model.id}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{model.label}</span>
                              <span className="text-muted-foreground text-xs">
                                {model.description}
                              </span>
                            </div>
                          </PromptInputModelSelectItem>
                        ))}
                      </PromptInputModelSelectContent>
                    </PromptInputModelSelect>
                  </PromptInputToolbar>
                </div>
              )}
          </div>

          {/* Hidden File Input */}
          {showFileUpload && (
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload files"
            />
          )}

          {/* Submit Button - Right Bottom Corner */}
          {showSubmitButton && (
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim() || disabled || isLoading}
              className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          )}
        </form>
      </div>
    );
  },
);

CommonTextarea.displayName = "CommonTextarea";
