import React from 'react';

const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

export default Spinner;

// Add this CSS to your global styles or a CSS module
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// } 