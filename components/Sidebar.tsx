import React from 'react';
import type { AppDefinition } from '../types';

interface SidebarProps {
  apps: AppDefinition[];
  activeAppId: string;
  setActiveAppId: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ apps, activeAppId, setActiveAppId }) => {
  
  const DesktopSidebar = () => (
    <aside className="hidden md:flex w-64 bg-white shadow-md flex-col fixed h-full">
      <div className="p-6 text-center border-b">
        <h1 className="text-xl font-bold text-gray-800">ELIKIA Tools</h1>
        <p className="text-xs text-gray-500">Suite d'Outils Créatifs</p>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {apps.map(app => (
            <li key={app.id}>
              <button
                onClick={() => setActiveAppId(app.id)}
                className={`w-full flex items-center px-4 py-3 my-1 text-left rounded-lg transition-all duration-200 ${
                  activeAppId === app.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-slate-200 hover:text-gray-800'
                }`}
              >
                <i className={`${app.icon} w-8 text-center`}></i>
                <span className="font-medium">{app.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 text-center text-xs text-gray-400 border-t">
        Version 2.0
      </div>
    </aside>
  );

  const MobileBottomNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] flex justify-around p-1 z-50 border-t border-slate-200">
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => setActiveAppId(app.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg w-24 transition-colors duration-200 ${
            activeAppId === app.id ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-slate-100'
          }`}
          aria-label={app.name}
        >
          <i className={`${app.icon} text-xl`}></i>
          <span className="text-xs mt-1 font-medium">{app.name}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
};

export default Sidebar;