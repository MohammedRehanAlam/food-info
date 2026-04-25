import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ProviderType = 'openai' | 'google' | 'anthropic' | 'openrouter' | 'groq' | 'xai' | 'qwen' | 'deepseek';

export interface ApiKeys {
  openai: string;
  google: string;
  anthropic: string;
  openrouter: string;
  groq: string;
  xai: string;
  qwen: string;
  deepseek: string;
}

export const defaultModels: Record<ProviderType, string> = {
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro-latest',
  anthropic: 'claude-3-opus-20240229',
  openrouter: 'anthropic/claude-3-opus',
  groq: 'llama-3.2-90b-vision-preview',
  xai: 'grok-vision-beta',
  qwen: 'qwen-vl-max',
  deepseek: 'deepseek-chat',
};

interface ApiContextType {
  apiKeys: ApiKeys;
  updateApiKey: (provider: ProviderType, key: string) => void;
  activeProvider: ProviderType;
  setActiveProvider: (provider: ProviderType) => void;
  activeModels: Record<ProviderType, string>;
  setActiveModel: (provider: ProviderType, model: string) => void;
  customModels: Record<ProviderType, string[]>;
  addCustomModel: (provider: ProviderType, model: string) => void;
  removeCustomModel: (provider: ProviderType, model: string) => void;
}

const defaultKeys: ApiKeys = {
  openai: '', google: '', anthropic: '', openrouter: '', groq: '', xai: '', qwen: '', deepseek: '',
};

const defaultCustomModels: Record<ProviderType, string[]> = {
  openai: [], google: [], anthropic: [], openrouter: [], groq: [], xai: [], qwen: [], deepseek: [],
};

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('foodAnalyzerKeys');
    return saved ? JSON.parse(saved) : defaultKeys;
  });

  const [activeProvider, setActiveProviderState] = useState<ProviderType>(() => {
    const saved = localStorage.getItem('foodAnalyzerActiveProvider');
    return (saved as ProviderType) || 'google';
  });

  const [activeModels, setActiveModelsState] = useState<Record<ProviderType, string>>(() => {
    const saved = localStorage.getItem('foodAnalyzerActiveModels');
    return saved ? JSON.parse(saved) : defaultModels;
  });

  const [customModels, setCustomModels] = useState<Record<ProviderType, string[]>>(() => {
    const saved = localStorage.getItem('foodAnalyzerCustomModels');
    return saved ? JSON.parse(saved) : defaultCustomModels;
  });

  useEffect(() => {
    localStorage.setItem('foodAnalyzerKeys', JSON.stringify(apiKeys));
    localStorage.setItem('foodAnalyzerActiveModels', JSON.stringify(activeModels));
    localStorage.setItem('foodAnalyzerCustomModels', JSON.stringify(customModels));
  }, [apiKeys, activeModels, customModels]);

  const updateApiKey = (provider: ProviderType, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  const setActiveProvider = (provider: ProviderType) => {
    setActiveProviderState(provider);
    localStorage.setItem('foodAnalyzerActiveProvider', provider);
  };

  const setActiveModel = (provider: ProviderType, model: string) => {
    setActiveModelsState(prev => ({ ...prev, [provider]: model }));
  };

  const addCustomModel = (provider: ProviderType, model: string) => {
    if (!model.trim()) return;
    setCustomModels(prev => {
      const existing = prev[provider] || [];
      if (existing.includes(model)) return prev;
      return { ...prev, [provider]: [...existing, model] };
    });
    setActiveModel(provider, model);
  };

  const removeCustomModel = (provider: ProviderType, model: string) => {
    setCustomModels(prev => {
      const existing = prev[provider] || [];
      return { ...prev, [provider]: existing.filter(m => m !== model) };
    });
    
    // If the removed model was active, fallback to default
    if (activeModels[provider] === model) {
      setActiveModel(provider, defaultModels[provider]);
    }
  };

  return (
    <ApiContext.Provider value={{ 
      apiKeys, updateApiKey, 
      activeProvider, setActiveProvider,
      activeModels, setActiveModel,
      customModels, addCustomModel, removeCustomModel
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
