import { useState } from 'react';
import { ArrowLeft, Pause, Eye, AlertTriangle, CheckCircle2, X, Play } from 'lucide-react';
import { ViewState } from '../types';
import { getDynamicDate } from '../utils/date';

export default function ExecutionDashboard({ setView, initialDay = 0 }: { setView: (v: ViewState) => void, initialDay?: number }) {
  const [day, setDay] = useState(initialDay);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto w-full p-8 relative">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            {day === 0 ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-3"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            )}
            <h1 className="text-2xl font-semibold text-slate-900">{day === 0 ? '待审核' : '运行中'}</h1>
            <span className="mx-4 text-slate-300">|</span>
            <span className="text-slate-500">首单转复购 · {getDynamicDate(0)} ~ {getDynamicDate(15)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {day === 0 ? (
            <button onClick={() => setDay(10)} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors flex items-center">
              <Play className="w-4 h-4 mr-2" /> 通过审批并运行
            </button>
          ) : (
            <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center">
              <Pause className="w-4 h-4 mr-2" /> 暂停
            </button>
          )}
          <button onClick={() => setIsCanvasOpen(true)} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center">
            <Eye className="w-4 h-4 mr-2" /> 查看画布
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">各波次触达数据</h2>
          <div className="space-y-6">
            {/* Wave 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">第 1 波：微信图文预热</h3>
                    <p className="text-sm text-slate-500">触发时间：T+5 (进入人群包后第5天)</p>
                  </div>
                </div>
                <div className={`text-sm font-medium px-3 py-1 rounded-full ${day > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {day > 0 ? '已执行' : '等待执行'}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">目标人数</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '6,250' : '-'} <span className="text-sm font-normal text-slate-500">人</span></div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">触达成功</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '6,104' : '-'} <span className="text-sm font-normal text-slate-500">人</span></div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">打开率</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '23.4%' : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">点击率</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '8.1%' : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">直接转化</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '247' : '-'} <span className="text-sm font-normal text-slate-500">人</span></div>
                </div>
              </div>
            </div>

            {/* Wave 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">第 2 波：专属 Offer 催化</h3>
                    <p className="text-sm text-slate-500">触发条件：T+8 且未发生购买</p>
                  </div>
                </div>
                <div className={`text-sm font-medium px-3 py-1 rounded-full ${day > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {day > 0 ? '已执行' : '等待执行'}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">目标人数</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '5,857' : '-'} <span className="text-sm font-normal text-slate-500">人</span></div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">触达成功</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '5,720' : '-'} <span className="text-sm font-normal text-slate-500">人</span></div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">打开率</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '31.2%' : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">点击率</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '14.5%' : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">直接转化</div>
                  <div className="text-2xl font-semibold text-slate-900">{day > 0 ? '412' : '-'} <span className="text-sm font-normal text-slate-500">人</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">对照组状态</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                <span className="text-slate-500 font-medium">C</span>
              </div>
              <div>
                <div className="font-medium text-slate-900">控制组 782 人</div>
                <div className="text-sm text-slate-500">已成功隔离 · 活动期间不会收到任何相关触达</div>
              </div>
            </div>
            {day > 0 && (
              <button 
                onClick={() => setView('execution-report')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                模拟活动结束 →
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Canvas Modal */}
      {isCanvasOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-full flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">营销画布预览</h3>
              <button onClick={() => setIsCanvasOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-8 bg-slate-100 flex items-center justify-center min-h-[500px]">
              {/* Mock Canvas Graph */}
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-4 w-64 text-center">
                  <div className="text-xs font-medium text-blue-600 mb-1">触发条件</div>
                  <div className="text-sm font-semibold text-slate-900">进入「首单转复购」人群包</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 w-64 text-center">
                  <div className="text-xs font-medium text-slate-500 mb-1">Day 1 (T+5)</div>
                  <div className="text-sm font-semibold text-slate-900">发送微信图文</div>
                  <div className="text-xs text-slate-500 mt-1">内容预热</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="flex space-x-8">
                  <div className="flex flex-col items-center">
                    <div className="bg-white border border-emerald-200 shadow-sm rounded-xl p-4 w-48 text-center">
                      <div className="text-xs font-medium text-emerald-600 mb-1">已购买</div>
                      <div className="text-sm font-semibold text-slate-900">退出旅程</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 w-48 text-center">
                      <div className="text-xs font-medium text-slate-500 mb-1">未购买 (T+8)</div>
                      <div className="text-sm font-semibold text-slate-900">发送专属 Offer</div>
                      <div className="text-xs text-slate-500 mt-1">微信优先 / 短信兜底</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
