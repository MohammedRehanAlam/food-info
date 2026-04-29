import React, { useState } from 'react';
import { ApiProvider, useApi } from './context/ApiContext';
import { KeyManager } from './components/KeyManager';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Background } from './components/Background';
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
    <>
      <Background />
      <div className="container">
        <KeyManager />
        
        <header style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '4rem' }} className="animate-fade-in">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(139, 92, 246, 0.1)', 
            padding: '1.25rem', 
            borderRadius: '1.25rem',
            marginBottom: '1.5rem',
            color: 'var(--accent-primary)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
          }}>
            <Utensils size={44} />
          </div>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800', 
            letterSpacing: '-0.025em',
            background: 'var(--gradient-accent)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Food Analyzer
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '1.125rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            Snap a photo and instantly get nutritional information using state-of-the-art AI.
          </p>
        </header>

        <main>
          <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
          <ResultsDisplay data={data} error={error} />
        </main>
      </div>
    </>
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
