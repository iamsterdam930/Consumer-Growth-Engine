import React from 'react';
import { ViewState, Audience } from '../types';
import { Plus, Search, Filter, MoreHorizontal, Users, Loader2 } from 'lucide-react';

interface AudienceListProps {
  setView: (view: ViewState) => void;
  audiences: Audience[];
}

export default function AudienceList({ setView, audiences }: AudienceListProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">人群列表</h1>
          <p className="text-slate-500 mt-1">管理和查看所有客户分群</p>
        </div>
        <button
          onClick={() => setView('smart-audience-assistant')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建人群
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索人群名称或 ID..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-6 py-4">人群名称 / ID</th>
                <th className="px-6 py-4">规则描述</th>
                <th className="px-6 py-4">覆盖人数</th>
                <th className="px-6 py-4">更新时间</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {audiences.map((audience) => (
                <tr key={audience.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 shrink-0 ${audience.status === 'calculating' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                        {audience.status === 'calculating' ? (
                          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                        ) : (
                          <Users className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center">
                          {audience.name}
                          {audience.status === 'calculating' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">计算中</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{audience.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 max-w-md truncate" title={audience.description}>
                      {audience.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {audience.status === 'calculating' ? (
                        <span className="text-slate-400 font-normal">计算中...</span>
                      ) : (
                        `${audience.count.toLocaleString()} 人`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {audience.updateTime}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <div>共 {audiences.length} 个人群</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed">上一页</button>
            <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
}
