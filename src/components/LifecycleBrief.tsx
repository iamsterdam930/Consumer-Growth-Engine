import { ArrowLeft, Info, Calendar, AlertTriangle, ChevronDown, Check, Eye } from 'lucide-react';
import { ViewState } from '../types';
import { useState } from 'react';
import { getDynamicDate } from '../utils/date';

const CHANNELS = [
  { id: 'wechat_oa', name: '微信公众号' },
  { id: 'wechat_mp', name: '微信小程序' },
  { id: 'sms', name: '短信' },
  { id: 'email', name: '邮件' }
];

const TEMPLATES: Record<string, { id: string, name: string }[]> = {
  wechat_oa: [
    { id: 'oa_1', name: '【双十一返场】尊享复购礼遇图文' },
    { id: 'oa_2', name: '【日常】经典款推荐与关怀推送' },
    { id: 'oa_3', name: '【上新】秋冬新品优先体验邀请' }
  ],
  wechat_mp: [
    { id: 'mp_1', name: '小程序首页弹窗：复购专享券' },
    { id: 'mp_2', name: '服务通知：您的专属福利已到账' }
  ],
  sms: [
    { id: 'sms_1', name: '【品牌名】尊敬的会员，您的专属复购福利...' },
    { id: 'sms_2', name: '【品牌名】感谢您的首次购买，特赠...' }
  ],
  email: [
    { id: 'email_1', name: 'Thank you for your purchase - Exclusive Offer Inside' }
  ]
};

const OFFERS = [
  { id: '1', name: `满 1,000 减 100 (有效期至 ${getDynamicDate(30)}, 库存: 5,000)` },
  { id: '2', name: `满 500 减 50 (有效期至 ${getDynamicDate(30)}, 库存: 10,000)` },
  { id: '3', name: `9 折优惠码 VIP90 (有效期至 ${getDynamicDate(15)}, 不限量)` },
  { id: '4', name: '无门槛 50 元代金券 (有效期 7 天, 库存: 2,000)' },
  { id: '5', name: '随单赠送精美定制帆布袋 (库存: 800)' },
  { id: '6', name: '随单赠送香水体验装 2ml (库存: 3,000)' },
  { id: '7', name: '本次消费双倍积分 (不限量)' },
  { id: '8', name: '免费尊享礼盒包装服务 (不限量)' },
  { id: 'none', name: '本次不使用 Offer（仅发送内容触达）' }
];

