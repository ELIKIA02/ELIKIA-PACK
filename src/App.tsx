import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FormatterPage from './pages/FormatterPage';
import PrompterPage from './pages/PrompterPage';
import BudgetPage from './pages/BudgetPage';
import type { AppDefinition } from './types';

const APPS: AppDefinition[] = [
  { id: 'formatter', name: 'Formateur', icon: 'fa-solid fa-wand-magic-sparkles', component: FormatterPage },
  { id: 'prompter', name: 'Prompteur', icon: 'fa-solid fa-desktop', component: PrompterPage },
  { id: 'budget', name: 'Budget', icon: 'fa-solid fa-file-invoice-dollar', component: BudgetPage },
];

const App: React.FC = () => {
  const [activeAppId, setActiveAppId] = useState<string>(APPS[0].id);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const ActiveAppComponent = APPS.find(app => app.id === activeAppId)?.component || (() => <div>App not found</div>);

  const mainClasses = isFullscreen
    ? 'h-full w-full'
    : 'h-full overflow-y-auto pb-16 md:pb-0 md:ml-64';

  return (
    <div className="h-screen bg-slate-100 flex">
      {!isFullscreen && <Sidebar apps={APPS} activeAppId={activeAppId} setActiveAppId={setActiveAppId} />}
      <main className={`${mainClasses} relative transition-all duration-300`}>
        <ActiveAppComponent isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
      </main>
    </div>
  );
};

export default App;
