import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Wallet, Building2, Banknote, TrendingUp, PieChart, ChevronUp, X, Settings, Store, RefreshCw, FileText } from "lucide-react";

const slideUpAnimation = `
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const tabs = [
  { id: "salary", label: "Salary", icon: <TrendingUp size={18} />, end: true },
  { id: "cash", label: "Cash", icon: <Wallet size={18} />, end: true },
  { id: "banks", label: "Bank Accounts", icon: <Building2 size={18} />, end: false },
  { id: "roboadvisors", label: "Roboadvisors", icon: <PieChart size={18} />, end: false },
  { id: "crypto", label: "Crypto Exchanges", icon: <Banknote size={18} />, end: true },
  { id: "bills", label: "Bills", icon: <FileText size={18} />, end: true },
  { id: "merchants", label: "Merchants", icon: <Store size={18} />, end: false },
  { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw size={18} />, end: true },
  { id: "settings", label: "Settings", icon: <Settings size={18} />, end: true },
];

export const EditorsPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const getCurrentTab= () => {
    const pathParts = location.pathname.split('/');
    const currentTabId = pathParts.find(part => tabs.some(tab => tab.id === part));
    return tabs.find(tab => tab.id === currentTabId) || null;
  };

  const currentTab = getCurrentTab();

  useEffect(() => {
    if (currentTab) {
      sessionStorage.setItem('lastEditorPath', location.pathname);
    }
  }, [currentTab, location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <style>{slideUpAnimation}</style>
      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <div className="w-56 shrink-0 max-md:hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Editors
          </h1>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.id}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    "w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 text-sm font-medium rounded-lg transition-all",
                    "outline-none focus:outline-none focus:ring-0 focus-visible:ring-0",
                    "border",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border-transparent"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={clsx(
                      "transition-colors",
                      isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                    )}>
                      {tab.icon}
                    </span>
                    <span className="flex items-center gap-2">
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Bar - Compact, centered, full bar clickable */}
      <div className="md:hidden fixed left-0 right-0 z-[60] flex justify-center" style={{ bottom: '104px' }}>
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95"
        >
          <span className="text-emerald-600 dark:text-emerald-400">
            {currentTab?.icon || <TrendingUp size={16} />}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentTab?.label || 'Select Editor'}
          </span>
          <ChevronUp
            size={14} 
            className={clsx(
              "text-gray-400 dark:text-gray-500 transition-transform duration-200",
              isMenuOpen ? "rotate-180" : ""
            )} 
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Slide-up panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto" style={{ animation: 'slideUp 300ms ease-out' }}>
            {/* Header - Compact */}
            <div className="flex items-center justify-between px-8 pt-6 pb-0 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Select Editor
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Menu items */}
            <nav className="px-4 py-2 pb-24">
              <div className="grid gap-1">
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.id}
                    to={tab.id}
                    end={tab.end}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        "w-full flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all",
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={clsx(
                          "transition-colors",
                          isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                        )}>
                          {tab.icon}
                        </span>
                        <span className="flex items-center gap-2">
                          {tab.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Bottom safe area padding */}
            <div className="h-8" />
          </div>
        </div>
      )}
    </>
  );
};
