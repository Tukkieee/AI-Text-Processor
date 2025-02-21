import React from "react";
import { ImSpinner6 } from "react-icons/im";
import { MdKeyboardArrowDown } from "react-icons/md";

export const ActionButtons = ({
  messages,
  messageContent,
  setmessageContent,
  supportedLanguages,
  msg,
  setSelectedMessageId,
  setshowModal,
}) => {
  // translate message
  const handleTranslate = async (messageId, sourceLanguage, targetLanguage) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return;
    if (!sourceLanguage || !targetLanguage) {
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError: "Missing source or target language.",
        },
      }));
      return;
    }

    // Check if browser supports translation API
    if (!('ai' in self && 'translator' in self.ai)) {
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError: "Your browser doesn't support the Translation API. Please update or switch to a compatible browser.",
        },
      }));
      return;
    }

    if (!messageContent[messageId]?.isSupported) {
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError:
            "Translation is not available for unsupported languages.",
        },
      }));
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError: "Source and target languages cannot be the same.",
        },
      }));
      return;
    }

    // Check if language pair is available
    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const pairAvailability = await translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);
      
      if (pairAvailability !== 'readily') {
        setmessageContent((prev) => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            isTranslating: false,
            translationError: "This language pair is currently not supported for translation.",
          },
        }));
        return;
      }

      // Reset any previous translation errors
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: true,
          translationError: null,
        },
      }));

      const translator = await self.ai.translator.create({
        sourceLanguage,
        targetLanguage,
      });

      const result = await translator.translate(message.text);
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          translatedText: result,
          translatedToLanguage: targetLanguage,
          isOpen: false,
          isTranslating: false,
          translationError: null,
        },
      }));
    } catch (error) {
      console.error("Translation error:", error);
      setmessageContent((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isTranslating: false,
          translationError: `Something went wrong translating your message. Please try again.`,
        },
      }));
    }
  };

  // toggle target language dropdown (open/close)
  const toggleDropdown = (messageId) => {
    // Close all other dropdowns first
    setmessageContent((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((id) => {
        if (id !== messageId) {
          newState[id] = { ...newState[id], isOpen: false };
        }
      });
      newState[messageId] = {
        ...newState[messageId],
        isOpen: !newState[messageId].isOpen,
      };
      return newState;
    });
  };

  // handle language select
  const handleLanguageSelect = (messageId, language) => {
    setmessageContent((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        selectedLanguage: language,
        isOpen: false,
      },
    }));
  };

  return (
    <div
      className="mt-3 pt-3 border-t border-indigo-500/10 flex items-center gap-2 justify-between flex-wrap"
      role="region"
      aria-label="Message actions"
    >
      {/* Language Detection Section */}
      <div role="status" aria-live="polite">
        {messageContent[msg.id]?.isDetecting ? (
            <ImSpinner6 className="animate-spin text-white text-2xl" />
        ) : messageContent[msg.id]?.detectionError ? (
          <span className="text-xs text-red-400 font-medium" role="alert">
            {messageContent[msg.id].detectionError}
          </span>
        ) : (
          messageContent[msg.id]?.detectedLanguageLabel && (
            <span className="text-xs text-green-300/70 font-medium">
              Detected language: {messageContent[msg.id]?.detectedLanguageLabel}
            </span>
          )
        )}
      </div>
      <div className="flex items-center flex-wrap gap-2">
        {/* Translate Dropdown and Button */}
        <div className="relative flex items-center flex-wrap gap-2">
          {/* dropdown toggle button */}
          <button
            className="dropdown-toggle text-xs text-white font-medium bg-blue-500/70 px-3 py-2 rounded-lg border border-blue-400/20 shadow-[0_0_15px_-3px] shadow-blue-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-blue-400/40 hover:from-cyan-400/70 hover:to-blue-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center gap-2"
            onClick={() => toggleDropdown(msg.id)}
            aria-expanded={messageContent[msg.id]?.isOpen}
            aria-haspopup="listbox"
            aria-controls={`language-dropdown-${msg.id}`}
          >
            <span className="flex items-center">
              {
                supportedLanguages.find(
                  (lang) =>
                    lang.value === messageContent[msg.id]?.selectedLanguage,
                )?.label
              }
              <MdKeyboardArrowDown className="text-xl"/>
            </span>
           
          </button>
          {/* translate button */}
          <button
            onClick={() =>
              handleTranslate(
                msg.id,
                messageContent[msg.id]?.detectedLanguage,
                messageContent[msg.id]?.selectedLanguage,
              )
            }
            className="text-xs text-white font-medium bg-blue-500/70 px-3 py-2 rounded-lg border border-blue-400/20 shadow-[0_0_15px_-3px] shadow-green-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:blue-400/40 hover:blue-400/70  hover:-translate-y-0.5 transition-all duration-300 ease-out"
            aria-label={`Translate message to ${supportedLanguages.find((lang) => lang.value === messageContent[msg.id]?.selectedLanguage)?.label}`}
            disabled={messageContent[msg.id]?.isTranslating}
            aria-busy={messageContent[msg.id]?.isTranslating}
          >
            {messageContent[msg.id]?.isTranslating
              ? "Translating..."
              : "Translate"}
          </button>
          {/* dropdown */}
          {messageContent[msg.id]?.isOpen && (
            <div
              id={`language-dropdown-${msg.id}`}
              className="language-dropdown fixed z-50 mt-2 w-48 rounded-lg bg-gray-900/95 backdrop-blur-lg border border-blue-400/20 shadow-lg"
              role="listbox"
              aria-label="Select target language"
            >
              {supportedLanguages.map((option) => (
                <button
                  key={option.value}
                  className={`block w-full px-4 py-2 text-left text-xs text-white hover:bg-blue-500/20 transition-colors duration-150 ${messageContent[msg.id]?.selectedLanguage === option.value ? "bg-blue-500/30" : ""}`}
                  onClick={() => handleLanguageSelect(msg.id, option.value)}
                  role="option"
                  aria-selected={
                    messageContent[msg.id]?.selectedLanguage === option.value
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Button */}
        {msg.text.length > 150 &&
          messageContent[msg.id]?.detectedLanguage === "en" && (
            <button
              onClick={() => {
                setSelectedMessageId(msg.id);
                setshowModal(true);
              }}
              className="text-xs text-white font-medium bg-blue-500/70 px-3 py-2 rounded-lg border border-blue-400/20 shadow-[0_0_15px_-3px] shadow-indigo-500/30 backdrop-blur-sm hover:shadow-[0_0_20px_-3px] hover:shadow-indigo-400/40 hover:from-indigo-400/70 hover:to-purple-400/70 hover:-translate-y-0.5 transition-all duration-300 ease-out"
              aria-label="Summarize message"
              disabled={messageContent[msg.id]?.isSummarizing}
              aria-busy={messageContent[msg.id]?.isSummarizing}
            >
              {messageContent[msg.id]?.isSummarizing
                ? "Summarizing..."
                : "Summarize"}
            </button>
          )}
      </div>
    </div>
  );
};

// export default actionButtons;