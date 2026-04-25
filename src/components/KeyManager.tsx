import React, { useState } from 'react';
import { useApi, type ProviderType, defaultModels } from '../context/ApiContext';
import { Settings, X, Key, Check, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { verifyConnection } from '../services/aiProviders';
import './KeyManager.css';

const PROVIDERS: { id: ProviderType; name: string }[] = [
  { id: 'google', name: 'Google Gemini' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic Claude' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'groq', name: 'Groq' },
  { id: 'xai', name: 'xAI (Grok)' },
  { id: 'qwen', name: 'Qwen' },
  { id: 'deepseek', name: 'DeepSeek' },
];

export const KeyManager: React.FC = () => {
  const { 
    apiKeys, updateApiKey, 
    activeProvider, setActiveProvider,
    activeModels, setActiveModel,
    customModels, addCustomModel, removeCustomModel
  } = useApi();
  
  const [isOpen, setIsOpen] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<ProviderType>(activeProvider);
  const [newModelName, setNewModelName] = useState('');
  
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [verifyMsg, setVerifyMsg] = useState('');

  const handleVerify = async () => {
    const key = apiKeys[viewingProvider];
    const model = activeModels[viewingProvider];
    if (!key) {
      setVerifyStatus('error');
      setVerifyMsg('API Key is missing');
      return;
    }

    setVerifyStatus('loading');
    setVerifyMsg('Testing connection...');
    
    try {
      await verifyConnection(viewingProvider, key, model);
      setVerifyStatus('success');
      setVerifyMsg('Connection successful!');
    } catch (err: any) {
      setVerifyStatus('error');
      setVerifyMsg(err.message || 'Verification failed');
    }
  };

  const handleAddCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModelName.trim()) {
      addCustomModel(viewingProvider, newModelName.trim());
      setNewModelName('');
    }
  };

  const handleOpen = () => {
    setViewingProvider(activeProvider);
    setVerifyStatus('idle');
    setIsOpen(true);
  };

  const allModelsForProvider = [
    defaultModels[viewingProvider],
    ...(customModels[viewingProvider] || [])
  ];

  return (
    <>
      <button className="settings-btn modern-panel" onClick={handleOpen}>
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
          <div className="modal-content modern-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Key size={20} /> Configuration</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-layout">
              <div className="sidebar">
                <div className="sidebar-title">Providers</div>
                {PROVIDERS.map(p => (
                  <button 
                    key={p.id}
                    className={`provider-tab ${viewingProvider === p.id ? 'active' : ''}`}
                    onClick={() => {
                      setViewingProvider(p.id);
                      setVerifyStatus('idle');
                    }}
                  >
                    {p.name}
                    {activeProvider === p.id && <div className="active-dot" />}
                  </button>
                ))}
              </div>

              <div className="settings-content">
                <div className="content-header">
                  <h3>{PROVIDERS.find(p => p.id === viewingProvider)?.name} Settings</h3>
                  {activeProvider !== viewingProvider && (
                    <button 
                      className="btn-primary-small"
                      onClick={() => setActiveProvider(viewingProvider)}
                    >
                      Set as Active
                    </button>
                  )}
                  {activeProvider === viewingProvider && (
                    <span className="badge-active">Active</span>
                  )}
                </div>

                <div className="form-group">
                  <label>API Key</label>
                  <input
                    type="password"
                    placeholder="Enter API Key"
                    value={apiKeys[viewingProvider] || ''}
                    onChange={(e) => {
                      updateApiKey(viewingProvider, e.target.value);
                      setVerifyStatus('idle');
                    }}
                    className="modern-input"
                  />
                  <p className="help-text">Stored locally. Never sent to our servers.</p>
                </div>

                <div className="form-group">
                  <label>Model</label>
                  <div className="model-selector">
                    <select 
                      value={activeModels[viewingProvider] || defaultModels[viewingProvider]} 
                      onChange={(e) => setActiveModel(viewingProvider, e.target.value)}
                      className="modern-input"
                    >
                      {allModelsForProvider.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <form className="add-model-form" onSubmit={handleAddCustomModel}>
                  <input 
                    type="text" 
                    placeholder="Add custom model name..." 
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="modern-input"
                  />
                  <button type="submit" className="btn-secondary" disabled={!newModelName.trim()}>
                    <Plus size={18} />
                  </button>
                </form>

                {customModels[viewingProvider]?.length > 0 && (
                  <div className="custom-models-list">
                    <label>Saved Custom Models:</label>
                    <div className="tags">
                      {customModels[viewingProvider].map(m => (
                        <div key={m} className="model-tag">
                          {m}
                          <button onClick={() => removeCustomModel(viewingProvider, m)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="verify-section">
                  <button 
                    className="btn-verify" 
                    onClick={handleVerify}
                    disabled={verifyStatus === 'loading' || !apiKeys[viewingProvider]}
                  >
                    {verifyStatus === 'loading' ? <Loader2 className="spin" size={18} /> : 'Verify Connection'}
                  </button>
                  
                  {verifyStatus !== 'idle' && (
                    <div className={`verify-status ${verifyStatus}`}>
                      {verifyStatus === 'success' && <Check size={16} />}
                      {verifyStatus === 'error' && <AlertCircle size={16} />}
                      {verifyStatus === 'loading' && <Loader2 size={16} className="spin" />}
                      <span>{verifyMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
