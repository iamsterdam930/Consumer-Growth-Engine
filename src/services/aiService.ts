import { GoogleGenAI, Type } from '@google/genai';
import { Strategy } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

const MOCK_STRATEGY: Strategy = {
  targetAudience: {
    description: "首购后 15d 内未复购",
    size: 7821,
    controlGroupSize: 782,
    dataDate: new Date().toISOString().split('T')[0],
    rules: [
      "历史购买次数 = 1",
      "最近一次购买时间在 15 天内",
      "未发生退货行为"
    ]
  },
  rhythm: {
    waves: [
      { name: "第1波", time: "T+5", action: "微信推送（内容预热）" },
      { name: "第2波", time: "T+8", action: "微信 / 降级短信 (附 Offer：满1000减100)" }
    ],
    exitCondition: "任意复购 → 立即停止"
  },
  channel: {
    strategy: "微信优先（78%可达，6,104人），短信降级（22%，1,717人）",
    details: ["微信优先", "短信降级"],
    frequencyControl: "单人活动期内最多触达 2 次"
  },
  offer: {
    name: "满1000减100，有效至12月31日",
    estimatedCount: 7039,
    estimatedRedemptionRate: "35%",
    estimatedCost: "¥246,365"
  },
  experiment: {
    isABTest: true,
    reason: "活动周期（15d）≥ 观测期（15d），支持 A/B 测试。但当前对照组样本量较小（782人），建议仅做方向性参考或提升对照组比例。",
    baselineConversion: "1.9%",
    targetUplift: "+2个百分点"
  },
  assumptions: [
    "T+5 发内容预热有效（依据：历史数据支持，但本次 Offer 面值更高可能影响效果）",
    "短信降级会影响品牌调性（AI 无法判断，需你确认）",
    "满1000门槛对复购转化有效（依据 2024Q3 活动验证）"
  ],
  content: [
    {
      channel: "微信",
      copywriting: "亲爱的会员，您上次购买的单品还满意吗？我们为您精心挑选了搭配的${recommendedProduct}，现在购买还有专属满1000减100优惠，点击${productLink}查看详情。",
      variables: [
        { name: "recommendedProduct", model: "商品匹配模型 (Item-to-User)", description: "根据首单购买品类，预测复购最可能感兴趣的关联商品名称" },
        { name: "productLink", model: "商品匹配模型 (Item-to-User)", description: "关联商品在电商平台的详情页URL" }
      ]
    },
    {
      channel: "短信",
      copywriting: "【品牌名】尊享会员，为您推荐${recommendedProduct}，专属满1000减100优惠券已发至账户，戳 ${productLink} 退订回T",
      variables: [
        { name: "recommendedProduct", model: "商品匹配模型 (Item-to-User)", description: "根据首单购买品类，预测复购最可能感兴趣的关联商品名称" },
        { name: "productLink", model: "商品匹配模型 (Item-to-User)", description: "关联商品在电商平台的详情页URL" }
      ]
    }
  ]
};

export async function generateStrategyWithFallback(brief: any, onStatusUpdate?: (msg: string) => void): Promise<{data: Strategy, isMock: boolean}> {
  try {
    let timeoutId: any;
    const timeoutPromise = new Promise<any>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout')), 12000);
    });

    onStatusUpdate?.("正在调用大模型...");
    
    const prompt = `
    你是一个高级CDP+MA系统的AI Agent。用户提供了一个营销活动的Brief，请你生成一个策略方案。
    Brief: ${JSON.stringify(brief)}
    
    请返回JSON格式的策略方案，包含以下字段：
    targetAudience (description, size, controlGroupSize, dataDate (使用当前日期 ${new Date().toISOString().split('T')[0]}), rules: string array of audience conditions, 必须包含一条基于“购买倾向预测模型”的规则，例如“购买倾向预测模型评分 > 80”)
    rhythm (waves: [{name, time, action}], exitCondition)
    channel (strategy, details, frequencyControl)
    offer (name, estimatedCount, estimatedRedemptionRate, estimatedCost)
    experiment (isABTest, reason, baselineConversion, targetUplift)
    assumptions (string array)
    content (array of {channel, copywriting, variables: array of {name, model, description}}，其中文案中需要包含变量占位符，例如\${recommendedProduct}，变量的model字段指明使用的智能模型，如“商品匹配模型”，description说明变量的具体含义，如商品名称或商品详情页URL)
    
    保持专业、克制的ToB业务语境。数据要合理（例如奢侈品客单价高，转化率在1%-5%之间）。
    `;

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      }),
      timeoutPromise
    ]);

    clearTimeout(timeoutId);
    
    if (response.text) {
        return { data: JSON.parse(response.text) as Strategy, isMock: false };
    }
    throw new Error("Empty response");
  } catch (error) {
    console.warn("LLM call failed or timed out, using fallback mock data.", error);
    onStatusUpdate?.("AI 思考网络拥堵，正在使用本地智能预案...");
    await new Promise(r => setTimeout(r, 1500));
    return { data: MOCK_STRATEGY, isMock: true };
  }
}

export async function chatToAdjustStrategy(currentStrategy: Strategy, userMessage: string): Promise<{reply: string, updatedStrategy: Strategy, isMock: boolean}> {
    try {
        const prompt = `
        当前策略: ${JSON.stringify(currentStrategy)}
        用户反馈: "${userMessage}"
        
        请根据用户反馈修改策略，并返回修改后的完整JSON策略，以及一段给用户的回复（解释修改了什么，以及潜在的影响）。
        返回格式：
        {
            "reply": "回复内容",
            "updatedStrategy": { ...完整策略对象 }
        }
        `;
        
        let timeoutId: any;
        const timeoutPromise = new Promise<any>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Timeout')), 10000);
        });

        const response = await Promise.race([
            ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                }
            }),
            timeoutPromise
        ]);
        
        clearTimeout(timeoutId);
        
        const res = JSON.parse(response.text);
        return { reply: res.reply, updatedStrategy: res.updatedStrategy, isMock: false };
    } catch (e) {
        console.warn("Chat LLM failed, using fallback", e);
        const updated = JSON.parse(JSON.stringify(currentStrategy)) as Strategy;
        updated.channel.strategy = "仅微信（6,104 人，78% 覆盖）";
        updated.channel.details = ["微信推送"];
        updated.rhythm.waves[1].action = "微信推送（含 Offer）";
        updated.offer.estimatedCost = "¥243,789";
        updated.assumptions = [
            "1,717 名微信不可达用户放弃触达，是否符合你的预期？",
            "放弃短信约损失 0.6% 转化率，节省约 ¥2,576 短信成本",
            "满1000门槛对复购转化有效（依据 2024Q3 活动验证）"
        ];
        
        return {
            reply: "已更新。移除短信降级后，有 3 处影响请注意：\n\n① 触达人群缩小\n由 7,821 → 6,104 人。未覆盖 1,717 人将无法收到任何触达。\n\n② 成本下降\n短信发送费约 ¥2,576，将节省此部分成本。\n\n③ 转化预测可能下调\n历史数据显示微信+短信组合比单微信转化率高约 0.6 个百分点。\n\n你是否接受这个调整？",
            updatedStrategy: updated,
            isMock: true
        };
    }
}
