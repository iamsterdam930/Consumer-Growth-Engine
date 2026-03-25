import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Audience } from '../types';
import { Bot, User, Send, Plus, ChevronRight, Info, Database, Tag, Activity, BrainCircuit, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

interface SmartAudienceAssistantProps {
  setView: (view: ViewState) => void;
  setAudiences?: React.Dispatch<React.SetStateAction<Audience[]>>;
}

type MessageType = 'question' | 'audience_result' | 'message';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  type: MessageType;
  text: string;
  options?: { id: string; label: string; selected?: boolean }[];
  results?: AudienceVersion[];
  isThinking?: boolean;
}

interface RuleDescNode {
  text: string;
  isAI?: boolean;
  indent?: number;
  prefix?: string;
}

interface AudienceVersion {
  id: string;
  label: string;
  type: 'wide' | 'standard' | 'precise';
  count: number;
  description: RuleDescNode[];
  dsl: string;
  logic: string;
  assumptions: { text: string; source: string }[];
  timestamp: string;
  isRecommended?: boolean;
}

export default function SmartAudienceAssistant({ setView, setAudiences }: SmartAudienceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [confirmVersionId, setConfirmVersionId] = useState<string | null>(null);
  const [dslModalContent, setDslModalContent] = useState<string | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickStarts = [
    "双十一大促，想主推鞋的品类，找购买意向高的客户",
    "找有潜力升级成白金卡的客户，做专属权益活动",
    "春节快到了，找有礼品购买习惯的老客",
    "沉睡客户想做唤回，LTV 比较高的优先"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'message',
      text: text
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);
    setThinkingSteps(['正在解析意图...']);

    const t = text.toLowerCase();

    // Edge Case 1: Vague Intent
    if (t === '帮我找些客户' || t === '找人' || t === '圈点人' || (t.length < 8 && t.includes('客户'))) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '检测到意图模糊，缺少关键业务实体...']), 500);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'message',
          text: '您的描述比较宽泛。为了更精准地圈选，请问您这次营销活动的**核心品类**是什么？**主要目标**是拉新、促活还是复购？'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setThinkingSteps([]);
      }, 1500);
      return;
    }

    // Edge Case 2: Non-existent Field
    if (t.includes('星座') || t.includes('血型') || t.includes('头发')) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '检索 CDP 元数据...']), 500);
      setTimeout(() => setThinkingSteps(prev => [...prev, '未找到匹配字段，搜索替代方案...']), 1500);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'message',
          text: '抱歉，当前 CDP 元数据中**没有「星座」字段**。\n\n如果您想针对特定时间段生日的客户，建议使用最近似的替代方案：`会员属性 -> 出生月份 (birth_month)`。需要我为您生成基于出生月份的规则吗？'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setThinkingSteps([]);
      }, 3000);
      return;
    }

    // Edge Case 3: Real-time Data
    if (t.includes('实时') || t.includes('马上触发') || t.includes('刚刚')) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '分析时效性要求...']), 500);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'message',
          text: '需要向您说明：当前人群圈选的底层全量计算时效为 **T+1**（基于昨日数据）。\n\n如果您需要基于用户「刚刚」的行为进行**实时触发**，建议在 MA（营销自动化）画布中使用「实时事件触发」组件，而非静态人群包。是否仍需按 T+1 时效生成当前规则？'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setThinkingSteps([]);
      }, 1500);
      return;
    }

    // Edge Case 4: Exact Count
    if (t.includes('精确') || t.includes('个位') || t.includes('具体多少人')) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '解析查询精度要求...']), 500);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'message',
          text: '目前界面上展示的人数是基于 HyperLogLog 算法的**预估值（误差范围 ±15%）**，用于快速探索。\n\n如果您需要精确到个位的绝对真实数字，需要点击右上角的「保存人群」并等待底层全量计算任务执行完毕（约需 2-5 分钟）。'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setThinkingSteps([]);
      }, 1500);
      return;
    }

    // Edge Case 5: AEE Native Expression Limit
    if (t.includes('连续') && (t.includes('天') || t.includes('未登录') || t.includes('购买'))) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '解析复杂序列规则...']), 500);
      setTimeout(() => setThinkingSteps(prev => [...prev, '校验 AEE (Audience Execution Engine) 原生表达能力...']), 1500);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'message',
          text: '您要求的「连续 N 天」属于复杂的序列依赖条件，当前 AEE（人群执行引擎）无法原生表达。\n\n**替代方案**：\n1. 我们可以用业务近似条件「近 3 天内购买次数 ≥ 3」来代替。\n2. 或者我为您调用底层 SQL 节点，生成一个临时标签 `tag_consecutive_buyer_3d`。\n\n您倾向于哪种？'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setThinkingSteps([]);
      }, 3000);
      return;
    }

    // Edge Case 6: Reuse Historical Audience
    if (t.includes('复用') || t.includes('上次') || t.includes('历史人群')) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '提取历史人群引用...']), 500);
      setTimeout(() => setThinkingSteps(prev => [...prev, '检索人群库 (匹配 audience_20241111_bag_intent)...']), 1500);
      setTimeout(() => {
        const reusedRule: AudienceVersion = {
          id: 'v_reused',
          label: '复用历史人群',
          type: 'standard',
          count: 45230,
          description: [
            { text: '在历史人群「audience_20241111_bag_intent」中', indent: 0, prefix: 'IN' },
            { text: '且满足追加条件：', indent: 0, prefix: 'AND' },
            { text: '近 30 天内有活跃行为', indent: 1, prefix: '•' }
          ],
          dsl: '{"operator": "AND", "rules": [{"field": "audience_id", "operator": "in", "value": "audience_20241111_bag_intent"}, {"field": "active_30d", "operator": "==", "value": true}]}',
          logic: '直接引用历史人群包作为 Base，叠加近期活跃条件',
          assumptions: [
            { text: '已成功检索到您提到的历史人群 audience_20241111_bag_intent', source: '系统检索' }
          ],
          timestamp: '刚刚'
        };

        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'audience_result',
          text: '已为您找到该历史人群，并基于此生成了新的圈选规则：',
          results: [reusedRule]
        };
        setMessages(prev => [...prev, aiMsg]);
        setHasResults(true);
        setIsTyping(false);
        setThinkingSteps([]);
      }, 3000);
      return;
    }

    // Edge Case 7: Save Intent
    const isSaveIntent = t.includes('保存人群') || 
                         t.includes('创建人群') || 
                         t.includes('就这个了') || 
                         t.includes('保存吧') || 
                         t === '保存' || 
                         t === '保存当前人群';
                         
    if (isSaveIntent) {
      if (!selectedVersion) {
        setTimeout(() => setThinkingSteps(prev => [...prev, '检查当前状态...']), 500);
        setTimeout(() => {
          const aiMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            type: 'message',
            text: '请先在右侧面板选择一个您满意的人群规则版本，然后再进行保存操作。'
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
          setThinkingSteps([]);
        }, 1500);
        return;
      }

      setTimeout(() => setThinkingSteps(prev => [...prev, '正在提交保存任务...']), 500);
      setTimeout(() => setThinkingSteps(prev => [...prev, '生成底层全量计算任务...']), 1500);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          type: 'message',
          text: '🎉 **人群保存成功！**\n\n底层全量计算任务已提交，预计 2-5 分钟后可查看精确人数。您现在可以在「人群列表」中查看和管理该人群，或者直接在 MA 画布中引用它。\n\n*(即将为您跳转至人群列表...)*'
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setThinkingSteps([]);
        
        if (setAudiences) {
          const latestResults = messages.slice().reverse().find(m => m.type === 'audience_result')?.results;
          const lockedRule = latestResults?.find(r => r.id === selectedVersion);
          if (lockedRule) {
            const fullDescription = lockedRule.description
              .filter(d => !d.text.includes('满足') && !d.text.includes('条件：'))
              .map(d => d.text.replace(/^[•\s]+/, ''))
              .join(' AND ');

            // Generate a concise name from the final rules
            let keywords: string[] = [];
            
            // Extract entities in quotes/brackets
            const bracketsMatch = fullDescription.match(/[「【"']([^」】"']+)['"】」]/g);
            if (bracketsMatch) {
              keywords.push(...bracketsMatch.map(m => m.replace(/[「【"']/g, '').replace(/[」】"']/g, '')));
            }
            
            // Extract common business intents
            if (fullDescription.includes('活跃')) keywords.push('活跃');
            if (fullDescription.includes('潜力') || fullDescription.includes('得分')) keywords.push('高潜力');
            if (fullDescription.includes('未购') || fullDescription.includes('未下')) keywords.push('未购');
            if (fullDescription.includes('复购')) keywords.push('复购');
            if (fullDescription.includes('浏览') || fullDescription.includes('加购') || fullDescription.includes('意向')) keywords.push('高意向');
            if (fullDescription.includes('沉睡')) keywords.push('沉睡');
            if (fullDescription.includes('流失')) keywords.push('流失');
            if (fullDescription.includes('新客')) keywords.push('新客');
            
            // Deduplicate and join
            let generatedName = Array.from(new Set(keywords)).slice(0, 3).join('');
            
            // Fallback if no keywords found
            if (!generatedName) {
              const firstUserMsg = messages.find(m => m.role === 'user')?.text || '自定义';
              generatedName = firstUserMsg
                .replace(/^(帮我|请帮我|圈选|找一下|筛选|帮我圈选|我想找|找)/g, '')
                .replace(/[，。、！？；：,.!?;:\s]/g, '')
                .substring(0, 8);
            }
            
            if (!generatedName.endsWith('人群')) {
              generatedName += '人群';
            }

            const newAudience: Audience = {
              id: `audience_${Date.now()}`,
              name: generatedName,
              description: fullDescription,
              count: lockedRule.count,
              updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).substring(0, 16).replace(/\//g, '-'),
              status: 'calculating'
            };
            setAudiences(prev => [newAudience, ...prev]);
          }
        }

        setTimeout(() => setView('audience-list'), 3000);
      }, 3000);
      return;
    }

    if (selectedVersion) {
      setTimeout(() => setThinkingSteps(prev => [...prev, '正在评估当前锁定规则...']), 1000);
      setTimeout(() => setThinkingSteps(prev => [...prev, '解析追加条件与意图...']), 2500);
      setTimeout(() => setThinkingSteps(prev => [...prev, '更新底层 DSL 逻辑...']), 4000);
      setTimeout(() => {
        const latestResults = messages.slice().reverse().find(m => m.type === 'audience_result')?.results;
        const lockedRule = latestResults?.find(r => r.id === selectedVersion);

        if (lockedRule) {
          const t = text.toLowerCase();
          
          let newDescription = [...lockedRule.description];
          let newCount = lockedRule.count;
          let newLogic = lockedRule.logic;
          let newAssumptions = [...lockedRule.assumptions];
          let newDsl = lockedRule.dsl;

          // 1. Explicit Score Modification (e.g., "第二个条件，改成得分大于0.75")
          const scoreMatch = t.match(/0\.\d+/);
          if (scoreMatch || (t.includes('改成') && t.includes('得分'))) {
            const newScore = scoreMatch ? scoreMatch[0] : '0.75';
            let modified = false;
            newDescription = newDescription.map(desc => {
              if (desc.isAI && (desc.text.includes('0.7') || desc.text.includes('0.6') || desc.text.includes('0.8'))) {
                modified = true;
                return { ...desc, text: desc.text.replace(/0\.\d+/, newScore) };
              }
              return desc;
            });
            
            if (modified) {
              newDsl = newDsl.replace(/0\.\d+/g, newScore);
              newCount = Math.floor(lockedRule.count * (parseFloat(newScore) > 0.7 ? 0.8 : 1.2));
              newLogic = `直接执行明确指令：将 AI 模型得分阈值修改为 ${newScore}`;
              newAssumptions.unshift({ text: `识别到明确的修改指令，已直接将模型阈值修改为 ${newScore}，未追加额外条件`, source: '用户指令' });
            } else {
              newDescription.push({ text: "且满足追加条件：", indent: 0, prefix: "AND" });
              newDescription.push({ text: `跨品类购买潜力得分 > ${newScore}`, indent: 1, prefix: "•", isAI: true });
              newCount = Math.floor(lockedRule.count * 0.8);
              newLogic = `直接执行明确指令：追加了模型得分大于 ${newScore} 的条件`;
              newAssumptions.unshift({ text: `根据您的明确指令，追加了得分阈值条件`, source: '用户指令' });
            }
          }
          // 2. Explicit Time Modification (e.g., "改成180天")
          else if (t.includes('180天') || t.includes('180')) {
            let modified = false;
            newDescription = newDescription.map(desc => {
              if (desc.text.includes('90 天')) {
                modified = true;
                return { ...desc, text: desc.text.replace('90 天', '180 天') };
              }
              return desc;
            });
            
            if (modified) {
              newDsl = newDsl.replace(/90d/g, '180d');
              newCount = Math.floor(lockedRule.count * 1.45);
              newLogic = '直接执行明确指令：放宽行为事件的时间窗口，从近 90 天扩展至近 180 天';
              newAssumptions.unshift({ text: '识别到明确的修改指令，已直接将时间限制修改为 180 天，未追加额外条件', source: '用户指令' });
            } else {
              newDescription.push({ text: "且满足追加条件：", indent: 0, prefix: "OR" });
              newDescription.push({ text: "近 180 天内有商品浏览行为", indent: 1, prefix: "•" });
              newCount = Math.floor(lockedRule.count * 1.3);
              newLogic = '直接执行明确指令：追加了 180 天的时间窗口条件';
              newAssumptions.unshift({ text: '已根据您的明确指令追加时间限制', source: '用户指令' });
            }
          }
          // 3. Vague Intent: Too many people / Not enough budget
          else if (t.includes('预算') || t.includes('太多') || t.includes('精简') || t.includes('发不了')) {
            newDescription.push({ text: "且满足追加条件：", indent: 0, prefix: "AND" });
            newDescription.push({ text: "最近 30 天内有活跃行为 (App 登录或小程序访问)", indent: 1, prefix: "•" });
            newCount = Math.floor(lockedRule.count * 0.6);
            newLogic = '识别到缩减人群/预算控制的模糊意图，AI 主动建议叠加近期活跃度限制以提升转化率';
            newAssumptions.unshift({ text: `根据您"${text.substring(0, 10)}..."的模糊意图，AI 建议叠加高活跃条件来精准缩减人数`, source: 'AI 建议' });
          }
          // 4. Vague Intent: Too few people
          else if (t.includes('太少') || t.includes('扩大') || t.includes('不够')) {
            let modified = false;
            newDescription = newDescription.map(desc => {
              if (desc.isAI && desc.text.includes('0.7')) {
                modified = true;
                return { ...desc, text: desc.text.replace('0.7', '0.5') };
              }
              return desc;
            });
            
            if (modified) {
              newDsl = newDsl.replace(/0\.7/g, '0.5');
              newCount = Math.floor(lockedRule.count * 1.8);
              newLogic = '识别到扩大人群的模糊意图，AI 主动建议降低模型得分阈值以扩大召回';
              newAssumptions.unshift({ text: `根据您"${text.substring(0, 10)}..."的模糊意图，AI 建议将潜力得分阈值从 0.7 降低至 0.5`, source: 'AI 建议' });
            } else {
              newDescription.push({ text: "或满足追加条件：", indent: 0, prefix: "OR" });
              newDescription.push({ text: "历史购买偏好包含「服饰」", indent: 1, prefix: "•" });
              newCount = Math.floor(lockedRule.count * 1.5);
              newLogic = '识别到扩大人群的模糊意图，AI 主动建议放宽品类偏好限制';
              newAssumptions.unshift({ text: `根据您"${text.substring(0, 10)}..."的模糊意图，AI 建议增加相关品类偏好来扩大人群池`, source: 'AI 建议' });
            }
          }
          // 5. Generic Explicit Addition
          else {
            newDescription.push({ text: "且满足追加条件：", indent: 0, prefix: "AND" });
            newDescription.push({ text: text, indent: 1, prefix: "•" });
            newCount = Math.floor(lockedRule.count * 0.85);
            newLogic = '直接执行明确指令：追加了新的过滤条件';
            newAssumptions.unshift({ text: `已直接将您的输入作为追加条件执行`, source: '用户指令' });
          }

          const updatedRule: AudienceVersion = {
            ...lockedRule,
            count: newCount,
            description: newDescription,
            dsl: newDsl,
            logic: newLogic,
            assumptions: newAssumptions,
            timestamp: '刚刚'
          };

          const newResultMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            type: 'audience_result',
            text: '已根据您的要求更新了当前版本的人群规则。',
            results: [updatedRule]
          };

          setMessages(prev => [...prev, newResultMsg]);
        }
        setIsTyping(false);
        setThinkingSteps([]);
      }, 5500);
      return;
    }

    // Simulate AI response based on the specific scenario
    setTimeout(() => {
      if (text.includes('鞋') && text.includes('意向高')) {
        setThinkingSteps(prev => [...prev, '提取关键实体: 双十一, 鞋履, 意向高...']);
        setTimeout(() => setThinkingSteps(prev => [...prev, '识别到多维度意向信号，需要用户澄清...']), 1500);
        setTimeout(() => {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            type: 'question',
            text: '明白！鞋履品类的双十一圈人。「购买意向高」我可以从几个维度来解读，请选一下你最看重哪类信号：',
            options: [
              { id: 'A', label: 'A · 近期明确行为：90 天内有加购/加心愿单/浏览≥3 次' },
              { id: 'B', label: 'B · 历史偏好：有过鞋履购买记录的老客' },
              { id: 'C', label: 'C · AI 高潜标签：系统判断跨品类或复购潜力高的客户' },
              { id: 'D', label: 'D · 以上都要，给我分口径出几个版本' }
            ]
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
          setThinkingSteps([]);
        }, 3000);
      } else {
        // Generic fallback
        setThinkingSteps(prev => [...prev, '提取关键实体与业务场景...']);
        setTimeout(() => setThinkingSteps(prev => [...prev, '检索 CDP 元数据 (匹配 preferred_category, purchase_complete)...']), 1500);
        setTimeout(() => setThinkingSteps(prev => [...prev, '生成多版本规则...']), 3000);
        setTimeout(() => {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            type: 'message',
            text: '我理解了您的需求。正在为您分析 CDP 数据并生成人群规则...'
          };
          setMessages(prev => [...prev, aiMsg]);
          
          setTimeout(() => {
            generateResults();
          }, 1500);
        }, 4500);
      }
    }, 800);
  };

  const handleOptionSelect = (msgId: string, optionId: string, optionLabel: string) => {
    // Mark option as selected
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.options) {
        return {
          ...msg,
          options: msg.options.map(opt => ({
            ...opt,
            selected: opt.id === optionId
          }))
        };
      }
      return msg;
    }));

    // Add user message for the selection
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'message',
      text: optionLabel
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);
    setThinkingSteps(['正在接收选择 (偏好: 综合多维度)...']);

    // Generate results
    setTimeout(() => setThinkingSteps(prev => [...prev, '检索 CDP 元数据 (匹配 product_view, add_to_cart)...']), 1500);
    setTimeout(() => setThinkingSteps(prev => [...prev, '调用大模型生成 DSL 规则...']), 3000);
    setTimeout(() => setThinkingSteps(prev => [...prev, '校验规则与 CDP 元数据的一致性...']), 4500);
    setTimeout(() => {
      generateResults();
    }, 6000);
  };

  const generateResults = () => {
    const resultsMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      type: 'audience_result',
      text: '好的，已为你生成 3 个口径版本，详情见右侧面板。 · 版本 A（宽口径）约 68,200 人：包含鞋履偏好属性 + AI 高潜标签 · 版本 B（标准）约 38,500 人：鞋履偏好 + 近 90 天有浏览行为 · 版本 C（精准）约 12,400 人：有加购/加心愿单的明确意向行为 AI 推荐版本 B，大促场景下覆盖和转化率的平衡最优。',
      results: [
        {
          id: 'v_wide',
          label: '版本 A · 宽口径',
          type: 'wide',
          count: 68200,
          description: [
            { text: '满足以下任一条件：', indent: 0 },
            { text: '历史购买偏好包含「鞋履」', indent: 1, prefix: '•' },
            { text: '跨品类购买潜力得分 > 0.7', indent: 1, prefix: '•', isAI: true }
          ],
          dsl: '{"operator": "OR", "rules": [{"field": "preferred_category", "operator": "contains", "value": "鞋履"}, {"field": "tag_cross_category_potential", "operator": ">", "value": 0.7}]}',
          logic: '用 AI 系统标签 + 偏好属性，覆盖最大潜在人群',
          assumptions: [
            { text: 'tag_cross_category_potential 分 > 0.7 为模型内部阈值，结合品类偏好使用', source: 'AI 推理' }
          ],
          timestamp: 'T+1 (截至昨日)'
        },
        {
          id: 'v_standard',
          label: '版本 B · 标准',
          type: 'standard',
          count: 38500,
          description: [
            { text: '满足以下所有条件：', indent: 0 },
            { text: '历史购买偏好包含「鞋履」', indent: 1, prefix: '•' },
            { text: '近 90 天内有商品浏览行为', indent: 1, prefix: '•' },
            { text: '且满足以下任一条件：', indent: 0, prefix: 'AND' },
            { text: '跨品类购买潜力得分 > 0.7', indent: 1, prefix: '•', isAI: true },
            { text: '复购概率模型得分 > 0.6', indent: 1, prefix: '•', isAI: true }
          ],
          dsl: '{"operator": "AND", "rules": [{"field": "preferred_category", "operator": "contains", "value": "鞋履"}, {"field": "product_view.view_duration_seconds", "operator": ">", "value": 0, "timeWindow": "90d"}]}',
          logic: '标签 + 近期行为事件组合，平衡覆盖和精准',
          assumptions: [
            { text: '奢侈品鞋履复购窗口通常为 6-12 个月，因此设定近 6 月内有购买记录', source: '行业经验' }
          ],
          timestamp: 'T+1 (截至昨日)',
          isRecommended: true
        },
        {
          id: 'v_precise',
          label: '版本 C · 精准',
          type: 'precise',
          count: 12400,
          description: [
            { text: '满足以下任一条件：', indent: 0 },
            { text: '近 90 天内加购过「鞋履」', indent: 1, prefix: '•' },
            { text: '近 90 天内将「鞋履」加入心愿单', indent: 1, prefix: '•' },
            { text: '近 90 天内浏览「鞋履」≥ 3次', indent: 1, prefix: '•' }
          ],
          dsl: '{"operator": "OR", "rules": [{"field": "add_to_cart.product_category", "operator": "==", "value": "鞋履", "timeWindow": "90d"}, {"field": "add_to_wishlist.product_category", "operator": "==", "value": "鞋履", "timeWindow": "90d"}, {"field": "product_view.product_category", "operator": "==", "value": "鞋履", "timeWindow": "90d", "count": {">=": 3}}]}',
          logic: '明确高意向行为（加购/心愿单/近期多次浏览）',
          assumptions: [
            { text: '参照 24 双十一人群 audience_20241111_bag_intent，心愿单是手袋意向最强信号', source: '历史数据' },
            { text: '「购买意向高」的定义需要你确认：是优先看近期浏览行为还是心愿单行为？', source: '待确认' }
          ],
          timestamp: 'T+1 (截至昨日)'
        }
      ]
    };
    
    setMessages(prev => [...prev, resultsMsg]);
    setHasResults(true);
    setIsTyping(false);
    setThinkingSteps([]);
  };

  const handleConfirmVersion = (versionId: string) => {
    setConfirmVersionId(versionId);
  };

  const executeConfirmVersion = () => {
    if (confirmVersionId) {
      setSelectedVersion(confirmVersionId);
      
      const confirmMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        type: 'message',
        text: '已确认选择该版本规则。您可以继续在对话框中提出修改意见，接下来的所有调整都将基于此版本进行。'
      };
      setMessages(prev => [...prev, confirmMsg]);
      setConfirmVersionId(null);
    }
  };

  const currentResults = messages.slice().reverse().find(m => m.type === 'audience_result')?.results;

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* Left Column: Chat Area */}
      <div className="w-[450px] flex flex-col bg-white border-r border-slate-200 shrink-0 shadow-sm relative z-10">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200 flex items-center justify-end px-4 bg-white shrink-0">
          <button 
            onClick={() => {
              setMessages([]);
              setHasResults(false);
              setSelectedVersion(null);
              setThinkingSteps([]);
            }}
            className="text-sm flex items-center text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新对话
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">您好，我是智能人群助手</h3>
                <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
                  用自然语言描述您想找的人群，我会帮您翻译成精准的人群规则。
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 px-1">您可以这样问我：</div>
                {quickStarts.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(text)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all text-sm text-slate-700 flex items-start group"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-300 mt-0.5 mr-2 shrink-0 group-hover:text-blue-500" />
                    <span className="leading-relaxed">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mr-3 mt-1">
                        <Bot className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                    
                    <div className="flex flex-col">
                      <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-[#111827] text-white rounded-tr-sm' 
                          : 'bg-[#F9FAFB] border border-[#E5E7EB] text-slate-800 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      
                      {/* Options for question type */}
                      {msg.type === 'question' && msg.options && (
                        <div className="mt-3 space-y-2">
                          {msg.options.map(opt => (
                            <button
                              key={opt.id}
                              disabled={msg.options?.some(o => o.selected)}
                              onClick={() => handleOptionSelect(msg.id, opt.id, opt.label)}
                              className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                                opt.selected 
                                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
                                  : msg.options?.some(o => o.selected)
                                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                    : 'border-blue-200 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                          {!msg.options?.some(o => o.selected) && (
                            <div className="text-xs text-slate-400 text-center mt-2">或在下方直接输入</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex flex-row max-w-[90%]">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mr-3 mt-1">
                      <Bot className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] rounded-tl-sm flex flex-col space-y-2 min-w-[200px]">
                      {thinkingSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center text-sm text-slate-600">
                          {idx === thinkingSteps.length - 1 ? (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                          )}
                          {step}
                        </div>
                      ))}
                      {thinkingSteps.length === 0 && (
                        <div className="flex items-center space-x-1 h-5">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="relative flex items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="描述您想找的人群... (Shift+Enter 换行)"
              className="w-full max-h-32 min-h-[44px] py-3 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={1}
              style={{ height: 'auto' }}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors ${
                inputValue.trim() && !isTyping ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Results Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-base font-semibold text-slate-900">
              {hasResults ? '人群规则方案' : 'CDP 数据概览'}
            </h2>
            {hasResults && !selectedVersion && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                3 个版本
              </span>
            )}
            {selectedVersion && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> 已锁定版本
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setView('audience-list')}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={() => handleSend('保存当前人群')}
              disabled={!selectedVersion}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedVersion ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              保存人群
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasResults ? (
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">智能洞察，精准圈人</h1>
                <p className="text-slate-500">无需记忆复杂的字段和枚举值，用业务语言描述需求，AI 自动匹配最合适的 CDP 规则。</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-slate-900">会员属性</h3>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">共 128 个</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100">近期高频使用示例：</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">member_tier</span>
                      <span className="text-slate-700">普通/银卡/金卡/白金/黑卡</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">preferred_category</span>
                      <span className="text-slate-700">手袋/鞋履/珠宝/腕表...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">total_ltv</span>
                      <span className="text-slate-700">数值 (元)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center mr-3">
                        <Activity className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-medium text-slate-900">行为事件</h3>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">共 45 个</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100">近期高频使用示例：</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">purchase_complete</span>
                      <span className="text-slate-700">成交事件</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">product_view</span>
                      <span className="text-slate-700">商品浏览</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">add_to_wishlist</span>
                      <span className="text-slate-700">加入心愿单</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center mr-3">
                        <Tag className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-medium text-slate-900">会员标签</h3>
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">共 356 个</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100">近期高频使用示例：</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">tag_high_value</span>
                      <span className="text-slate-700">LTV &gt; 50,000 元</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">tag_dormant_90d</span>
                      <span className="text-slate-700">90-180 天未购买</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">tag_gift_buyer</span>
                      <span className="text-slate-700">礼品标记比例 &gt; 30%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center mr-3">
                        <BrainCircuit className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="font-medium text-slate-900">机器学习模型</h3>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">共 12 个</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100">近期高频使用示例：</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">tag_repurchase_potential</span>
                      <span className="text-slate-700">复购概率模型</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">tag_upgrade_potential</span>
                      <span className="text-slate-700">会员升级潜力</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">tag_cross_category</span>
                      <span className="text-slate-700">跨品类购买潜力</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start text-xs text-slate-500 bg-slate-100 p-3 rounded-lg">
                <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                <p>所有规则基于 CDP 元数据和可用的机器学习模型，枚举值精确匹配，数据时效 T+1。</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Reference Audience (Mock) */}
              {!selectedVersion && (
                <div className="flex items-start p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
                  <Info className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">历史人群参考</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      发现相似历史人群 <span className="font-medium text-slate-800">audience_20241111_bag_intent</span> (双十一手袋高意向人群, 45,230人)。
                      本次生成的规则参考了该人群的意向信号提取逻辑。
                    </p>
                  </div>
                </div>
              )}

              {currentResults?.filter(v => !selectedVersion || v.id === selectedVersion).map((version) => (
                <div 
                  key={version.id} 
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    selectedVersion === version.id 
                      ? 'border-[#A7F3D0] ring-1 ring-[#A7F3D0] shadow-md' 
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`px-5 py-4 border-b flex items-center justify-between ${
                    version.type === 'wide' ? 'bg-blue-50/50 border-blue-100' :
                    version.type === 'standard' ? 'bg-emerald-50/50 border-emerald-100' :
                    'bg-amber-50/50 border-amber-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                        version.type === 'wide' ? 'bg-blue-100 text-blue-700' :
                        version.type === 'standard' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {version.label}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        约 {version.count.toLocaleString()} 人
                      </span>
                      {version.isRecommended && !selectedVersion && (
                        <span className="flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          <Sparkles className="w-3 h-3 mr-1" /> AI 推荐
                        </span>
                      )}
                    </div>
                    {!selectedVersion && (
                      <button 
                        onClick={() => handleConfirmVersion(version.id)}
                        className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                      >
                        选择此版本
                      </button>
                    )}
                    {selectedVersion === version.id && (
                      <div className="flex items-center text-emerald-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> 已选择
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-2">人群规则描述</h4>
                      <ul className="space-y-2">
                        {version.description.map((desc, i) => (
                          <li key={i} className={`flex items-start text-sm text-slate-700 ${desc.indent ? 'ml-4' : ''}`}>
                            {desc.prefix === '•' ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0"></span>
                            ) : desc.prefix ? (
                              <span className="text-xs font-semibold text-blue-600 mr-2 mt-0.5">{desc.prefix}</span>
                            ) : null}
                            <span className={desc.indent === 0 ? 'font-medium text-slate-900' : ''}>{desc.text}</span>
                            {desc.isAI && (
                              <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-medium border border-purple-100">
                                <BrainCircuit className="w-3 h-3 mr-1" />
                                AI 模型
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* DSL Section */}
                    <div className="mb-4">
                      <button 
                        onClick={() => setDslModalContent(version.dsl)}
                        className="flex items-center text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 mr-1" />
                        查看底层 DSL 规则
                      </button>
                    </div>

                    {/* Logic & Assumptions */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">规则逻辑说明</span>
                        <p className="text-sm text-slate-700 mt-1">{version.logic}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">关键假设与来源</span>
                        <div className="mt-1.5 space-y-2">
                          {version.assumptions.map((assump, i) => (
                            <div key={i} className="flex items-start text-xs">
                              <span className={`px-1.5 py-0.5 rounded mr-2 shrink-0 font-medium ${
                                assump.source === '待确认' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {assump.source}
                              </span>
                              <span className="text-slate-600 mt-0.5">{assump.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center">
                        <Database className="w-3.5 h-3.5 mr-1" />
                        数据时间戳: {version.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DSL Modal */}
      {dslModalContent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">底层 DSL 规则</h3>
              <button 
                onClick={() => setDslModalContent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                关闭
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-900 rounded-b-xl">
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(JSON.parse(dslModalContent), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Version Modal */}
      {confirmVersionId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] max-w-[90vw] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">确认选择版本</h3>
            </div>
            <div className="p-6 text-slate-600">
              是否基于此版本的人群规则继续？确认后，接下来的所有调整都将基于此版本进行。
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setConfirmVersionId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeConfirmVersion}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
