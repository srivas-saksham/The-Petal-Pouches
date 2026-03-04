// frontend/src/components/bundle-detail/ui/Accordion.jsx

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ items = [], allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndexes(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    } else {
      setOpenIndexes(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div key={index} className="border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                isOpen
                  ? 'bg-tpppink/5 dark:bg-tppdarkwhite/5 border-b border-slate-200 dark:border-tppdarkwhite/10'
                  : 'bg-white dark:bg-tppdarkgray hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5'
              }`}
            >
              <span className={`text-sm font-semibold ${isOpen ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite'}`}>
                {item.title}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-tpppink dark:text-tppdarkwhite' : 'text-slate-400 dark:text-tppdarkwhite/30'}`}
              />
            </button>
            <div className={`transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="p-3 text-sm text-slate-600 dark:text-tppdarkwhite/60 leading-relaxed bg-white dark:bg-tppdarkgray">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;