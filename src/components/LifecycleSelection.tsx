import { ArrowLeft, Users, TrendingUp, RefreshCw, Diamond, UserMinus, Gift, ShoppingBag, Store } from 'lucide-react';
import { ViewState } from '../types';

const scenarios = [
  { id: '1', icon: Users, title: '潜客转新客', desc: '注册/领样后 7-15 天转化窗口', audience: '2,341' },
  { id: '2', icon: ShoppingBag, title: '新客首购', desc: '新注册会员首次购买转化，发放新人礼包', audience: '5,120' },
  { id: '3', icon: RefreshCw, title: '首单转复购', desc: '首购后推动二购核心场景，提升连带率', audience: '8,463', recommended: true },
  { id: '4', icon: Store, title: '老客再购', desc: '高频活跃老客的日常复购与客单价提升', audience: '12,405' },
  { id: '5', icon: UserMinus, title: '流失召回', desc: '超过 180 天未购买的客户，高价值流失预警与召回', audience: '5,112' },
];

export default function LifecycleSelection({ setView }: { setView: (v: ViewState) => void }) {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <button 
        onClick={() => setView('dashboard')}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 返回
      </button>

      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Lifecycle Campaign · 选择场景</h1>
        <p className="text-slate-500">选择你想运营的场景（目标人群和营销目标已由系统预配置，开箱即用）</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {scenarios.map((s) => (
          <div 
            key={s.id}
            className={`bg-white rounded-xl border ${s.recommended ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} p-6 hover:shadow-md transition-all flex flex-col`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.recommended ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              {s.recommended && <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-md">推荐</span>}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{s.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-grow">{s.desc}</p>
            
            <div className="bg-slate-50 rounded-lg p-3 mb-4 flex justify-between items-center">
              <span className="text-xs text-slate-500">目标人群</span>
              <span className="text-sm font-semibold text-slate-900">{s.audience} ↗</span>
            </div>
            
            <button 
              onClick={() => setView('lifecycle-brief')}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${s.recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              选择这个
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 flex items-center">
        <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center mr-2">ℹ️</span>
        人群预估数据基于昨日数据（{new Date(Date.now() - 86400000).toISOString().split('T')[0]}）
      </p>
    </div>
  );
}
