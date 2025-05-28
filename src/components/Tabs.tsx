import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-3 px-6 text-sm font-medium transition-colors duration-200 ${
              activeTab === index
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
            onClick={() => onTabChange(index)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};