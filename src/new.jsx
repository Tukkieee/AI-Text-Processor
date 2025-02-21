
import "./App.css";
import React, { useEffect, useState } from "react";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [detected, setDetected] = useState("");
  const [detector, setDetector]= useState(null)
  const [summary, setSummary] = useState("");
  const [translation, setTranslation] = useState("");
  const [downloadProgress, setDownloadProgress] = useState("");
  const [translator, setTranslator] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("");


  useEffect(() => {
    async function initializeDetector() {
      if ('ai' in self && 'languageDetector' in self.ai) {
        const capabilities = await self.ai.languageDetector.capabilities();
        console.log('Capabilities:', capabilities.available);
  
        if (capabilities.available === 'readily') {
          const readyDetector = await self.ai.languageDetector.create();
          setDetector(readyDetector);
          console.log('Detector Ready:', readyDetector);
        } else if (capabilities.available === 'after-download') {
          const downloadingDetector = await self.ai.languageDetector.create({
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                setDownloadProgress(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            },
          });
          await downloadingDetector.ready;
          setDetector(downloadingDetector);
          console.log('Downloaded and Ready:', downloadingDetector);
        } else {
          console.error('Language Detector not available.');
        }
      }
    }
  
    initializeDetector();
  }, []); // Run once on mount
  
  const detectLanguage = async(input)=>{
      if (!detector) {
        console.log('Language detector not ready');
        return;
      }
    
      if (!input) {
        console.log('No input provided');
        return;
      }
    
      try {
        const results = await detector.detect(input);
        const topResult = results[0];
        setDetected(topResult.detectedLanguage)
        console.log(detected)

        console.log('Detected:', topResult.detectedLanguage, 'Confidence:', topResult.confidence);
      } catch (error) {
        console.error('Detection error:', error);
      }
  }
  
  async function initializeTranslator() {
    if (!detected) {
      console.error('No detected language to translate from.');
      return null;
    }
  
    if ('ai' in self && 'translator' in self.ai) {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const availability = translatorCapabilities.languagePairAvailable(detected, targetLanguage);
      console.log('Translation availability:', availability);
  
      const translatorOptions = {
        sourceLanguage: detected,
        targetLanguage,
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            setDownloadProgress(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        }
      };
  
      try {
        const translatorInstance = availability === 'readily' || availability === 'after-download'
          ? await self.ai.translator.create(translatorOptions)
          : null;
  
        if (translatorInstance) {
          await translatorInstance.ready;
          // setTranslator(translatorInstance);
          console.log('Translator Ready:', translatorInstance);
          return translatorInstance; // Return the translator instance
        } else {
          console.error(`Translation from ${detected} to ${targetLanguage} not available.`);
          return null;
        }
      } catch (error) {
        console.error('Error initializing translator:', error);
        return null;
      }
    }
  
    return null;
  }
  
  
  const handleTranslate = async () => {
    if (!outputText.trim()) {
      alert("Please enter some text to translate.");
      return;
    }
  
    const translatorInstance = await initializeTranslator();
  
    if (!translatorInstance) {
      console.error("Translator not initialized.");
      return;
    }
  
    try {
      const translatedResponse = await translatorInstance.translate(outputText);
      console.log("Full Translation Response:", JSON.stringify(translatedResponse, null, 2));
  
      if (translatedResponse && typeof translatedResponse === "object") {
        if (translatedResponse.text) {
          setTranslation(translatedResponse.text);
          console.log("Translated Text:", translatedResponse.text);
        } else {
          console.error("Unexpected response format:", translatedResponse);
        }
      } else {
        setTranslation(String(translatedResponse));
      }
    } catch (error) {
      console.error("Translation failed:", error);
    }
  };
  


  async function initializeSummarizer() {
    if (!outputText.trim()) {
      console.error('No text provided for summarization.');
      return null;
    }
  
    if ('ai' in self && 'summarizer' in self.ai) {
      try {
        const summarizerCapabilities = await self.ai.summarizer.capabilities();
        console.log('Summarizer Capabilities:', summarizerCapabilities);
  
        if (summarizerCapabilities.available === 'readily' || summarizerCapabilities.available === 'after-download') {
          const summarizerInstance = await self.ai.summarizer.create({
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                setDownloadProgress(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            }
          });
  
          await summarizerInstance.ready;
          console.log('Summarizer Ready:', summarizerInstance);
          return summarizerInstance;
        } else {
          console.error('Summarizer not available.');
          return null;
        }
      } catch (error) {
        console.error('Error initializing summarizer:', error);
        return null;
      }
    }
  
    return null;
  }
  
  const handleSummarize = async () => {
    const summarizerInstance = await initializeSummarizer();
  
    if (!summarizerInstance) {
      console.error("Summarizer not initialized.");
      return;
    }
  
    try {
      const summarizedResponse = await summarizerInstance.summarize(outputText);
      console.log("Full Summarization Response:", JSON.stringify(summarizedResponse, null, 2));
  
      if (summarizedResponse && typeof summarizedResponse === "object") {
        if (summarizedResponse.text) {
          setSummary(summarizedResponse.text);
          console.log("Summary:", summarizedResponse.text);
        } else {
          console.error("Unexpected response format:", summarizedResponse);
        }
      } else {
        setSummary(String(summarizedResponse));
      }
    } catch (error) {
      console.error("Summarization failed:", error);
    }
  };

  
  

  
  


  const handleSend = () => {
    if (!inputText.trim()) {
      alert("Please enter some text.");
      return;
    }
    setOutputText(inputText);
    detectLanguage(inputText);
  };



 

 

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="output-area mb-6">
          <p className="text-gray-800">{outputText}</p>
          {detected && (
            <p className="text-sm text-gray-500 mt-2">
              Detected Language: {detected}
            </p>
          )}
          {outputText.length > 150 && detected === "en" && (
            <button
              onClick={handleSummarize}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Summarize
            </button>
          )}
          {summary && (
            <p className="mt-4 text-gray-800">
              <strong>Summary:</strong> {summary}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="en">English</option>
              <option value="pt">Portuguese</option>
              <option value="es">Spanish</option>
              <option value="ru">Russian</option>
              <option value="tr">Turkish</option>
              <option value="fr">French</option>
            </select>
            <button
              onClick={handleTranslate}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Translate
            </button>
          </div>
          {translation && (
            <p className="mt-4 text-gray-800">
              <strong>Translation:</strong> {translation}
            </p>
          )}
        </div>
        <div className="input-area flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full p-2 border rounded resize-none"
            rows="4"
          />

          {downloadProgress && (
            <p className="text-gray-600 text-xs mt-2">{downloadProgress}</p>
          )}
          <button
            onClick={handleSend}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;