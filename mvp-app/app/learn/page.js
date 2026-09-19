"use client";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { UploadCloud, Sparkles, Volume2, Square, Image as ImageIcon, CheckCircle, XCircle, ChevronRight, FileText, ArrowDown, File, Plus, X, ArrowRight, Brain } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [level, setLevel] = useState("simple");
  const [speaking, setSpeaking] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [apiError, setApiError] = useState("");
  const [userApiKey, setUserApiKey] = useState("");

  const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await fetch(url, options);
        if (res.ok) {
          return res;
        }
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 2000));
        } else {
          return res;
        }
      } catch (err) {
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 2000));
        } else {
          throw err;
        }
      }
    }
  };

  const [loadingMessage, setLoadingMessage] = useState("Analyzing document...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    const messages = [
      "Analyzing document structure...",
      "Extracting key concepts...",
      "Simplifying complex sentences...",
      "Creating bite-sized slides...",
      "Generating interactive quizzes...",
      "Applying final touches..."
    ];
    let msgIdx = 0;
    setLoadingMessage(messages[0]);
    
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMessage(messages[msgIdx]);
    }, 2500);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += (Math.random() * 4) + 1;
      if (currentProgress > 95) currentProgress = 95; 
      setProgress(currentProgress);
    }, 500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);
  
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [weakPointsReport, setWeakPointsReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  
  const fileRef = useRef(null);

  const [loadingSample, setLoadingSample] = useState(false);

  const generateSample = async () => {
    setLoadingSample(true);
    setApiError("");
    try {
      const res = await fetchWithRetry("/api/generate-sample", {
        headers: { "X-User-Api-Key": userApiKey }
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setInput(data.text);
      } else {
        setApiError(data.error ? data.error + " Please try again." : "Failed to generate sample. Please try again.");
      }
    } catch (e) {
      alert("Error generating sample text.");
    }
    setLoadingSample(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles) => {
    const validFiles = newFiles.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        alert(`${f.name} is too large! Maximum 5MB allowed (Approx 2-3 pages).`);
        return false;
      }
      return f.type.startsWith("image/") || f.type === "application/pdf";
    });

    if (validFiles.length !== newFiles.length) {
      alert("Some files were skipped. Please only upload Images or PDFs under 5MB.");
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, { base64: reader.result, mimeType: file.type, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processData = async () => {
    if (!input && files.length === 0) {
      alert("Please provide some text or upload a file.");
      return;
    }
    setLoading(true);
    setResult(null);
    setAnswers({});
    setQuizSubmitted(false);
    setScore(null);
    setWeakPointsReport(null);
    setApiError("");
    
    try {
      const res = await fetchWithRetry("/api/process", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Api-Key": userApiKey
        },
        body: JSON.stringify({ text: input, files: files, customInstruction: customInstruction })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error ? data.error + " Zəhmət olmasa yenidən cəhd edin." : "Server error occurred! Zəhmət olmasa yenidən cəhd edin.");
        setLoading(false);
        return;
      }
      setResult(data);
    } catch (e) {
      alert("Error processing data!");
    }
    setLoading(false);
  };

  const handleAnswer = (qIndex, optIndex) => {
    if (!quizSubmitted) {
      setAnswers({ ...answers, [qIndex]: optIndex });
    }
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < result.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    let correct = 0;
    result.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    
    const finalScore = Math.round((correct / result.questions.length) * 100);
    setScore(finalScore);
    setQuizSubmitted(true);
    
    if (finalScore >= 70) {
      triggerConfetti();
    }
  };

  const generateReport = async () => {
    setLoadingReport(true);
    setApiError("");
    try {
      const originalText = result.simple.map(s => s.text).join(" ");
      const res = await fetchWithRetry("/api/report", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Api-Key": userApiKey
        },
        body: JSON.stringify({ 
          questions: result.questions,
          userAnswers: answers,
          originalText 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWeakPointsReport(data);
      } else {
        setApiError(data.error ? data.error + " Zəhmət olmasa yenidən cəhd edin." : "Failed to generate report. Zəhmət olmasa yenidən cəhd edin.");
      }
    } catch (e) {
      alert("Error connecting to report server.");
    }
    setLoadingReport(false);
  };

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const speak = (text) => {
    if (speaking === text) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
    } else {
      window.speechSynthesis.cancel();
      // Remove asterisks, backticks, tildes, and underscores before speaking
      const cleanText = text.replace(/[*_~`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      utterance.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setSpeaking(text);
    }
  };

  const addMoreQuizzes = async () => {
    setLoadingQuiz(true);
    setApiError("");
    try {
      const contextText = result.simple.map(s => s.text).join(" ");
      const res = await fetchWithRetry("/api/quiz", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Api-Key": userApiKey
        },
        body: JSON.stringify({ 
          contextText, 
          existingQuestions: result.questions.map(q => q.question) 
        })
      });
      const newQuestions = await res.json();
      if (res.ok && Array.isArray(newQuestions)) {
        setResult({
          ...result,
          questions: [...result.questions, ...newQuestions]
        });
        setQuizSubmitted(false);
        setScore(null);
        setWeakPointsReport(null);
      } else {
        setApiError(newQuestions.error ? newQuestions.error + " Zəhmət olmasa yenidən cəhd edin." : "Server error when generating quizzes. Zəhmət olmasa yenidən cəhd edin.");
      }
    } catch (e) {
      alert("Error adding quizzes!");
    }
    setLoadingQuiz(false);
  };

  return (
    <div className="w-full relative transition-all duration-700 ease-in-out">


      {/* Header section */}
      {!result && !loading && (
        <header className="text-center mb-10 max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4">Transform Your Text</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">Paste your heavy text or upload pages to instantly get clear, bite-sized interactive slides.</p>
        </header>
      )}

      {apiError && (
        <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500 relative z-20">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-xl shadow-sm font-semibold flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      {/* Main Container - Transitions between centered 1-col to grid 2-col */}
      <div className={`transition-all duration-700 ease-in-out grid gap-8 ${result || loading ? 'max-w-7xl mx-auto lg:grid-cols-[400px_1fr]' : 'max-w-2xl mx-auto grid-cols-1'}`}>
        
        {/* LEFT COLUMN: INPUT */}
        <div className={`glass-card p-6 sm:p-8 flex flex-col gap-6 shadow-lg border-slate-200 dark:border-slate-800 ${result || loading ? 'sticky top-28 h-fit' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl shadow-sm">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Input Content</h2>
          </div>
          
          <div className="relative">
            <textarea 
              className="w-full h-48 p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 pb-12"
              placeholder="Paste your dense textbook text here..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button 
              onClick={generateSample}
              disabled={loadingSample || loading}
              className="absolute bottom-3 right-3 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60 text-indigo-600 dark:text-indigo-300 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-700/50 disabled:opacity-50"
            >
              {loadingSample ? (
                <><Sparkles className="spin" size={14} /> Generating...</>
              ) : (
                <><Brain size={14} /> AI Sample Topic</>
              )}
            </button>
          </div>

          <input 
            type="text"
            className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Special Instructions (Optional)..."
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
          />

          <div className="relative group mt-2">
            <div className={`absolute -inset-1 rounded-2xl blur-md transition-all duration-1000 ${apiError ? "bg-gradient-to-r from-red-500 to-rose-500 opacity-80 animate-pulse" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 group-hover:opacity-70 group-hover:duration-200"}`}></div>
            <input 
              type="password"
              className="relative w-full p-5 bg-white dark:bg-slate-900 border-none shadow-xl rounded-xl focus:ring-4 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-100 font-extrabold placeholder:text-slate-400 dark:placeholder:text-slate-500 z-10"
              placeholder="✨ Custom Gemini API Key (Optional)..."
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
            />
          </div>
          
          <div 
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3
              ${dragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input type="file" accept="image/*,application/pdf" multiple onChange={handleUpload} ref={fileRef} className="hidden" />
            <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm text-slate-400 dark:text-slate-500 mb-2">
              <UploadCloud size={24} />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Click or drag files here</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Supports JPG, PNG, PDF (Max 5MB)</span>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {files.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
                  <button 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-sm"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  >
                    <X size={12} />
                  </button>
                  {file.mimeType === "application/pdf" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                      <File size={24} />
                      <span className="text-[10px] mt-1 font-medium">PDF</span>
                    </div>
                  ) : (
                    <img src={file.base64} alt="upload" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all active:scale-[0.98]"
            onClick={processData} 
            disabled={loading}
          >
            {loading ? (
              <><Sparkles className="spin" size={20} /> Processing...</>
            ) : (
              <><Sparkles size={20} /> Make it Simple!</>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        {(result || loading) && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 fade-in">
            
            {loading && !result && (
              <div className="glass-card flex flex-col items-center justify-center h-full min-h-[400px] p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 animate-pulse"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles size={32} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 animate-in slide-in-from-bottom-2 fade-in duration-500" key={loadingMessage}>
                    {loadingMessage}
                  </h3>
                  
                  <div className="w-full max-w-xs sm:max-w-sm mt-6">
                    <div className="flex justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full shadow-md"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && !loading && (
              <>
                {/* Custom Segmented Control for Tabs */}
                <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-1">
                  {[
                    { id: 'verySimple', label: 'Very Simple' },
                    { id: 'simple', label: 'Simple' },
                    { id: 'original', label: 'Original Text' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLevel(tab.id)}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                        level === tab.id 
                          ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Slides Container */}
                <div className="flex flex-col gap-6">
                  {Array.isArray(result[level]) ? (
                    result[level].map((section, idx) => (
                      <div key={idx} className="relative pl-8">
                        {/* Connecting Line */}
                        {idx !== result[level].length - 1 && (
                          <div className="absolute left-[11px] top-10 bottom-[-32px] w-0.5 bg-indigo-200 dark:bg-indigo-900/30 z-0"></div>
                        )}
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-6 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-4 border-white dark:border-slate-950 shadow-sm flex items-center justify-center z-10">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              {section.title}
                            </h4>
                            <button 
                              className={`p-3 rounded-xl transition-all shadow-sm flex-shrink-0 ${
                                speaking === section.text 
                                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/50' 
                                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/50'
                              }`}
                              onClick={() => speak(section.text)}
                              title="Listen"
                            >
                              {speaking === section.text ? <Square fill="currentColor" size={16} /> : <Volume2 size={16} />}
                            </button>
                          </div>
                          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">{section.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">
                      {result[level]}
                    </div>
                  )}
                </div>

                {/* Quiz Section */}
                {result.questions && result.questions.length > 0 && (
                  <div className="mt-12 bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle size={28} />
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Knowledge Check</h3>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 ml-16 font-medium">Answer these quick questions to see how well you understood!</p>
                    
                    <div className="flex flex-col gap-8 mb-10">
                      {result.questions.map((q, qIndex) => {
                        const isSelected = answers[qIndex] !== undefined;
                        
                        return (
                          <div key={qIndex} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-sm">
                            <p className="font-extrabold text-xl text-slate-800 dark:text-slate-100 mb-6">{q.question}</p>
                            <div className="flex flex-col gap-4">
                              {q.options.map((opt, optIndex) => {
                                let btnClass = "w-full text-left px-6 py-5 rounded-xl border-2 flex items-center justify-between transition-all font-bold text-lg ";
                                let Icon = ArrowRight;
                                let iconColor = "text-slate-400 dark:text-slate-500";

                                const isThisSelected = answers[qIndex] === optIndex;
                                const isCorrectAnswer = optIndex === q.correctAnswer;

                                if (quizSubmitted) {
                                  if (isCorrectAnswer) {
                                    btnClass += "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-400 shadow-sm";
                                    Icon = CheckCircle;
                                    iconColor = "text-emerald-600 dark:text-emerald-400";
                                  } else if (isThisSelected) {
                                    btnClass += "bg-rose-50 dark:bg-rose-900/30 border-rose-400 dark:border-rose-500/50 text-rose-800 dark:text-rose-400 shadow-sm";
                                    Icon = XCircle;
                                    iconColor = "text-rose-600 dark:text-rose-400";
                                  } else {
                                    btnClass += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60";
                                  }
                                } else {
                                  if (isThisSelected) {
                                    btnClass += "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500/50 text-indigo-800 dark:text-indigo-400 shadow-sm";
                                    Icon = CheckCircle;
                                    iconColor = "text-indigo-600 dark:text-indigo-400";
                                  } else {
                                    btnClass += "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500";
                                  }
                                }

                                return (
                                  <button 
                                    key={optIndex} 
                                    className={btnClass} 
                                    onClick={() => handleAnswer(qIndex, optIndex)}
                                    disabled={quizSubmitted}
                                  >
                                    <span>{opt}</span>
                                    <Icon size={22} className={iconColor} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!quizSubmitted ? (
                      <button 
                        onClick={submitQuiz}
                        className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xl font-extrabold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-1 active:translate-y-0"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Score Card */}
                        <div className="bg-indigo-950 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden mb-8">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                          <h4 className="text-2xl font-bold text-indigo-200 mb-2 relative z-10">Your Final Score</h4>
                          <div className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 relative z-10">
                            {score}%
                          </div>
                          <p className="text-lg text-indigo-100 font-medium relative z-10">
                            {score === 100 ? "Perfect! You've mastered this topic." : "Good effort! Let's review the areas you missed."}
                          </p>
                        </div>
                        
                        {score < 100 && !weakPointsReport && (
                          <button 
                            onClick={generateReport}
                            disabled={loadingReport}
                            className="w-full py-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-xl font-extrabold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-none transition-all flex justify-center items-center gap-3 disabled:opacity-70"
                          >
                            {loadingReport ? (
                              <><Sparkles className="spin" size={24} /> Analyzing Weak Points...</>
                            ) : (
                              <><Brain size={24} /> Get Weak Point Report</>
                            )}
                          </button>
                        )}

                        {weakPointsReport && (
                          <div className="mt-8 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-2xl font-extrabold text-violet-900 dark:text-violet-300 mb-6 flex items-center gap-3">
                              <Brain size={28} className="text-violet-600 dark:text-violet-400" /> Weak Point Analysis
                            </h3>
                            <div className="flex flex-col gap-6">
                              {weakPointsReport.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-violet-100 dark:border-violet-800 shadow-sm">
                                  <h4 className="text-lg font-bold text-violet-800 dark:text-violet-400 mb-3">{item.topic}</h4>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button 
                      className="w-full mt-8 py-5 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      onClick={addMoreQuizzes}
                      disabled={loadingQuiz}
                    >
                      {loadingQuiz ? <><Sparkles className="spin" size={20}/> Generating more...</> : <><Plus size={20}/> Add 3 more quizzes</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
