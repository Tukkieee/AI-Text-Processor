// 'use client'

import React, { useState, useCallback } from 'react'
import { IoSend } from "react-icons/io5";
export const InputArea = ({ setMessages, setmessageContent, supportedLanguages, inputError, setInputError }) => {
  const [text, setText] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDetect = async(messageId, messageText) => {
    // Check if browser supports language detection API
    if (!('ai' in self && 'languageDetector' in self.ai)) {
      setmessageContent(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          detectedLanguage: '',
          detectedLanguageLabel: '',
          isDetecting: false,
          isSupported: false,
          detectionError: "Your browser doesn't support the Language Detection API."
        }
      }));
      return;
    }

    try {
      // Check language detector capabilities
      const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.available;

      if (canDetect === 'no') {
        setmessageContent(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            detectedLanguage: '',
            detectedLanguageLabel: '',
            isDetecting: false,
            isSupported: false,
            detectionError: "Language detection is not available at the moment. Please try again later."
          }
        }));
        return;
      }

      let detector;
      if (canDetect === 'readily') {
        detector = await self.ai.languageDetector.create();
      } else {
        // Need to download model first
        setDownloadProgress(0);
        detector = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              setDownloadProgress(progress);
            });
          },
        });
        await detector.ready;
      }

      const result = await detector.detect(messageText);
      
      const detectedCode = result[0].detectedLanguage;
      
      // Check if detected language is available
      const languageAvailability = await languageDetectorCapabilities.languageAvailable(detectedCode);
      if (languageAvailability !== 'readily') {
        setmessageContent(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            detectedLanguage: detectedCode,
            detectedLanguageLabel: `Unsupported language (${detectedCode})`,
            isDetecting: false,
            isSupported: false,
            detectionError: 'This language is not supported for detection.'
          }
        }));
        return;
      }

      const supportedLanguage = supportedLanguages.find(lang => lang.value === detectedCode);
      
      setmessageContent(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          detectedLanguage: detectedCode,
          detectedLanguageLabel: supportedLanguage ? supportedLanguage.label : detectedCode,
          isDetecting: false,
          isSupported: true,
          detectionError: null 
        }
      }));
    } catch (error) {
      console.error('Language detection error:', error);
      setmessageContent(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          detectedLanguage: '',
          detectedLanguageLabel: '',
          isDetecting: false,
          isSupported: false,
          detectionError: 'Failed to detect language. Please try again.'
        }
      }));
    }
  }

  const handleSend = async () => {
    // Clear any previous errors
    setInputError('');

    // Validate input
    if (!text) {
      setInputError('Please enter some text.');
      return;
    }

   

    const messageId = Date.now().toString();
    
    // Initialize message state first
    setmessageContent(prev => ({
      ...prev,
      [messageId]: {
        isOpen: false,
        selectedLanguage: 'en',
        translatedText: '',
        detectedLanguage: '',
        detectedLanguageLabel: '',
        isSupported: false,
        summary: '',
        isTranslating: false,
        isDetecting: true,
        detectionError: null,
        translationError: null,
        summaryError: null
      }
    }));

    // Add message to messages array
    setMessages(prev => [...prev, { id: messageId, text: text }]);
    
    await handleDetect(messageId, text);
    
    setText('');
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [text]);

  return (
    <div className="relative flex flex-col gap-3">
          <textarea 
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInputError(''); // Clear error when user starts typing
            }}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-2 pr-7 sm:pr-16 rounded-2xl bg-gray-900/30 backdrop-blur-md border-2 ${
              inputError ? 'border-red-500/50' : 'border-green-500/30 hover:border-green-400/50 focus:border-green-500/30'
            } focus:ring-2 focus:ring-green-500/40 outline-none resize-none text-gray-200 shadow-lg transition-all duration-200 text-sm sm:text-base`}
            placeholder="Type a message in any language of choice..."
            rows={3}
            style={{
              boxShadow: inputError ? "0 0 30px rgba(239, 68, 68, 0.15)" : "0 0 30px rgba(2, 14, 1, 0.15)"
            }}
            aria-label="Message input"
            aria-invalid={!!inputError}
            aria-errormessage={inputError ? "input-error" : undefined}
            aria-describedby="message-hint"
          />
          
        
          {downloadProgress > 0 && downloadProgress < 100 && (
            <div className="fixed top-5 right-4 bg-green-900/90 text-white text-sm px-3 py-1 rounded-lg backdrop-blur-sm">
              Downloading model: {downloadProgress}%
            </div>
          )}
          <button
            onClick={handleSend}
            className="absolute bottom-4 right-4 px-5 py-2.5 bg-green-700/50 hover:bg-green-700/30 text-white rounded-xl  transition-all duration-200 flex items-center gap-2 group border border-green-500/30 hover:border-green-700/30"
            aria-label="Send message"
          >
            <IoSend />
          </button>
    </div>
  )
}

