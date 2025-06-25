import React, { useState } from 'react';
import { Wifi, Zap } from 'lucide-react';

interface ScannerSimulatorProps {
  isScanning: boolean;
  onScanComplete: () => void;
}

export const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ isScanning, onScanComplete }) => {
  const [showScanEffect, setShowScanEffect] = useState(false);

  React.useEffect(() => {
    if (isScanning) {
      setShowScanEffect(true);
      const timer = setTimeout(() => {
        setShowScanEffect(false);
        onScanComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, onScanComplete]);

  return (
    <div className="text-center py-4">
      <div className={`
        inline-flex items-center justify-center w-16 h-16 rounded-full 
        transition-all duration-300 mb-3
        ${isScanning 
          ? 'bg-blue-500 text-white animate-pulse shadow-lg' 
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        }
      `}>
        {isScanning ? (
          <Zap className="w-8 h-8" />
        ) : (
          <Wifi className="w-8 h-8" />
        )}
      </div>
      
      <div className="text-sm font-medium text-gray-700 mb-1">
        {isScanning ? '¡Escaneando...' : 'Simulador NFC/RFID'}
      </div>
      
      <div className="text-xs text-gray-500">
        {isScanning ? 'Procesando tarjeta alimentaria' : 'Haz clic en una tarjeta para escanear'}
      </div>

      {showScanEffect && (
        <div className="mt-4">
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-xs text-blue-600 mt-2 animate-pulse">Analizando información nutricional...</div>
        </div>
      )}
    </div>
  );
};