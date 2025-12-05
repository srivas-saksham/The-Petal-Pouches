// frontend/src/components/ui/Accordion.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Accordion - Collapsible content sections
 * Compact minimal design
 */
const Accordion = ({ items = [], allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndexes(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);

        return (
          <div
            key={index}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggleItem(index)}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                isOpen
                  ? 'bg-tpppink/5 border-b border-slate-200'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <span className={`text-sm font-semibold ${
                isOpen ? 'text-tpppink' : 'text-tppslate'
              }`}>
                {item.title}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform flex-shrink-0 ${
                  isOpen ? 'rotate-180 text-tpppink' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Content */}
            <div
              className={`transition-all duration-200 ${
                isOpen
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="p-3 text-sm text-slate-600 leading-relaxed">
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