import React, { useState } from 'react';
import { ApiProvider, useApi } from './context/ApiContext';
import { KeyManager } from './components/KeyManager';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeImage, type NutritionInfo } from './services/aiProviders';
import { Utensils } from 'lucide-react';
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
      
      <header style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }} className="animate-fade-in">
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(139, 92, 246, 0.1)', 
          padding: '1rem', 
          borderRadius: '50%',
          marginBottom: '1rem',
          color: 'var(--accent-primary)'
        }}>
          <Utensils size={40} />
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          background: 'var(--gradient-accent)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Food Analyzer
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Snap a photo and instantly get nutritional information using AI.
        </p>
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
