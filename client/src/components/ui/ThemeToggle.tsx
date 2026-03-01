import { useTheme } from '../../context/ThemeContext';

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-cream-dark)] dark:bg-[var(--color-charcoal-light)]/50">
      {themes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative px-3 py-1.5 text-xs font-medium font-display rounded-md transition-all
            ${theme === value
              ? 'bg-[var(--color-ivory)] dark:bg-[var(--color-charcoal)] text-[var(--color-charcoal)] dark:text-[var(--color-ivory)] shadow-sm'
              : 'text-[var(--color-stone)] hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-ivory)]'
            }
          `}
          aria-pressed={theme === value}
        >
          <span className="flex items-center gap-1.5">
            {value === 'light' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            {value === 'dark' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {value === 'auto' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
