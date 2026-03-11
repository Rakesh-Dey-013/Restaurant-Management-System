import { useState } from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="border-b border-zinc-700">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;