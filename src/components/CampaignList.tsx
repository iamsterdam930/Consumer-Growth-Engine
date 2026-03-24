import { useState } from 'react';
import { ViewState } from '../types';
import { Search, Filter, Play, Pause, CheckCircle2, Clock, MoreHorizontal, Activity } from 'lucide-react';

export default function CampaignList({ setView }: { setView: (v: ViewState) => void }) {
  const [activeTab, setActiveTab] = useState<'all' | 'lifecycle' | 'adhoc'>('all');
  const [scenarioFilter, setScenarioFilter] = useState('all');

  const campaigns = [
    { id: 1, name: '春季新品发布预热', type: 'adhoc', status: 'running', audience: 12500, date: '2026-03-15', period: '2026-03-18 至 2026-04-18', scenario: '-' },
    { id: 2, name: '首单转复购 - 15天内未复购', type: 'lifecycle', status: 'running', audience: 7821, date: '2026-03-10', period: '长期有效', scenario: '首单转复购' },
    { id: 3, name: '流失召回 - 180天未活跃', type: 'lifecycle', status: 'paused', audience: 45200, date: '2026-02-20', period: '2026-02-20 至 2026-12-31', scenario: '流失召回' },
    { id: 4, name: '年货节大促', type: 'adhoc', status: 'completed', audience: 85000, date: '2026-01-05', period: '2026-01-10 至 2026-02-08', scenario: '-' },
    { id: 5, name: '潜客转新客 - 注册未购买', type: 'lifecycle', status: 'running', audience: 15600, date: '2025-12-12', period: '长期有效', scenario: '潜客转新客' },
    { id: 6, name: '老客再购 - 核心品类复购', type: 'lifecycle', status: 'draft', audience: 5400, date: '2026-03-20', period: '待定', scenario: '老客再购' },
    { id: 7, name: '新客首购 - 注册7天内高意向', type: 'lifecycle', status: 'running', audience: 3200, date: '2025-11-25', period: '长期有效', scenario: '新客首购' },
    { id: 8, name: '流失召回 - 365天沉睡高价值客户', type: 'lifecycle', status: 'completed', audience: 12800, date: '2025-08-15', period: '2025-08-15 至 2026-01-15', scenario: '流失召回' },
    { id: 9, name: '首单转复购 - 跨品类连带推荐', type: 'lifecycle', status: 'running', audience: 9500, date: '2025-10-28', period: '长期有效', scenario: '首单转复购' },
    { id: 10, name: '老客再购 - 会员生日月关怀', type: 'lifecycle', status: 'running', audience: 4100, date: '2025-06-01', period: '长期有效', scenario: '老客再购' },
    { id: 11, name: '潜客转新客 - 购物车遗弃挽回', type: 'lifecycle', status: 'running', audience: 8900, date: '2026-01-02', period: '长期有效', scenario: '潜客转新客' },
    { id: 12, name: '五一黄金周特惠', type: 'adhoc', status: 'draft', audience: 150000, date: '2026-03-22', period: '2026-04-28 至 2026-05-05', scenario: '-' },
    { id: 13, name: '老客再购 - 积分即将过期提醒', type: 'lifecycle', status: 'running', audience: 22000, date: '2025-12-01', period: '长期有效', scenario: '老客再购' },
    { id: 14, name: '新客首购 - 领券未核销催办', type: 'lifecycle', status: 'paused', audience: 6700, date: '2025-09-10', period: '2025-09-10 至 2026-03-01', scenario: '新客首购' },
    { id: 15, name: '流失召回 - 曾经的高频购买者', type: 'lifecycle', status: 'draft', audience: 18500, date: '2026-03-18', period: '待定', scenario: '流失召回' },
  ];

  const sortedCampaigns = [...campaigns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredCampaigns = sortedCampaigns.filter(c => {
    if (activeTab !== 'all' && c.type !== activeTab) return false;
    if (scenarioFilter !== 'all' && c.scenario !== scenarioFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><Play className="w-3 h-3 mr-1" /> 执行中</span>;
      case 'paused': return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Pause className="w-3 h-3 mr-1" /> 已暂停</span>;
      case 'completed': return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><CheckCircle2 className="w-3 h-3 mr-1" /> 已完成</span>;
      case 'draft': return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3 mr-1" /> 草稿</span>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">营销活动列表</h1>
            <p className="text-sm text-slate-500">管理和查看所有 Lifecycle 与 Ad-hoc 营销活动</p>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            新建活动
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                全部活动
              </button>
              <button 
                onClick={() => setActiveTab('lifecycle')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'lifecycle' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Lifecycle (生命周期)
              </button>
              <button 
                onClick={() => setActiveTab('adhoc')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'adhoc' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Ad-hoc (单次活动)
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'lifecycle' && (
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    value={scenarioFilter}
                    onChange={(e) => setScenarioFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-slate-700"
                  >
                    <option value="all">所有场景</option>
                    <option value="潜客转新客">潜客转新客</option>
                    <option value="新客首购">新客首购</option>
                    <option value="首单转复购">首单转复购</option>
                    <option value="老客再购">老客再购</option>
                    <option value="流失召回">流失召回</option>
                  </select>
                </div>
              )}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索活动名称..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                />
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">活动名称</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">类型 / 场景</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">目标人群</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">活动周期</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">创建时间</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => campaign.status === 'running' ? setView('execution-running') : null}>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900">{campaign.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-700">{campaign.type === 'lifecycle' ? 'Lifecycle' : 'Ad-hoc'}</span>
                      {campaign.scenario !== '-' && <span className="text-xs text-slate-500 mt-0.5">{campaign.scenario}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {campaign.audience.toLocaleString()} 人
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {campaign.period}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {campaign.date}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    没有找到符合条件的营销活动
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
