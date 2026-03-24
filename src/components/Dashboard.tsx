import { Zap, Target, CheckCircle2, Clock } from 'lucide-react';
import { ViewState, Strategy } from '../types';

export default function Dashboard({ setView, setStrategy, setExecutionDay }: { setView: (v: ViewState) => void, setStrategy: (s: Strategy) => void, setExecutionDay: (d: number) => void }) {
  const handleReviewClick = () => {
    // Mock strategy for the "双十一大促预热" campaign
    setStrategy({
      targetAudience: {
        description: "过去一年购买过包袋但未购买过配饰的高净值客户",
        size: 12500,
        controlGroupSize: 1250,
        dataDate: new Date().toISOString().split('T')[0],
        rules: [
          "最近365天内有购买记录",
          "购买品类包含「包袋」",
          "购买品类不包含「配饰」",
          "客户等级为「V4」或「V5」"
        ]
      },
      rhythm: {
        waves: [
          { name: "第1波", time: "T-7", action: "微信推送（大促预热与选品指南）" },
          { name: "第2波", time: "T-3", action: "微信 / 短信（加购提醒与专属 Offer）" },
          { name: "第3波", time: "T-0", action: "短信（开售倒计时与库存告急提醒）" }
        ],
        exitCondition: "产生购买 -> 立即停止"
      },
      channel: {
        strategy: "微信优先（85%可达，10,625人），短信降级（15%，1,875人）",
        details: ["微信优先", "短信降级"],
        frequencyControl: "单人活动期内最多触达 3 次"
      },
      offer: {
        name: "双十一专属：满5000减500",
        estimatedCount: 11250,
        estimatedRedemptionRate: "18%",
        estimatedCost: "¥1,012,500"
      },
      experiment: {
        isABTest: true,
        reason: "大促期间流量大，适合进行 Offer 敏感度测试",
        baselineConversion: "3.5%",
        targetUplift: "+1.5个百分点"
      },
      assumptions: [
        "T-7 内容预热有效（依据：2023双十一数据支持）",
        "满5000减500门槛对高净值客户有吸引力"
      ],
      content: [
        {
          channel: "微信",
          copywriting: "尊贵的V4会员，双十一大促预热开启！根据您以往的包袋偏好，我们为您推荐${matchingAccessory}，现在加购可享满5000减500专属优惠，点击${productLink}查看。",
          variables: [
            { name: "matchingAccessory", model: "商品匹配模型 (Item-to-User)", description: "基于用户历史购买包袋风格，推荐最匹配的配饰单品名称" },
            { name: "productLink", model: "商品匹配模型 (Item-to-User)", description: "推荐配饰在电商平台的详情页URL" }
          ]
        },
        {
          channel: "短信",
          copywriting: "【品牌名】双十一预热！为您精选${matchingAccessory}，满5000减500专属优惠券已到账，戳 ${productLink} 提前加购，退订回T",
          variables: [
            { name: "matchingAccessory", model: "商品匹配模型 (Item-to-User)", description: "基于用户历史购买包袋风格，推荐最匹配的配饰单品名称" },
            { name: "productLink", model: "商品匹配模型 (Item-to-User)", description: "推荐配饰在电商平台的详情页URL" }
          ]
        }
      ]
    });
    setView('strategy-review');
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-8">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">你好，今天想做什么？</h1>
        <p className="text-slate-500">选择一种方式开始创建你的营销活动</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div 
          className="group bg-white rounded-2xl border border-slate-200 p-8 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col"
          onClick={() => setView('lifecycle-select')}
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Lifecycle Campaign</h2>
          <ul className="space-y-3 text-slate-600 mb-8 flex-1">
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500 shrink-0" /> 场景已预配置，开箱即用</li>
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500 shrink-0" /> 只需选场景 + 填 Offer</li>
          </ul>
          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors mt-auto">
            选择场景，开始 →
          </button>
        </div>

        <div 
          className="group bg-white rounded-2xl border border-slate-200 p-8 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col"
          onClick={() => setView('adhoc-brief')}
        >
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
            <Target className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Ad-hoc Campaign</h2>
          <p className="text-sm font-medium text-amber-600 mb-4">大促 / 新品上市 / 自定义活动</p>
          <ul className="space-y-3 text-slate-600 mb-8 flex-1">
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500 shrink-0" /> 告诉 AI 你想做什么</li>
            <li className="flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500 shrink-0" /> AI 帮你设计完整策略</li>
          </ul>
          <button className="w-full py-3 bg-white border border-slate-300 text-slate-900 rounded-xl font-medium hover:bg-slate-50 transition-colors mt-auto">
            开始描述，开始 →
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-400" />
          进行中的活动
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="py-4 px-6">活动名称</th>
                <th className="py-4 px-6">类型</th>
                <th className="py-4 px-6">状态</th>
                <th className="py-4 px-6">Uplift</th>
                <th className="py-4 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900">Niki 包袋复购提醒</td>
                <td className="py-4 px-6 text-slate-500">Lifecycle</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    运行中
                  </span>
                </td>
                <td className="py-4 px-6 text-emerald-600 font-medium">+4.2%↑</td>
                <td className="py-4 px-6 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => { setExecutionDay(6); setView('execution-running'); }}>查看</button>
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900">双十一大促预热</td>
                <td className="py-4 px-6 text-slate-500">Ad-hoc</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                    待审核
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-400">—</td>
                <td className="py-4 px-6 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={handleReviewClick}>审核</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900">新客首购激活</td>
                <td className="py-4 px-6 text-slate-500">Lifecycle</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    运行中
                  </span>
                </td>
                <td className="py-4 px-6 text-emerald-600 font-medium">+2.8%↑</td>
                <td className="py-4 px-6 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => { setExecutionDay(6); setView('execution-running'); }}>查看</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
