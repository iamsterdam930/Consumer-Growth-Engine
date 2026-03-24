import { ArrowLeft, Download, Database, CheckCircle2, AlertTriangle, TrendingUp, Award } from 'lucide-react';
import { ViewState } from '../types';

export default function ReportDashboard({ setView }: { setView: (v: ViewState) => void }) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-3"></span>
            <h1 className="text-2xl font-semibold text-slate-900">已结束</h1>
            <span className="mx-4 text-slate-300">|</span>
            <span className="text-slate-500">首单转复购 · 活动归因报告</span>
          </div>
        </div>
        <div className="space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" /> 导出 PDF
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center">
            <Database className="w-4 h-4 mr-2" /> 加入知识库
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">核心结论</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
              <div className="p-6 text-center">
                <div className="text-sm text-slate-500 mb-2">实验组转化率</div>
                <div className="text-3xl font-semibold text-slate-900">4.3%</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-slate-500 mb-2">对照组转化率</div>
                <div className="text-3xl font-semibold text-slate-900">1.8%</div>
              </div>
              <div className="p-6 text-center bg-emerald-50/30">
                <div className="text-sm text-emerald-600 font-medium mb-2">增量 Uplift</div>
                <div className="text-3xl font-semibold text-emerald-600">+2.5%↑</div>
              </div>
              <div className="p-6 text-center bg-blue-50/30">
                <div className="text-sm text-blue-600 font-medium mb-2">增量 GMV</div>
                <div className="text-3xl font-semibold text-blue-600">¥ 612,400</div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 text-sm flex items-center justify-center space-x-8 text-slate-600">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> 统计显著性：P = 0.023 (显著 P &lt; 0.05)</span>
              <span>置信区间：Uplift 在 [+1.8%, +3.2%] 之间（95% CI）</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">假设验证结果</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-900">T+5 内容预热 + T+8 Offer 逼单：有效</span>
                <p className="text-sm text-slate-500 mt-1">比历史最优方案提升 +0.2%</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-900">满 1,000 减 100 Offer：符合预期</span>
                <p className="text-sm text-slate-500 mt-1">核销率 38%（高于历史均值 35%）</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-900">微信单渠道：结论谨慎</span>
                <p className="text-sm text-slate-500 mt-1">转化率未显著低于历史微信+短信组合（但样本量偏小）</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">AI 复盘建议</h2>
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm">
            <ul className="space-y-6">
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3 shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-sm text-slate-800 leading-relaxed">本次 T+5/T+8 节奏优于历史 T+3/T+7 约 0.2%，建议将此节奏沉淀为<span className="font-semibold text-blue-900">“首单转复购”场景的新默认配置</span>。</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3 shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-sm text-slate-800 leading-relaxed">满 1,000 减 100 门槛适合复购场景，建议在 Offer 库中标注<span className="font-semibold text-blue-900">“已验证有效”</span>。</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3 shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-sm text-slate-800 leading-relaxed">关于微信 vs 微信+短信的渠道效果，建议下次活动在有条件时做一次受控测试，目前数据不足以得出结论。</p>
                </div>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-blue-100 flex justify-center space-x-4">
              <button className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
                加入知识库，作为后续活动参考
              </button>
              <button className="px-6 py-2.5 text-sm font-medium bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors">
                不采纳（说明原因）
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
