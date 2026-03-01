import React from 'react';
import { Category } from '../../types/task.types';

interface SidebarProps {
  selectedCategory: Category | 'ALL';
  onSelectCategory: (category: Category | 'ALL') => void;
}

export default function Sidebar({ selectedCategory, onSelectCategory }: SidebarProps) {
  const categories = [
    {
      value: 'ALL' as const,
      label: 'All Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
      )
    },
    {
      value: 'WORK' as const,
      label: 'Work',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      )
    },
    {
      value: 'PERSONAL' as const,
      label: 'Personal',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-73px)] bg-[var(--color-ivory)] border-r border-[var(--color-cream-dark)]">
      <nav className="p-5">
        <h2 className="font-display text-[0.65rem] font-semibold text-[var(--color-stone)] uppercase tracking-[0.15em] mb-4 px-3">
          Categories
        </h2>
        <ul className="space-y-1">
          {categories.map((category, index) => (
            <li key={category.value} className="animate-slide-in opacity-0" style={{ animationDelay: `${index * 0.05}s` }}>
              <button
                onClick={() => onSelectCategory(category.value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 group ${
                  selectedCategory === category.value
                    ? 'bg-[var(--color-terracotta-light)] text-[var(--color-terracotta-dark)]'
                    : 'text-[var(--color-charcoal-light)] hover:bg-[var(--color-cream-dark)]'
                }`}
              >
                <span className={`transition-transform duration-200 ${selectedCategory === category.value ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {category.icon}
                </span>
                <span className="font-display text-sm font-medium">{category.label}</span>
                {selectedCategory === category.value && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-terracotta)]" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Decorative element */}
        <div className="mt-8 px-3">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-cream-dark)] to-transparent" />
        </div>

        {/* Quick stats */}
        <div className="mt-6 px-3">
          <h2 className="font-display text-[0.65rem] font-semibold text-[var(--color-stone)] uppercase tracking-[0.15em] mb-3">
            Quick Tip
          </h2>
          <p className="text-sm text-[var(--color-stone)] leading-relaxed">
            Press <kbd className="px-1.5 py-0.5 bg-[var(--color-cream-dark)] rounded text-xs font-display">N</kbd> to quickly add a new task.
          </p>
        </div>
      </nav>
    </aside>
  );
}
