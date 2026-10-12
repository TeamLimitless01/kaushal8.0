'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Send,
  Zap,
  Trash2,
  Trophy,
  Bot,
  User,
  RefreshCw,
  TrendingDown,
  ArrowRight,
  Cpu,
  Wand2,
  Copy,
  Check,
  Building2,
  BarChart3,
  Sun,
  Activity,
  Layers,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  suggestedActions?: Array<{
    label: string;
    action: string;
    iconType?: 'iot' | 'waste' | 'report' | 'plan';
  }>;
  timestamp: string;
}

const PRESET_QUERIES = [
  {
    icon: Zap,
    title: 'Live Energy Load',
    prompt: 'What is our current campus electricity load, solar generation in kW, and which building is using the most power?',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200',
  },
  {
    icon: Building2,
    title: 'Building Power Comparison',
    prompt: 'Compare power usage across Block A, Block B, Main Library, and Civil Lab. Which has the highest demand?',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-700 border-blue-200',
  },
  {
    icon: Wand2,
    title: 'Savings & Tariffs Plan',
    prompt: 'Generate an executive sustainability optimization plan with actionable tips and financial savings in INR for our campus.',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-700 border-emerald-200',
  },
  {
    icon: Trash2,
    title: 'Waste & Recycling Audit',
    prompt: 'What is our campus recycling diversion rate and what are the top discarded items and contamination spots?',
    color: 'from-green-500/20 to-emerald-500/20 text-green-700 border-green-200',
  },
  {
    icon: Trophy,
    title: 'Green Student Champions',
    prompt: 'Who are the top students on our green leaderboard and what environmental reports have been submitted?',
    color: 'from-purple-500/20 to-violet-500/20 text-purple-700 border-purple-200',
  },
  {
    icon: Sun,
    title: 'Solar & Carbon Offsets',
    prompt: 'Calculate our current rooftop solar offset percentage, net grid import, and estimated CO2 emissions avoided.',
    color: 'from-yellow-500/20 to-amber-500/20 text-amber-800 border-amber-300',
  },
];

// Tool metadata: Icons, colors, and human-friendly labels
const TOOL_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  queryCampusEnergyAndTelemetry: {
    label: 'Campus Energy & IoT Telemetry',
    icon: Zap,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700/50',
  },
  queryWasteAndRecycling: {
    label: 'Waste Segregation Records',
    icon: Trash2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700/50',
  },
  queryCampusBuildingsAndSpots: {
    label: 'Registered Campus Blocks',
    icon: Building2,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700/50',
  },
  queryStudentLeaderboardAndReports: {
    label: 'Student Green Audits & Ranks',
    icon: Trophy,
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700/50',
  },
  generateOptimizationPlanAndTips: {
    label: 'Tariff & Carbon Optimization',
    icon: TrendingDown,
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-700/50',
  },
};

export default function AiAdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to **EcoCampus AI Luna** 🌿

I am your **Autonomous Environmental Intelligence & Energy Optimization Advisor**, directly connected to real-time IoT sensors and campus databases.

#### 🛠️ Available Analytical Tools:
- **⚡ Energy & Telemetry Monitoring:** Live kW power loads, rooftop solar generation, and commercial electricity billing (at ₹8/kWh).
- **🏛️ Multi-Building Comparison:** Building-by-building breakdown across Block A, Block B, Main Library, and Civil Lab.
- **♻️ Solid Waste Intelligence:** Recycling percentages, wet/dry segregation audits, and landfill diversion rates.
- **🏆 Student Green Champions:** Eco-point leaderboard rankings and environmental hazard audits.
- **📊 Tariff & Carbon Optimization:** Prioritized action plans to cut utility bills and carbon footprints.

