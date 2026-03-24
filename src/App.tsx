import { useState } from 'react';
import { ViewState, Strategy } from './types';
import Dashboard from './components/Dashboard';
import LifecycleSelection from './components/LifecycleSelection';
import LifecycleBrief from './components/LifecycleBrief';
import AIReasoning from './components/AIReasoning';
import StrategyReview from './components/StrategyReview';
import AdhocBrief from './components/AdhocBrief';
import ExecutionDashboard from './components/ExecutionDashboard';
import ReportDashboard from './components/ReportDashboard';
import CampaignList from './components/CampaignList';
import { Bot, Settings, HelpCircle, LayoutDashboard, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [briefData, setBriefData] = useState<any>(null);
  const [reasoningSteps, setReasoningSteps] = useState<any[]>([]);
  const [executionDay, setExecutionDay] = useState<number>(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const renderView = () => {
    if (view === 'strategy-review' && strategy) {
      return <StrategyReview setView={setView} strategy={strategy} setStrategy={setStrategy} reasoningSteps={reasoningSteps} setExecutionDay={setExecutionDay} />;
    }

    const renderScrollableView = () => {
      switch (view) {
        case 'dashboard':
          return <Dashboard setView={setView} setStrategy={setStrategy} setExecutionDay={setExecutionDay} />;
        case 'campaign-list':
          return <CampaignList setView={setView} />;
        case 'lifecycle-select':
          return <LifecycleSelection setView={setView} />;
        case 'lifecycle-brief':
          return <LifecycleBrief setView={setView} setBriefData={setBriefData} />;
        case 'ai-reasoning':
          return <AIReasoning setView={setView} setStrategy={setStrategy} briefData={briefData} setReasoningSteps={setReasoningSteps} />;
        case 'adhoc-brief':
          return <AdhocBrief setView={setView} />;
        case 'execution-running':
          return <ExecutionDashboard setView={setView} initialDay={executionDay} />;
        case 'execution-report':
          return <ReportDashboard setView={setView} />;
        default:
          return <Dashboard setView={setView} setStrategy={setStrategy} setExecutionDay={setExecutionDay} />;
      }
    };

    return (
      <div className="flex-1 overflow-y-auto flex flex-col">
        {renderScrollableView()}
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shrink-0 z-10 relative shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold tracking-wide">Consumer Growth Engine</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium border border-slate-600">
            S
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300`}>
          <div className="p-4 flex-1">
            <div className={`flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} mb-6`}>
              {isSidebarExpanded && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">工作台</div>}
              <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title={isSidebarExpanded ? "折叠菜单" : "展开菜单"}
              >
                {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setView('dashboard')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-lg transition-colors ${['dashboard', 'lifecycle-select', 'lifecycle-brief', 'ai-reasoning', 'adhoc-brief'].includes(view) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                title={!isSidebarExpanded ? "智能营销工作台" : undefined}
              >
                <LayoutDashboard className={`w-5 h-5 ${isSidebarExpanded ? 'mr-3' : ''} ${['dashboard', 'lifecycle-select', 'lifecycle-brief', 'ai-reasoning', 'adhoc-brief'].includes(view) ? 'text-blue-600' : 'text-slate-400'}`} />
                {isSidebarExpanded && <span>智能营销工作台</span>}
              </button>
              <button 
                onClick={() => setView('campaign-list')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-lg transition-colors ${['campaign-list', 'execution-running', 'execution-report'].includes(view) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                title={!isSidebarExpanded ? "营销活动列表" : undefined}
              >
                <ListTodo className={`w-5 h-5 ${isSidebarExpanded ? 'mr-3' : ''} ${['campaign-list', 'execution-running', 'execution-report'].includes(view) ? 'text-blue-600' : 'text-slate-400'}`} />
                {isSidebarExpanded && <span>营销活动列表</span>}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main View */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
