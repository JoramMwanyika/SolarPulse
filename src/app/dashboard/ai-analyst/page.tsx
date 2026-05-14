'use client'

import { useState, useRef, useEffect } from 'react'
import { BrainCircuit, Send, User, Bot, AlertTriangle, Paperclip, X } from 'lucide-react'

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<string | null>(null)
  const [csvName, setCsvName] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvData(event.target?.result as string)
      setCsvName(file.name)
      setError(null)
    }
    reader.readAsText(file)
  }

  const removeFile = () => {
    setCsvData(null)
    setCsvName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !csvData) || isLoading) return

    let userContent = input
    if (csvData) {
      userContent += userContent ? `\n\nHere is the data from ${csvName}:\n\`\`\`csv\n${csvData}\n\`\`\`` : `Please analyze the following data from ${csvName}:\n\`\`\`csv\n${csvData}\n\`\`\``
    }

    const userMessage = { role: 'user', content: userContent }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    removeFile()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to connect to the AI brain.')
      }

      const data = await response.json()
      
      if (data.error) {
        // Handle common connection error to Ollama gracefully
        if (data.error.includes('fetch failed')) {
          throw new Error('Could not connect to local Ollama instance. Is Ollama running on port 11434?');
        }
        throw new Error(data.error)
      }

      setMessages(prev => [...prev, data.message])
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-10 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-[#0d131f] p-4 rounded-2xl border border-slate-800 shadow-lg mb-6 shrink-0">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Analyst</h1>
          <p className="text-xs text-slate-400">Powered by local Ollama</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <BrainCircuit className="w-16 h-16 mb-4 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-400 mb-2">How can I help you analyze your fleet?</h2>
              <p className="text-sm text-center max-w-md">
                Ask me questions about site performance, anomaly detection, or let me synthesize recent alert data.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-amber-500 text-slate-900 ml-3' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 mr-3'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-50' 
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/20 text-purple-400 border border-purple-500/30 mr-3">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center my-4">
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col space-y-3">
          {csvName && (
            <div className="flex justify-start">
              <div className="inline-flex items-center bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg text-sm">
                <Paperclip className="w-3.5 h-3.5 mr-2" />
                <span className="truncate max-w-xs">{csvName}</span>
                <button type="button" onClick={removeFile} className="ml-2 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
              title="Attach CSV"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI Analyst or attach a CSV..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-12 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !csvData)}
              className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
