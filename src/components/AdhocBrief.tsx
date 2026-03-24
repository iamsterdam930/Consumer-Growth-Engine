import { useState, useRef, useEffect } from 'react';
import { ViewState } from '../types';
import { ArrowLeft, Send, Bot, User, CheckCircle2, Users, FileText, Sparkles, MessageCircle, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

type Message = {
  role: 'ai' | 'user';
  text: string;
  isOptions?: boolean;
  options?: string[];
  customAction?: 'audience_confirm' | 'content_variants' | 'final_generate' | 'offer_select' | 'channel_select';
};

export default function AdhocBrief({ setView }: { setView: (v: ViewState) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "你好！我是你的智能营销助手。你想创建一个什么样的 Ad-hoc (单次) 营销活动？你可以直接告诉我你的想法，或者从下方的示例中选择一个开始。",
      isOptions: true,
      options: [
        "我们双十一后有一批没有下单的浏览客户，想在 11 月底做一次召回",
        "我想针对最近 30 天内购买过配饰的新客，推送一款经典款手袋的复购活动",
        "马上要到母亲节了，帮我策划一个针对高价值女性会员的温情回馈活动"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (text: string = input, customContext?: string) => {
    if (!text.trim() || isTyping) return;
    
    setInput('');
    
    // Remove options from previous AI message
    setMessages(prev => {
      const newMsgs = [...prev];
      const lastAiIdx = newMsgs.map(m => m.role).lastIndexOf('ai');
      if (lastAiIdx >= 0) {
        newMsgs[lastAiIdx] = { ...newMsgs[lastAiIdx], isOptions: false, options: undefined };
      }
      return [...newMsgs, { role: 'user', text }];
    });
    
    setIsTyping(true);

    // Simulated conversation flow state machine
    setTimeout(() => {
      setMessages(prev => {
        const userMsgCount = prev.filter(m => m.role === 'user').length;
        
        if (userMsgCount === 1) {
          return [...prev, {
            role: 'ai',
            text: "明白了，这是一个浏览未购的召回场景。为了让圈选更精准，请问浏览行为的时间范围是？",
            isOptions: true,
            options: ["双十一期间（11/1 - 11/11）", "最近 30 天", "最近 7 天"]
          }];
        } else if (userMsgCount === 2) {
          return [...prev, {
            role: 'ai',
            text: "好的。那么有特定的品类或产品方向吗？比如“只针对浏览过手袋的客户”还是“全品类”？",
            isOptions: true,
            options: ["重点是 Tabby 和 Niki 系列", "全品类", "仅限配饰"]
          }];
        } else if (userMsgCount === 3) {
          return [...prev, { 
            role: 'ai', 
            text: "收到。这次有配套 Offer 吗？\n⚠️ 提示：7 天是一个较短的召回窗口，有 Offer 的情况下效果会显著好于纯内容触达。历史数据显示有 Offer 的召回转化率比无 Offer 高约 1.8 倍。",
            isOptions: true,
            options: ["满1000减100", "9折券", "无Offer，纯内容触达"],
            customAction: 'offer_select'
          }];
        } else if (userMsgCount === 4) {
          return [...prev, { 
            role: 'ai', 
            text: "好的，最后一个问题：触达渠道的优先级？微信 + 短信都可以用，还是有限制？",
            isOptions: true,
            options: ["仅微信", "微信优先，短信补充", "仅短信"],
            customAction: 'channel_select'
          }];
        } else if (userMsgCount === 5) {
          return [...prev, { 
            role: 'ai', 
            text: "信息已齐全。我已为您圈选了目标人群：\n\n预估符合条件的人群有 12,450 人。如果您需要调整人群规则，请直接在下方输入您的具体修改要求（例如：“把时间范围扩大到最近30天”）；如果确认无误，我将为您匹配对应渠道的营销内容模板。",
            customAction: 'audience_confirm',
            isOptions: true,
            options: ["确认无误，查看渠道内容模板"]
          }];
        } else if (userMsgCount === 6) {
          return [...prev, {
            role: 'ai',
            text: "已根据您的渠道策略（微信优先，短信补充）匹配了以下高转化内容模板。您可以直接使用，或提出修改意见：",
            customAction: 'content_variants',
            isOptions: true,
            options: ["确认使用该组模板", "帮我把微信图文的语气改得更活泼一些", "短信文案太长了，精简一下"]
          }];
        } else if (userMsgCount === 7) {
          return [...prev, {
            role: 'ai',
            text: "好的，策略已就绪。点击下方按钮生成完整营销策略。",
            customAction: 'final_generate'
          }];
        }
        
        // Fallback
        return [...prev, { role: 'ai', text: "收到，请问还有其他补充吗？" }];
      });
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center shrink-0">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mr-4"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Ad-hoc Campaign · 新建</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600 ml-4' : 'bg-slate-100 text-slate-600 mr-4'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className="flex flex-col w-full">
                  <div className={`p-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                    {msg.text.split(/(12,450)/).map((part, i) => 
                      part === '12,450' ? <strong key={i} className="font-semibold">{part}</strong> : part
                    )}
                  </div>
                  
                  {/* Custom Action: Audience Confirm */}
                  {msg.customAction === 'audience_confirm' && (
                    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-slate-700 font-medium">
                          <Users className="w-4 h-4 mr-2 text-blue-500" />
                          目标人群规则与预估
                        </div>
                        <span className="text-xs text-slate-400">基于昨日数据</span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">包含条件</div>
                          <ul className="space-y-2">
                            <li className="flex items-start text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></span>
                              <div>
                                <span className="font-medium">行为：</span>浏览商品
                              </div>
                            </li>
                            <li className="flex items-start text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></span>
                              <div>
                                <span className="font-medium">时间：</span>11/01 - 11/11
                              </div>
                            </li>
                            <li className="flex items-start text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></span>
                              <div>
                                <span className="font-medium">商品属性：</span>系列 包含 ['Tabby', 'Niki']
                              </div>
                            </li>
                            <li className="flex items-start text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></span>
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="inline-flex items-center px-1 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium"><Sparkles className="w-3 h-3 mr-0.5" /> AI</span>
                                <span className="font-medium">智能模型：</span>购买倾向预测模型评分 &gt; 80 (高意向)
                              </div>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">排除条件</div>
                          <ul className="space-y-2">
                            <li className="flex items-start text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 mr-2 shrink-0"></span>
                              <div>
                                <span className="font-medium">行为：</span>支付订单
                              </div>
                            </li>
                            <li className="flex items-start text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 mr-2 shrink-0"></span>
                              <div>
                                <span className="font-medium">时间：</span>11/01 - 至今
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="text-sm text-slate-600">预估覆盖人数</div>
                        <div className="text-xl font-semibold text-blue-600">12,450 <span className="text-sm font-normal text-slate-500">人</span></div>
                      </div>
                    </div>
                  )}

                  {/* Custom Action: Content Variants */}
                  {msg.customAction === 'content_variants' && (
                    <div className="mt-3 space-y-3">
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded bg-[#07C160] flex items-center justify-center mr-2">
                              <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">微信图文 (首选渠道)</span>
                          </div>
                          <span className="text-xs text-slate-400">模板库匹配度 98%</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-sm font-medium text-slate-800 mb-1">【品牌名】您的专属福利已到账！</div>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            亲爱的会员，您关注的系列现已补货。我们为您精心挑选了{'$'}{'{'}recommendedProduct{'}'}，并准备了满1000减100的专属惊喜福利，点击{'$'}{'{'}productLink{'}'}立即挑选您的秋冬百搭单品...
                          </p>
                          <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex gap-2">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">变量: {'${'}recommendedProduct{'}'} (商品匹配模型)</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">变量: {'${'}productLink{'}'} (商品匹配模型)</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center mr-2">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">短信 (未读补充)</span>
                          </div>
                          <span className="text-xs text-slate-400">模板库匹配度 95%</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <p className="text-xs text-slate-600">
                            【品牌名】您关注的系列已补货！为您推荐{'$'}{'{'}recommendedProduct{'}'}，专属满1000减100福利已发至账户，戳 {'$'}{'{'}productLink{'}'} 立即选购，退订回T
                          </p>
                          <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex gap-2">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">变量: {'${'}recommendedProduct{'}'} (商品匹配模型)</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">变量: {'${'}productLink{'}'} (商品匹配模型)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Action: Final Generate */}
                  {msg.customAction === 'final_generate' && (
                    <div className="mt-4">
                      <button 
                        onClick={() => setView('ai-reasoning')}
                        className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        生成完整营销策略
                      </button>
                    </div>
                  )}

                  {/* Options */}
                  {msg.isOptions && msg.options && (
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="text-xs text-slate-400 mb-1 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-blue-400" />
                        您可以点击下方选项，或直接在底部输入框输入您的想法
                      </div>
                      {msg.options.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSend(opt)}
                          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-left shadow-sm"
                        >
                          {opt}
                        </button>
                      ))}
                      
                      {msg.customAction === 'offer_select' && (
                        <select 
                          onChange={(e) => {
                            if (e.target.value) setInput(e.target.value);
                          }}
                          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm appearance-none cursor-pointer"
                        >
                          <option value="">选择其他Offer...</option>
                          <option value="满2000减250">满2000减250</option>
                          <option value="购买指定系列赠送精美丝巾">购买指定系列赠送精美丝巾</option>
                          <option value="双倍会员积分">双倍会员积分</option>
                        </select>
                      )}

                      {msg.customAction === 'channel_select' && (
                        <select 
                          onChange={(e) => {
                            if (e.target.value) setInput(e.target.value);
                          }}
                          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm appearance-none cursor-pointer"
                        >
                          <option value="">选择其他触达渠道...</option>
                          <option value="App Push 优先，微信兜底">App Push 优先，微信兜底</option>
                          <option value="全渠道触达 (微信+短信+Push+邮件)">全渠道触达 (微信+短信+Push+邮件)</option>
                          <option value="仅邮件 (针对海外客户)">仅邮件 (针对海外客户)</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] flex-row">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-600 mr-4">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你的想法，或者直接点击上方的建议选项..." 
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isTyping}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
