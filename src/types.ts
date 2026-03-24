export interface Strategy {
  targetAudience: {
    description: string;
    size: number;
    controlGroupSize: number;
    dataDate: string;
    rules?: string[];
  };
  rhythm: {
    waves: Array<{
      name: string;
      time: string;
      action: string;
    }>;
    exitCondition: string;
  };
  channel: {
    strategy: string;
    details: string[];
    frequencyControl: string;
  };
  offer: {
    name: string;
    estimatedCount: number;
    estimatedRedemptionRate: string;
    estimatedCost: string;
  };
  experiment: {
    isABTest: boolean;
    reason: string;
    baselineConversion: string;
    targetUplift: string;
  };
  assumptions: string[];
  content?: {
    channel: string;
    copywriting: string;
    variables?: {
      name: string;
      model: string;
      description: string;
    }[];
  }[];
}

export type ViewState = 
  | 'dashboard' 
  | 'campaign-list'
  | 'lifecycle-select' 
  | 'lifecycle-brief' 
  | 'ai-reasoning' 
  | 'strategy-review' 
  | 'adhoc-brief' 
  | 'execution-running' 
  | 'execution-report';
