import { useEffect, useRef, useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import { uploadChatImage, streamChatMessage } from "../../services/api/chat";
import { useChatModels } from "../useFinanceData";
import type { Model } from "../../interfaces/model-interface";
import type { Message } from "../../interfaces/chat/message-interface";
import type { MCPServer } from "../../types/mcp-server-type";
import { resizeImage } from "../../utils/chat/image";

export const useChatSession = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer>("GLOBAL");
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingError, setStreamingError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>("");

  // Use react-query for models to cache them across page navigations
  const { data: modelsResponse, isLoading: isLoadingModels, error: modelsError } = useChatModels();
  const models = useMemo(() => modelsResponse?.data || [], [modelsResponse]);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("chat_session_id");
    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
      return;
    }

    const newSessionId = crypto.randomUUID();
    sessionIdRef.current = newSessionId;
    sessionStorage.setItem("chat_session_id", newSessionId);
  }, []);

  // Set selected model when models load or change
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const freeModels = models.filter((m: Model) => m.id.endsWith("-free"));

      if (freeModels.length > 0) {
        const randomFreeModel = freeModels[Math.floor(Math.random() * freeModels.length)];
        setSelectedModel(randomFreeModel);
      } else {
        setSelectedModel(models[0]);
      }
    }
  }, [models, selectedModel]);

  // Set error when models fail to load
  useEffect(() => {
    if (modelsError) {
      console.error("Failed to load models:", modelsError);
      setError("Failed to load available models");
    }
  }, [modelsError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".model-dropdown-container") && !target.closest(".server-dropdown-container")) {
        setShowModelDropdown(false);
        setShowServerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (inputText?: string) => {
    const messageText = inputText !== undefined ? inputText : input;
    if ((!messageText.trim() && uploadedImages.length === 0) || !selectedModel) return;

    setError(null);
    setStreamingError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImages([]);

    if (uploadedFiles.length > 0) {
      try {
        for (const file of uploadedFiles) {
          await uploadChatImage(sessionIdRef.current, file);
        }
      } catch (err) {
        console.error("Failed to upload images:", err);
        setError("Failed to upload images. Please try again.");
        return;
      }
    }
    setUploadedFiles([]);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "", toolCalls: [], isStreaming: true }]);
    setIsStreaming(true);

    let receivedContent = false;
    let localStreamingError: string | null = null;

    try {
      let accumulatedContent = "";
      await streamChatMessage(sessionIdRef.current, messageText, selectedModel.id, selectedServer, {
        onStart: () => {
          receivedContent = true;
        },
        onTextDelta: (_id: string, text: string) => {
          receivedContent = true;
          accumulatedContent += text;
          setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: accumulatedContent, isStreaming: true } : msg)));
        },
        onToolInputStart: (toolCallId: string, toolName: string) => {
          setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, toolCalls: [...(msg.toolCalls || []), { id: toolCallId, name: toolName, input: "", output: undefined }] } : msg)));
        },
        onToolInputDelta: (toolCallId: string, inputText: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    toolCalls: (msg.toolCalls || []).map((tc) => (tc.id === toolCallId ? { ...tc, input: (tc.input || "") + inputText } : tc)),
                  }
                : msg
            )
          );
        },
        onToolInputAvailable: (toolCallId: string, toolName: string, toolInput: Record<string, unknown>) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    toolCalls: (msg.toolCalls || []).map((tc) => (tc.id === toolCallId ? { ...tc, name: toolName, input: JSON.stringify(toolInput) } : tc)),
                  }
                : msg
            )
          );
        },
        onToolOutputAvailable: (toolCallId: string, output: unknown) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    toolCalls: (msg.toolCalls || []).map((tc) => (tc.id === toolCallId ? { ...tc, output } : tc)),
                  }
                : msg
            )
          );
        },
        onFinish: () => {
          setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg)));
        },
        onError: (streamError: string) => {
          localStreamingError = streamError;
          setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg)));
          setStreamingError(streamError);
        },
      });
    } catch (err) {
      console.error("Failed to stream message:", err);
    } finally {
      setIsStreaming(false);
      if (!receivedContent && !localStreamingError) {
        setStreamingError("An error has occurred");
      }
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      setUploadedFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const resizedImage = await resizeImage(event.target.result as string);
            setUploadedImages((prev) => [...prev, resizedImage]);
          } catch (err) {
            console.error("Failed to resize image:", err);
            setUploadedImages((prev) => [...prev, event.target!.result as string]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    messages,
    input,
    models,
    selectedModel,
    showModelDropdown,
    selectedServer,
    showServerDropdown,
    uploadedImages,
    isStreaming,
    error,
    streamingError,
    isLoadingModels,
    setInput,
    setShowModelDropdown,
    setSelectedServer,
    setShowServerDropdown,
    setSelectedModel,
    handleSend,
    handleImageUpload,
    removeImage,
    isSendEnabled: (input.trim().length > 0 || uploadedImages.length > 0) && !!selectedModel && !isStreaming && !isLoadingModels,
  };
};
