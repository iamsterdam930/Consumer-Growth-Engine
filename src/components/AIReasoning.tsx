import { useEffect, useState } from 'react';
import { ViewState, Strategy } from '../types';
import { generateStrategyWithFallback } from '../services/aiService';
import { CheckCircle2, Loader2, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function AIReasoning({ setView, setStrategy, briefData, setReasoningSteps }: { setView: (v: ViewState) => void, setStrategy: (s: Strategy) => void, briefData?: any, setReasoningSteps?: (steps: any[]) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMsg, setStatusMsg] = useState("正在初始化...");

  const dynamicSteps = [
    { id: 1, title: '理解业务意图', details: [`场景：${briefData?.scenario || '首单转复购'} · Offer：${briefData?.offer || '满1000减100'} · 周期：${briefData?.duration || 15}天`, `细化目标：${briefData?.specificGoal || '无'}`, `细化人群：${briefData?.refinedAudience || '无'}`, '判断：活动周期（15d）≥ 观测窗口（15d），支持 A/B 测试', '⚠️ 提示：对照组样本量较小（782人），建议仅做方向性参考或提升比例', '策略方向：生成包含对照组的 A/B 测试方案，强化 Offer 时效感'] },
    { id: 2, title: '检索历史活动经验', details: ['▸ 调用：knowledge_base.search("首单转复购 Coach 大中华")', '▸ 结果：找到 6 条相关历史活动', '  · 2024 Q3 复购活动：T+7 发券，转化率 3.2%（对照组 1.8%）', '  · 2024 母亲节：T+3 发内容 + T+7 发券，转化率 4.1%', '判断：采用两波次策略（T+5 内容预热，T+8 Offer 逼单）'] },
    { id: 3, title: '构建目标人群规则', details: ['▸ 调用：aee.estimate_segment(...)', '▸ 结果：预估人群 7,821 人（对照组预留 782 人）', '⚠️ 注：部分用户因渠道不可达被过滤（原始 8,463 人）'] },
    { id: 4, title: '渠道分配', details: ['▸ 调用：channel.check_availability(...)', '▸ 结果：微信可达 6,104 人（78%），短信补发 1,717 人（22%）', '系统偏好：优先微信（免费渠道），短信作为降级'] },
    { id: 5, title: '组装画布结构', details: ['▸ 调用：canvas.generate(...)', '▸ 正在生成 graphJson...'] },
    { id: 6, title: '校验合法性', details: ['▸ 待调用：aee.validate_dsl()', '▸ 待调用：canvas.validate_graph()'] },
  ];

  useEffect(() => {
    if (setReasoningSteps) {
      setReasoningSteps(dynamicSteps);
    }
    let isMounted = true;
    
    // Simulate visual progress
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < dynamicSteps.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    // Actual API call
    generateStrategyWithFallback(briefData || { scenario: '首单转复购', offer: '满1000减100', duration: 15 }, (msg) => {
      if (isMounted) setStatusMsg(msg);
    }).then(({ data }) => {
      if (isMounted) {
        setStrategy(data);
        // Ensure all steps are shown before transitioning
        setTimeout(() => {
          setView('strategy-review');
        }, 2000);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setView, setStrategy, briefData, setReasoningSteps]);

  const progress = Math.min((currentStep / dynamicSteps.length) * 100, 100);

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 p-8 font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-xl font-semibold text-slate-900 flex items-center">
            <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
            AI 正在生成策略方案...
          </h1>
          <span className="text-sm text-slate-500">{statusMsg}</span>
        </div>

        <div className="mb-8 pb-6 border-b border-slate-100">
          <div className="flex justify-between text-xs mb-2 text-slate-500">
            <span>{Math.round(progress)}%</span>
            <span>{progress < 100 ? '预计还需几秒...' : '即将完成...'}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 px-4 custom-scrollbar">
          <div className="text-sm text-slate-500 mb-4 font-medium">🧠 推理过程（Chain of Thought）</div>
          
          {dynamicSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            if (isPending) return null;

            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-2 border-slate-200 pl-6 relative ml-2"
              >
                <div className="absolute -left-[9px] top-0 bg-white py-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-white" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin bg-white" />
                  )}
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className={`font-medium ${isCompleted ? 'text-slate-700' : 'text-blue-600'}`}>
                    步骤 {step.id}  {step.title}
                  </span>
                  <span className="text-xs text-slate-500">{isCompleted ? '✓ 完成' : '● 进行中'}</span>
                </div>
                <div className="space-y-1 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono">
                  {step.details.map((detail, i) => (
                    <div key={i} className={detail.startsWith('⚠️') ? 'text-amber-600' : ''}>
                      {detail}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
