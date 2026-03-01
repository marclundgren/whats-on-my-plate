import React from 'react';
import { useSettings } from '../../context/SettingsContext';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

function Toggle({ checked, onChange, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors focus-visible:outline-none ${
        checked
          ? 'bg-[var(--color-terracotta)] border-[var(--color-terracotta)]'
          : 'bg-[var(--color-cream-dark)] border-[var(--color-cream-dark)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

interface SettingRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingRow({ id, label, description, checked, onChange }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="font-display text-sm font-medium text-[var(--color-charcoal)] cursor-pointer"
        >
          {label}
        </label>
        <p className="text-sm text-[var(--color-stone)] mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { settings, setEnableTransitions } = useSettings();

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
          Settings
        </h2>
        <p className="text-[var(--color-stone)] mt-1">
          Configure your experience
        </p>
      </div>

      {/* Appearance section */}
      <section>
        <h3 className="font-display text-[0.65rem] font-semibold text-[var(--color-stone)] uppercase tracking-[0.15em] mb-1">
          Appearance
        </h3>
        <div className="bg-[var(--color-ivory)] rounded-xl border border-[var(--color-cream-dark)] divide-y divide-[var(--color-cream-dark)] px-5">
          <SettingRow
            id="enable-transitions"
            label="Animations & transitions"
            description="Smooth motion effects on buttons, task cards, and page elements. Disable for a snappier feel or if you prefer reduced motion."
            checked={settings.enableTransitions}
            onChange={setEnableTransitions}
          />
        </div>
      </section>
    </div>
  );
}
