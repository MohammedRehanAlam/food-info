import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="bg-overlay">
      <div className="bg-pattern" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
};
