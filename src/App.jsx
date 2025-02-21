import { useState, useEffect, useRef } from "react";
import {OutputArea} from "./components/outputArea";
import './App.css'
import {InputArea} from "./components/InputArea";
import { TbFidgetSpinner } from "react-icons/tb";

const App = () => {
  const mainRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    // Get messages from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [messageContent, setmessageContent] = useState(() => {
    // Get messageContent from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messageContent');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });



  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('messageContent', JSON.stringify(messageContent));
  }, [messageContent]);

  

  const [inputError, setInputError] = useState('');

  const supportedLanguages = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
    { value: 'ru', label: 'Russian' },
    { value: 'tr', label: 'Turkish' },
    { value: 'fr', label: 'French' }
  ];
  



  return (
<div ref={mainRef} className="w-full min-h-screen grid grid-rows-[10px_1fr] items-center justify-items-center gap-8 sm:p-1 font-[family-name:var(--font-geist-sans)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black relative">
     
      
<div className="flex flex-col w-full h-full max-w-none row-start-2 px-4">
        <h1 className="flex justify-center text-4xl md:text-6xl mb-6 text-center bg-gradient-to-r text-white-900   font-roadrage"><TbFidgetSpinner className="animate-spin" style={{ animationDuration: "3s" }}/>AI Text Processor<TbFidgetSpinner className="animate-spin" style={{ animationDuration: "3s" }}/></h1>
        

        {/* Messages Output Section */}
        <OutputArea messages={messages} messageContent={messageContent} setmessageContent={setmessageContent} supportedLanguages={supportedLanguages} />

        {/* Text Area Section */}
        <InputArea setMessages={setMessages} setmessageContent={setmessageContent} supportedLanguages={supportedLanguages} inputError={inputError} setInputError={setInputError} />

        {/* Input Error Display Section */}
        {inputError && (
            <p className="text-red-400 text-sm mt-2">{inputError}</p>
          )}
      </div>

    
    </div>
  );
}

export default App;