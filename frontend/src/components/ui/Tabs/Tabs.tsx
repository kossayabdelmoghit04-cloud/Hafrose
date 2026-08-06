import React, { useState, useId } from 'react';
import { TabsProps } from './Tabs.types';
import { cn } from '../../../utils/cn';

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, onChange, className }) => {
  const uid = useId();
  const [activeTab, setActiveTab] = useState(defaultTab ?? items[0]?.id ?? '');

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  const activeContent = items.find((t) => t.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label="Navigation par onglets"
        className="flex border-b border-neutral-200 overflow-x-auto scrollbar-none"
      >
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-controls={`${uid}-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleSelect(tab.id)}
            className={cn(
              'relative flex-shrink-0 px-5 py-3 text-body-sm font-medium tracking-wide transition-all duration-250 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-burgundy-500 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap',
              activeTab === tab.id
                ? 'text-burgundy-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-burgundy-500 after:rounded-full'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-rose-blush/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {items.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${uid}-panel-${tab.id}`}
          aria-labelledby={`${uid}-tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className={cn('pt-6', activeTab === tab.id && 'animate-fade-in')}
          tabIndex={0}
        >
          {activeContent !== undefined && activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
};
