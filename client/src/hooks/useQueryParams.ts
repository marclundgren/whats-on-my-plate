import { useCallback, useEffect, useState } from 'react';

type ParamValue = string | boolean | null;

interface QueryParamConfig<T> {
  key: string;
  defaultValue: T;
  parse: (value: string | null) => T;
  serialize: (value: T) => string | null;
}

function getQueryParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function setQueryParams(updates: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const newSearch = params.toString();
  const newUrl = newSearch
    ? `${window.location.pathname}?${newSearch}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}

export function useQueryParam<T>(config: QueryParamConfig<T>): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const param = getQueryParam(config.key);
    return config.parse(param);
  });

  const setValueAndParam = useCallback((newValue: T) => {
    setValue(newValue);
    const serialized = config.serialize(newValue);
    setQueryParams({ [config.key]: serialized });
  }, [config.key, config.serialize]);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const param = getQueryParam(config.key);
      setValue(config.parse(param));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config.key, config.parse]);

  return [value, setValueAndParam];
}

// Pre-configured hooks for common types
export function useStringQueryParam(
  key: string,
  defaultValue: string,
  validValues?: string[]
): [string, (value: string) => void] {
  return useQueryParam({
    key,
    defaultValue,
    parse: (value) => {
      if (value === null) return defaultValue;
      if (validValues && !validValues.includes(value)) return defaultValue;
      return value;
    },
    serialize: (value) => value === defaultValue ? null : value,
  });
}

export function useBooleanQueryParam(
  key: string,
  defaultValue: boolean = false
): [boolean, (value: boolean) => void] {
  return useQueryParam({
    key,
    defaultValue,
    parse: (value) => {
      if (value === null) return defaultValue;
      return value === 'true';
    },
    serialize: (value) => value === defaultValue ? null : String(value),
  });
}
