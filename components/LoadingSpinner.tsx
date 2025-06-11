
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      <div className="spinner-border text-blue-600" style={{ width: '3rem', height: '3rem' }} aria-hidden="true">
        {/* Bootstrap spinner does not need inner elements typically, styled by its classes */}
      </div>
      <p className="mt-4 text-gray-600">Generando tu ruta personalizada...</p>
    </div>
  );
};

export default LoadingSpinner;