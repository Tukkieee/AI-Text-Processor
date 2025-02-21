// "use client";

import React, { useEffect, useRef, useState } from "react";
import { ActionButtons } from "./actionButtons";
import Markdown from "react-markdown";
import { Summarizer } from "./summary";
import { ImSpinner6 } from "react-icons/im";

export const OutputArea = ({
  messages,
  messageContent,
  setmessageContent,
  supportedLanguages,
}) => {
  const chatOutputRef = useRef(null);
  const [showModal, setshowModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll(".language-dropdown");
      dropdowns.forEach((dropdown) => {
        if (
          !dropdown.contains(event.target) &&
          !event.target.closest(".dropdown-toggle")
        ) {
          setmessageContent((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((id) => {
              newState[id] = { ...newState[id], isOpen: false };
            });
            return newState;
          });
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setmessageContent]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div
        ref={chatOutputRef}
        className="flex-1  p-6 mb-6 overflow-y-auto  max-h-[550px]"
        aria-label="Message history"
        role="log"
      >
        <div className="space-y-6" id="chat-output" aria-live="polite">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="relative group flex flex-col items-end"
                aria-label={`Message ${msg.id}`}
              >
                <div className="p-6 rounded-xl bg-green-700/40 border border-green-500/20 shadow-lg hover:shadow-green-500/10 max-w-[75%] self-end">
                  {/* Message Text Section */}
                  <p className="text-gray-100 leading-relaxed" role="textbox" aria-label="Message content">
                    {msg.text}
                  </p>

                  {/* Message Actions Section */}
                  <ActionButtons
                    messages={messages}
                    messageContent={messageContent}
                    setmessageContent={setmessageContent}
                    supportedLanguages={supportedLanguages}
                    msg={msg}
                    setSelectedMessageId={setSelectedMessageId}
                    setshowModal={setshowModal}
                  />
                </div>

                {/* Action Results Section */}
                <div className="self-start max-w-[75%]">
                  {/* Translation Section */}
                  {messageContent[msg.id]?.isTranslating ? (
                    <div 
                      className="mt-2 p-4 rounded-lg bg-gray-800/50 border border-green-500/20 flex justify-center items-center"
                      role="status"
                      aria-live="polite"
                    >
                      <ImSpinner6 className="animate-spin text-white text-2xl" />
                    </div>
                  ) : messageContent[msg.id]?.translationError ? (
                    <div 
                      className="mt-2 p-4 rounded-lg bg-red-900/20 border border-red-500/20"
                      role="alert"
                      aria-atomic="true"
                    >
                      <p className="text-red-400 text-sm">
                        {messageContent[msg.id].translationError}
                      </p>
                    </div>
                  ) : (
                    messageContent[msg.id]?.translatedText && (
                      <div 
                        className="mt-2 p-3 rounded-lg bg-gray-800/50 border border-green-500/20"
                        role="region"
                        aria-label="Translation result"
                      >
                        <p 
                          className="text-white p-1  rounded-lg w-fit text-xs mb-2 "
                          aria-label="Translated to"
                        >
                          {
                            supportedLanguages.find(
                              (lang) =>
                                lang.value ===
                                messageContent[msg.id]?.translatedToLanguage,
                            )?.label
                          }
                        </p>
                        <p className="text-gray-300 text-sm">
                          {messageContent[msg.id].translatedText}
                        </p>
                      </div>
                    )
                  )}

                  {/* Summary Section */}
                  {messageContent[msg.id]?.isSummarizing ? (
                    <div 
                      className="mt-2 p-4 rounded-lg bg-gray-800/50 border border-green-500/20 flex justify-center items-center"
                      role="status"
                      aria-live="polite"
                    >
                      <ImSpinner6 className="animate-spin text-white text-2xl" />
                    </div>
                  ) : messageContent[msg.id]?.summaryError ? (
                    <div 
                      className="mt-2 p-4 rounded-lg bg-red-900/20 border border-red-500/20"
                      role="alert"
                      aria-atomic="true"
                    >
                      <p className="text-red-400 text-sm">
                        {messageContent[msg.id].summaryError}
                      </p>
                    </div>
                  ) : (
                    messageContent[msg.id]?.summary && (
                      <div 
                        className="mt-2 p-3 rounded-lg bg-gray-800/50 border border-green-500/20"
                        role="region"
                        aria-label="Message summary"
                      >
                        <p 
                          className="text-white p-1 bg-blue-700/30 rounded-lg w-fit text-xs mb-2 border border-purple-400/20"
                          aria-hidden="true"
                        >
                          Summary
                        </p>
                        <div className="text-gray-300 text-sm prose prose-invert">
                          <Markdown>{messageContent[msg.id].summary}</Markdown>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))
          ) : (
            <div aria-label="Empty message history"></div>
          )}
        </div>
      </div>
      {showModal && (
        <Summarizer
          messages={messages}
          selectedMessageId={selectedMessageId}
          setmessageContent={setmessageContent}
          setshowModal={setshowModal}
          messageContent={messageContent}
        />
      )}
    </>
  );
};
