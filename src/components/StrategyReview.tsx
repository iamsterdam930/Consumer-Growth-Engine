import { useState, useRef, useEffect } from 'react';
import { ViewState, Strategy } from '../types';
import { chatToAdjustStrategy } from '../services/aiService';
import { Send, Bot, User, Check, RefreshCw, AlertTriangle, Users, Calendar, MessageSquare, Gift, FlaskConical, ChevronDown, ChevronUp, BrainCircuit, Share2, SplitSquareHorizontal, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getDynamicDate } from '../utils/date';

export default function StrategyReview({ setView, strategy, setStrategy, reasoningSteps, setExecutionDay }: { setView: (v: ViewState) => void, strategy: Strategy, setStrategy: (s: Strategy) => void, reasoningSteps?: any[], setExecutionDay?: (d: number) => void }) {
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    {
      role: 'ai', 
      text: "基于历史 6 条类似活动，我设计了以下方案，请审核关键决策：\n\n参考依据：\n· 2024母亲节活动 T+3/7 方案转化率 4.1%，是历史最优\n· 奢侈品黄金窗口 7-14d\n\n💡 科学性提示：当前目标人群 7,821 人，若按常规 10% 抽取对照组仅 782 人。按 4% 转化率预估，对照组转化样本极少（约 30 单），难以支撑显著性检验。建议将对照组比例提升至 20%（约 1,564 人），或本次活动不设严格对照组，仅做前后效能对比。\n\n你可以告诉我是否需要调整对照组比例，或修改其他策略细节。"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [version, setVersion] = useState(1);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (setExecutionDay) setExecutionDay(0);
    setView('execution-running');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const { reply, updatedStrategy } = await chatToAdjustStrategy(strategy, userMsg);
    
    setStrategy(updatedStrategy);
    setVersion(v => v + 1);
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setIsTyping(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-3"></span>
          <h1 className="text-lg font-semibold text-slate-900">策略草稿 · 待审核 {version > 1 && <span className="text-blue-600 text-sm ml-2 bg-blue-50 px-2 py-0.5 rounded">v{version}</span>}</h1>
          <span className="mx-4 text-slate-300">|</span>
          <span className="text-slate-500 text-sm">首单转复购 · {getDynamicDate(0)} ~ {getDynamicDate(15)}</span>
        </div>
        <div className="space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">保存草稿</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors">提交审批 →</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Chat */}
        <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col h-full min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-sm font-medium text-slate-500 shrink-0">
            对话区
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* AI Reasoning Collapsible inside chat */}
            {reasoningSteps && reasoningSteps.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-6">
                <button
                  onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center">
                    <BrainCircuit className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium text-slate-900 text-sm">查看 AI 思考过程</span>
                  </div>
                  {isReasoningExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                
                {isReasoningExpanded && (
                  <div className="p-4 border-t border-slate-200 bg-white space-y-4">
                    {reasoningSteps.map((step, index) => (
                      <div key={step.id} className="border-l-2 border-blue-200 pl-3 py-0.5">
                        <div className="font-medium text-slate-700 text-xs mb-1">步骤 {step.id} {step.title}</div>
                        <div className="space-y-1 text-[11px] text-slate-500 font-mono">
                          {step.details.map((detail: string, i: number) => (
                            <div key={i} className={detail.startsWith('⚠️') ? 'text-amber-600' : ''}>{detail}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600 ml-3' : 'bg-slate-100 text-slate-600 mr-3'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {msg.text.replace(/\\n/g, '\n').split('\n').map((line, i) => (
                      <div key={i} className={line.trim() === '' ? 'h-2' : ''}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-600 mr-3">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl text-sm bg-slate-100 text-slate-800 flex space-x-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-slate-100 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="告诉我需要调整什么... (例如：去掉短信降级)"
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Strategy Summary */}
        <div className="w-2/3 overflow-y-auto p-8 bg-slate-50 custom-scrollbar h-full">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Canvas Thumbnail */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Share2 className="w-4 h-4 mr-2 text-blue-500" />
                策略执行画布 (Canvas 预览)
              </h3>
              <div className="flex items-center bg-slate-50 p-6 rounded-lg border border-slate-100 overflow-x-auto custom-scrollbar">
                <div className="flex items-center space-x-3 min-w-max">
                  {/* Node 1 */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm w-36 shrink-0">
                    <div className="flex items-center text-xs font-medium text-slate-700 mb-1"><Users className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> 目标人群</div>
                    <div className="text-xs text-slate-500">{strategy.targetAudience.size.toLocaleString()} 人</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  
                  {/* Node 2 */}
                  {strategy.experiment.isABTest && (
                    <>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm w-36 shrink-0">
                        <div className="flex items-center text-xs font-medium text-slate-700 mb-1"><SplitSquareHorizontal className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> A/B 分流</div>
                        <div className="text-xs text-slate-500">{Math.round((strategy.targetAudience.controlGroupSize / strategy.targetAudience.size) * 100)}% 对照组</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </>
                  )}
                  
                  {/* Nodes 3 & 4 (Waves) */}
                  <div className="flex flex-col space-y-3 shrink-0">
                    {strategy.rhythm.waves.map((wave, idx) => (
                      <div key={idx} className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm w-44 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <div className="flex items-center text-xs font-medium text-slate-700 mb-1"><MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> {wave.name}</div>
                        <div className="text-xs text-slate-500 truncate">{wave.time} · {wave.action}</div>
                      </div>
                    ))}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  
                  {/* Node 5 */}
                  <div className="bg-white border border-emerald-200 rounded-lg p-3 shadow-sm w-36 shrink-0 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                    <div className="flex items-center text-xs font-medium text-slate-700 mb-1"><Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> 退出条件</div>
                    <div className="text-xs text-slate-500 truncate">产生复购</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-slate-900">策略摘要</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Target Audience */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-500" /> 目标人群</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>{strategy.targetAudience.description}，<span className="font-medium text-slate-900">{strategy.targetAudience.size.toLocaleString()} 人</span></p>
                  <p>对照组 {strategy.targetAudience.controlGroupSize.toLocaleString()} 人（自动隔离）</p>
                  {strategy.targetAudience.rules && strategy.targetAudience.rules.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-700 mb-2">人群规则：</p>
                      <ul className="space-y-1.5">
                        {strategy.targetAudience.rules.map((rule, idx) => {
                          const isAI = rule.includes('模型') || rule.includes('预测');
                          return (
                            <li key={idx} className="flex items-start text-xs text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></span>
                              <span className="flex items-center flex-wrap gap-1">
                                {isAI && <span className="inline-flex items-center px-1 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium"><Sparkles className="w-3 h-3 mr-0.5" /> AI</span>}
                                {rule}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">更新于：{strategy.targetAudience.dataDate}</p>
                </div>
              </div>

              {/* Rhythm */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                {version > 1 && (
                  <div className="absolute top-4 right-4 flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <RefreshCw className="w-3 h-3 mr-1" /> 已更新
                  </div>
                )}
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2 text-blue-500" /> 触达节奏</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  {strategy.rhythm.waves.map((w, i) => (
                    <div key={i} className="flex">
                      <span className="w-12 text-slate-400">{w.name}</span>
                      <span className="w-10 font-medium text-slate-900">{w.time}</span>
                      <span className="flex-1">{w.action}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-100 text-xs">
                    退出条件：{strategy.rhythm.exitCondition}
                  </div>
                </div>
              </div>

              {/* Channel */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                {version > 1 && (
                  <div className="absolute top-4 right-4 flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <RefreshCw className="w-3 h-3 mr-1" /> 已更新
                  </div>
                )}
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-blue-500" /> 渠道策略</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-900">{strategy.channel.strategy}</p>
                  {version > 1 && <p className="text-amber-600 text-xs mt-1">⚠️ 未覆盖 1,717 人将不触达</p>}
                  <p className="text-xs text-slate-400 mt-2">频控：{strategy.channel.frequencyControl}</p>
                </div>
              </div>

              {/* Offer */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><Gift className="w-4 h-4 mr-2 text-blue-500" /> Offer 配置</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-900">{strategy.offer.name}</p>
                  <p>预计发放：{strategy.offer.estimatedCount.toLocaleString()} 张</p>
                  <p>预计核销率：{strategy.offer.estimatedRedemptionRate}</p>
                  <p>预计成本：<span className="font-medium text-slate-900">{strategy.offer.estimatedCost}</span></p>
                </div>
              </div>

              {/* Experiment */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative col-span-2">
                <div className="absolute top-4 right-4 flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3 mr-1" /> 请关注
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><FlaskConical className="w-4 h-4 mr-2 text-blue-500" /> 实验设计</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-900">{strategy.experiment.isABTest ? '进行 A/B 测试' : '本次不做 A/B 测试'}</p>
                  <p>原因：{strategy.experiment.reason}</p>
                  <p>控制组基线转化率（历史均值）：{strategy.experiment.baselineConversion}</p>
                  <p>目标 Uplift：<span className="font-medium text-emerald-600">{strategy.experiment.targetUplift}</span></p>
                </div>
              </div>

              {/* Content Templates */}
              {strategy.content && strategy.content.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative col-span-2">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-blue-500" /> 营销内容模板</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategy.content.map((c, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{c.channel}</span>
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed mb-3">
                          {c.copywriting}
                        </div>
                        {c.variables && c.variables.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="text-xs font-medium text-slate-500 mb-2">智能变量配置：</div>
                            <div className="space-y-2">
                              {c.variables.map((v, vIdx) => (
                                <div key={vIdx} className="bg-white p-2 rounded border border-slate-200 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-blue-600">${'{'}{v.name}{'}'}</span>
                                    <span className="text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{v.model}</span>
                                  </div>
                                  <div className="text-slate-500">{v.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assumptions */}
              <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200 shadow-sm col-span-2">
                <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-amber-600" /> 关键假设</h3>
                <ul className="text-sm text-amber-800 space-y-2 pl-6 list-decimal">
                  {strategy.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