> **Tip:** Click any preset query above or ask any sustainability question below!`,
      toolsUsed: ['queryCampusEnergyAndTelemetry'],
      suggestedActions: [
        {
          label: '⚡ Inspect Live Campus Power Load',
          action: 'send_query',
          iconType: 'iot',
        },
        {
          label: '🏛️ Compare Building Electricity Demands',
          action: 'send_query',
          iconType: 'iot',
        },
        {
          label: '📊 Calculate Monthly Tariff Savings',
          action: 'send_query',
          iconType: 'plan',
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, history: historyPayload }),
      });

      const data = await res.json();

      if (data.success) {
        const dynamicActions: Array<{
          label: string;
          action: string;
          iconType?: 'iot' | 'waste' | 'report' | 'plan';
        }> = [...(data.suggestedActions || [])];

        const lowerContent = data.answer.toLowerCase();

        if (lowerContent.includes('load') || lowerContent.includes('kw') || lowerContent.includes('power')) {
          dynamicActions.push({
            label: '⚡ Open Live IoT Telemetry Console',
            action: 'navigate_iot',
            iconType: 'iot',
          });
        }

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          toolsUsed: data.toolsUsed || [],
          suggestedActions: dynamicActions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'AI query failed');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `### ⚠️ AI Processing Alert\n\nCould not communicate with the Pollinations AI inference endpoint:\n\n\`${err?.message || 'Network timeout'}\`\n\nPlease check your internet connection and retry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: {
    label: string;
    action: string;
  }) => {
    setActionLoading(action.label);
    try {
      if (action.action === 'send_query') {
        handleSend(action.label);
      } else if (action.action === 'navigate_iot') {
        window.location.href = '/iot';
      }
    } catch (e) {
      alert('Failed to execute action');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* <div className="flex items-center space-x-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              <span>Pollinations AI • GPT-6 Luna Engine</span>
            </span>
            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Deterministic (Temp: 0) • Live IoT Tools Active
            </span>
          </div> */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            AI Sustainability Advisor
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time intelligence querying campus electricity telemetry, solar offsets, waste segregation, and strategic energy optimization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMessages([messages[0]])}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Preset Query Cards */}


      {/* Main Chat Conversation Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg flex flex-col h-[700px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-radial-pattern">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-emerald-400/30">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-3xl w-full space-y-2.5 ${msg.role === 'user' ? 'items-end ml-auto max-w-xl' : 'items-start'
                  }`}
              >
                {/* TOOL CALLS SECTION WITH BEAUTIFUL ICONS & GLOW */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-1 animate-in fade-in slide-in-from-left-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1 mr-1">
                      <Cpu className="w-3 h-3 text-emerald-500" />
                      <span>Tools Invoked:</span>
                    </span>
                    {msg.toolsUsed.map((toolName, tIdx) => {
                      const conf = TOOL_CONFIG[toolName] || {
                        label: toolName,
                        icon: Sparkles,
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        border: 'border-slate-300',
                      };
                      const ToolIcon = conf.icon;
                      return (
                        <div
                          key={tIdx}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border shadow-2xs transition-all hover:scale-105 ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          <ToolIcon className="w-3.5 h-3.5 animate-pulse" />
                          <span>{conf.label}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MESSAGE BUBBLE */}
                {msg.role === 'user' ? (
                  <div className="bg-black text-white p-4 md:p-5 rounded-3xl rounded-tr-xs shadow-lg border border-neutral-900 ml-auto">
                    <p className="text-white text-sm font-medium leading-relaxed whitespace-pre-wrap selection:bg-neutral-800 selection:text-white">
                      {msg.content}
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-2 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/90 text-slate-800 p-5 rounded-3xl rounded-tl-xs shadow-sm hover:shadow-md relative transition-all">
                    {/* Top Bar for Assistant Message: Copy & Timestamp */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Luna's Report</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition"
                          title="Copy Markdown"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* RICH MARKDOWN RENDERER */}
                    <div className="prose prose-sm max-w-none prose-slate">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 mb-3 mt-4 first:mt-0 tracking-tight flex items-center gap-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0 flex items-center gap-2">
                              <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
                              <span>{children}</span>
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-extrabold text-slate-800 mt-3 mb-1.5 uppercase tracking-wide">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-xs font-bold text-emerald-800 mt-2 mb-1">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-slate-700 leading-relaxed mb-2.5 last:mb-0">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-slate-900 bg-emerald-50/80 px-1 py-0.5 rounded text-[13px] border border-emerald-200/50">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-1.5 my-2.5 pl-2 list-none">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="space-y-2 my-2.5 pl-2 list-decimal list-inside">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2 text-slate-700 text-sm leading-normal">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="p-3 my-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 rounded-r-2xl text-emerald-900 text-xs font-medium italic">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">
                                {children}
                              </code>
                            ) : (
                              <pre className="p-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-3 border border-slate-800">
                                <code>{children}</code>
                              </pre>
                            );
                          },
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3 rounded-2xl border border-slate-200 shadow-2xs">
                              <table className="w-full text-xs text-left border-collapse">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              {children}
                            </thead>
                          ),
                          tr: ({ children }) => (
                            <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                              {children}
                            </tr>
                          ),
                          th: ({ children }) => (
                            <th className="p-2.5 font-bold uppercase tracking-wider text-[11px]">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => <td className="p-2.5">{children}</td>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* ANIMATED ACTION BUTTONS */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1.5 animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mr-1">
                      ⚡ Action Triggers:
                    </span>
                    {msg.suggestedActions.map((act, actIdx) => {
                      const isIot = act.iconType === 'iot';
                      const isPlan = act.iconType === 'plan';
                      const isCurrentActionLoading = actionLoading === act.label;

                      return (
                        <button
                          key={actIdx}
                          disabled={Boolean(actionLoading)}
                          onClick={() => handleExecuteAction(act)}
                          className={`relative group overflow-hidden px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all duration-300 flex items-center gap-2 active:scale-95 cursor-pointer ${isIot
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5'
                            : isPlan
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                            }`}
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none"></div>

                          {isCurrentActionLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isIot ? (
                            <Zap className="w-3.5 h-3.5 text-amber-200" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                          )}

                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-black text-white border border-neutral-900 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-3.5 animate-in fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-emerald-400/30 animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-3xl text-slate-600 text-xs flex items-center space-x-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                </div>
                <span className="font-medium text-slate-700">
                  Executing live tool reasoning & querying campus IoT telemetry...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask Luna anything (e.g. 'Compare power load between Block A and Block B', 'Calculate solar offset')..."
                disabled={loading}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white shadow-inner transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Ask Luna</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 mt-2 font-mono flex-wrap">
            {/* <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              LLM Model: openai/gpt-6-luna
            </span>
            <span>•</span>
            <span>5 Specialized IoT & Sustainability Tools</span>
            <span>•</span>
            <span>Live Action Buttons Enabled</span> */}
          </div>
        </div>
      </div>
    </div>
  );
}