export default function LifecycleBrief({ setView, setBriefData }: { setView: (v: ViewState) => void, setBriefData?: (data: any) => void }) {
  const [selectedOffer, setSelectedOffer] = useState('1');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['oa_1']);
  const [triggerDays, setTriggerDays] = useState(15);
  const [excludeReturns, setExcludeReturns] = useState(true);
  const [minOrderValue, setMinOrderValue] = useState('');
  const [targetCategory, setTargetCategory] = useState('cross_sell');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeModalChannel, setActiveModalChannel] = useState(CHANNELS[0].id);
  const [tempSelectedTemplates, setTempSelectedTemplates] = useState<string[]>([]);

  const openTemplateModal = () => {
    setTempSelectedTemplates([...selectedTemplates]);
    setActiveModalChannel(CHANNELS[0].id);
    setIsTemplateModalOpen(true);
  };

  const confirmTemplateSelection = () => {
    setSelectedTemplates(tempSelectedTemplates);
    setIsTemplateModalOpen(false);
  };

  const toggleTempTemplate = (id: string) => {
    setTempSelectedTemplates(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const removeTemplate = (id: string) => {
    setSelectedTemplates(prev => prev.filter(t => t !== id));
  };

  const handleGenerate = () => {
    if (setBriefData) {
      const categoryMap: Record<string, string> = {
        'all': '不限品类',
        'same': '同品类复购',
        'cross_sell': '跨品类连带'
      };
      
      setBriefData({
        scenario: '首单转复购',
        duration: triggerDays,
        offer: OFFERS.find(o => o.id === selectedOffer)?.name || '无Offer',
        template: selectedTemplates.length > 0 ? `${selectedTemplates.length} 个候选模板` : '未选择模板',
        specificGoal: `引导目标：${categoryMap[targetCategory]}`,
        refinedAudience: `首购后 ${triggerDays} 天内未复购${excludeReturns ? '，排除近期退货用户' : ''}${minOrderValue ? `，首单金额≥${minOrderValue}元` : ''}`
      });
    }
    setView('ai-reasoning');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 relative">
      <button 
        onClick={() => setView('lifecycle-select')}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 返回
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">首单转复购 · 配置活动</h1>
        <p className="text-slate-500">在场景预置的基础上，补充本次活动的具体执行细节，AI 将为你生成完整策略</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
          <Info className="w-4 h-4 mr-2 text-slate-400" />
          场景预配置 <span className="text-xs font-normal text-slate-500 ml-2">（基础定义，可在此次活动中叠加条件）</span>
        </h3>
        <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
          <div className="text-slate-500">基础人群</div>
          <div className="font-medium text-slate-900">首购后 {triggerDays} 天内未复购的会员（当前预估：8,463 人）</div>
          <div className="text-slate-500">基础目标</div>
          <div className="font-medium text-slate-900">{triggerDays} 天内产生复购订单</div>
          <div className="text-slate-500">退出条件</div>
          <div className="font-medium text-slate-900">任意复购发生 → 立即停止后续触达</div>
          <div className="text-slate-500">对照组</div>
          <div className="font-medium text-slate-900">自动划定 10%（843 人），用于效果归因</div>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">1</span>
            活动运行周期
          </h3>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">上线日期</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={getDynamicDate(1)} readOnly className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none cursor-not-allowed" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">下线日期</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value="长期有效 (手动下线)" readOnly className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none cursor-not-allowed" />
              </div>
            </div>
          </div>
          <div className="flex items-start bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm">
            <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>Lifecycle 活动为常态化运行（Always-on）。系统将自动分配 10% 流量作为全局对照组，持续观测策略增量价值（Uplift）。</p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">2</span>
            场景触发与过滤规则 <span className="text-sm font-normal text-slate-500 ml-2">（结构化配置，确保执行准确性）</span>
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            {/* 触发时机 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">触发时机</label>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>用户完成首次购买后</span>
                <select 
                  value={triggerDays} 
                  onChange={(e) => setTriggerDays(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900"
                >
                  <option value={7}>7 天</option>
                  <option value={15}>15 天</option>
                  <option value={30}>30 天</option>
                </select>
                <span>内未产生复购行为</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 人群过滤 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">人群过滤条件</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${excludeReturns ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-500'}`}>
                    {excludeReturns && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={excludeReturns}
                    onChange={(e) => setExcludeReturns(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm text-slate-700">排除过去 30 天内有退换货记录的用户 <span className="text-slate-400">（避免客诉风险）</span></span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-700">首单实付金额 ≥</span>
                  <input 
                    type="number" 
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="不限"
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-sm text-slate-700">元</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 复购目标 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">复购引导目标</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'all', name: '不限品类', desc: '提升整体复购率' },
                  { id: 'same', name: '同品类复购', desc: '引导购买消耗品/周期品' },
                  { id: 'cross_sell', name: '跨品类连带', desc: '基于首单推荐相关品类' }
                ].map(cat => (
                  <div 
                    key={cat.id}
                    onClick={() => setTargetCategory(cat.id)}
                    className={`cursor-pointer border rounded-lg p-3 transition-all ${targetCategory === cat.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${targetCategory === cat.id ? 'text-blue-900' : 'text-slate-900'}`}>{cat.name}</div>
                    <div className={`text-xs ${targetCategory === cat.id ? 'text-blue-700' : 'text-slate-500'}`}>{cat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">3</span>
            营销内容与 Offer
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">关联 Offer</label>
                <div className="relative mt-1">
                  <select 
                    value={selectedOffer}
                    onChange={(e) => setSelectedOffer(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    {OFFERS.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">已选营销内容模板 <span className="text-xs font-normal text-slate-500 ml-1">（AI 将根据用户特征进行个性化分发）</span></label>
                <button 
                  onClick={openTemplateModal}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  + 添加营销内容
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedTemplates.length > 0 ? (
                  CHANNELS.map(channel => {
                    const channelTemplates = TEMPLATES[channel.id].filter(t => selectedTemplates.includes(t.id));
                    if (channelTemplates.length === 0) return null;
                    return (
                      <div key={channel.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-sm font-medium text-slate-700">
                          {channel.name}
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          {channelTemplates.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3">
                              <span className="text-sm text-slate-700">{t.name}</span>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => setPreviewTemplate(t.name)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="预览模板"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => removeTemplate(t.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="移除"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 text-center border-dashed">
                    暂未选择营销内容模板，请点击右上角添加
                  </div>
                )}
              </div>
              {selectedTemplates.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">请至少选择一个内容模板作为候选集。</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-end">
        <button 
          onClick={handleGenerate}
          disabled={selectedTemplates.length === 0}
          className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          生成营销策略 →
        </button>
      </div>

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">选择营销内容模板</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden min-h-[400px]">
              {/* Sidebar */}
              <div className="w-48 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                {CHANNELS.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveModalChannel(channel.id)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${activeModalChannel === channel.id ? 'bg-white text-blue-600 font-medium border-l-2 border-blue-600' : 'text-slate-600 hover:bg-slate-100 border-l-2 border-transparent'}`}
                  >
                    <span>{channel.name}</span>
                    {TEMPLATES[channel.id].filter(t => tempSelectedTemplates.includes(t.id)).length > 0 && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {TEMPLATES[channel.id].filter(t => tempSelectedTemplates.includes(t.id)).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                <h3 className="text-base font-medium text-slate-900 mb-4">{CHANNELS.find(c => c.id === activeModalChannel)?.name} 模板</h3>
                <div className="space-y-3">
                  {TEMPLATES[activeModalChannel]?.map(t => (
                    <div 
                      key={t.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${tempSelectedTemplates.includes(t.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      onClick={() => toggleTempTemplate(t.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${tempSelectedTemplates.includes(t.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                          {tempSelectedTemplates.includes(t.id) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${tempSelectedTemplates.includes(t.id) ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>{t.name}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t.name); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="预览模板"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!TEMPLATES[activeModalChannel] || TEMPLATES[activeModalChannel].length === 0) && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      暂无可用模板
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
              <button 
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmTemplateSelection}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                确认添加 ({tempSelectedTemplates.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-8" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">模板预览</h3>
              <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-6 bg-slate-100 min-h-[300px] flex items-center justify-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">品牌官方</div>
                    <div className="text-xs text-slate-500">刚刚</div>
                  </div>
                </div>
                <div className="text-sm text-slate-800 mb-3 font-medium">{previewTemplate}</div>
                <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs border border-slate-200">
                  [ 视觉素材占位 ]
                </div>
                <div className="mt-3 text-xs text-slate-500 leading-relaxed">
                  亲爱的会员，感谢您的支持。我们为您准备了专属福利，点击查看详情...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
