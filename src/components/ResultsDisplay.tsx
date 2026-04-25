import React from 'react';
import { Flame, Beef, Wheat, Droplets, HeartPulse, Leaf, Utensils, Activity, ListChecks, CheckCircle2, Sparkles } from 'lucide-react';
import type { NutritionInfo } from '../services/aiProviders';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  data: NutritionInfo | null;
  error: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, error }) => {
  if (error) {
    return (
      <div className="error-panel modern-panel animate-fade-in">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'confidence-high';
    if (score >= 70) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <div className="results-container animate-fade-in">
      <div className="title-section">
        <h2 className="food-title">{data.foodName}</h2>
        <div className={`confidence-badge ${getConfidenceColor(data.confidenceScore)}`}>
          <CheckCircle2 size={14} />
          {data.confidenceScore}% Match
        </div>
      </div>
      
      {data.servingSize && (
        <div className="serving-size">
          <Utensils size={16} />
          <span>Estimated Serving: <strong>{data.servingSize}</strong></span>
        </div>
      )}

      <div className="macros-grid">
        <div className="macro-card modern-panel calories">
          <div className="macro-icon"><Flame size={24} /></div>
          <div className="macro-info">
            <span className="macro-label">Calories</span>
            <span className="macro-value">{data.calories}</span>
          </div>
        </div>
        
        <div className="macro-card modern-panel protein">
          <div className="macro-icon"><Beef size={24} /></div>
          <div className="macro-info">
            <span className="macro-label">Protein</span>
            <span className="macro-value">{data.protein}</span>
          </div>
        </div>
        
        <div className="macro-card modern-panel carbs">
          <div className="macro-icon"><Wheat size={24} /></div>
          <div className="macro-info">
            <span className="macro-label">Carbs</span>
            <span className="macro-value">{data.carbs}</span>
          </div>
        </div>
        
        <div className="macro-card modern-panel fat">
          <div className="macro-icon"><Droplets size={24} /></div>
          <div className="macro-info">
            <span className="macro-label">Fat</span>
            <span className="macro-value">{data.fat}</span>
          </div>
        </div>

        <div className="macro-card modern-panel fiber">
          <div className="macro-icon"><Leaf size={24} /></div>
          <div className="macro-info">
            <span className="macro-label">Fiber</span>
            <span className="macro-value">{data.fiber}</span>
          </div>
        </div>

        <div className="macro-card modern-panel sugar">
          <div className="macro-icon"><Activity size={24} /></div>
          <div className="macro-info">
            <span className="macro-label">Sugar</span>
            <span className="macro-value">{data.sugar}</span>
          </div>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="health-card modern-panel">
          <div className="health-header">
            <HeartPulse size={20} className="health-icon" />
            <h3>Health Insights</h3>
          </div>
          <p>{data.healthBenefits}</p>
          {data.sodium && (
            <div className="sodium-indicator">
              <strong>Sodium:</strong> {data.sodium}
            </div>
          )}
        </div>

        {data.ingredients && data.ingredients.length > 0 && (
          <div className="ingredients-card modern-panel">
            <div className="health-header">
              <ListChecks size={20} className="health-icon" />
              <h3>Estimated Ingredients</h3>
            </div>
            <ul className="ingredients-list">
              {data.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {data.funFact && (
          <div className="fun-fact-card modern-panel">
            <div className="health-header">
              <Sparkles size={20} className="fun-fact-icon" />
              <h3>Did You Know?</h3>
            </div>
            <p>{data.funFact}</p>
          </div>
        )}
      </div>
    </div>
  );
};
