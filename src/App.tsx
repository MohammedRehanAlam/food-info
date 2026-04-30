import React, { useState } from 'react';
import { ApiProvider, useApi } from './context/ApiContext';
import { KeyManager } from './components/KeyManager';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeImage, type NutritionInfo } from './services/aiProviders';
import { Sparkles, Utensils } from 'lucide-react';
import './styles/global.css';

const MainApp: React.FC = () => {
  const { apiKeys, activeProvider, activeModels } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<NutritionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64Image: string) => {
    if (!base64Image) {
      setData(null);
      setError(null);
      return;
    }

    const apiKey = apiKeys[activeProvider];
    const model = activeModels[activeProvider];
    if (!apiKey) {
      setError(`Please configure your ${activeProvider} API key in the settings first.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeImage(base64Image, activeProvider, apiKey, model);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <KeyManager />
      
      <header className="app-header animate-fade-in">
        <div className="floating-container">
          <div className="rotating-ring"></div>
          <div className="inner-ring">
            <Utensils size={32} className="header-icon" />
          </div>
        </div>
        
        <div className="ai-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>AI-POWERED RECOGNITION</span>
        </div>

        <h1 className="main-title">
          Food <span className="title-gradient">Analyzer</span>
        </h1>
        
        <p className="subtitle">
          Upload photo of any food and instantly unlock its nutritional secrets, ingredients, and dietary information.
        </p>

        <div className="separator">
          <span className="dot"></span>
          <span className="line"></span>
          <span className="dot"></span>
        </div>
      </header>

      <main>
        <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
        <ResultsDisplay data={data} error={error} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApiProvider>
      <MainApp />
    </ApiProvider>
  );
};

export default App;
