import React, { useState } from 'react';
import { Wifi, WifiOff, Usb, RefreshCw, Settings } from 'lucide-react';

interface ArduinoStatusProps {
  isConnected: boolean;
  serialStatus: { connected: boolean; port: string | null };
  availablePorts: any[];
  onConnectToPort: (port: string, baudRate?: number) => Promise<void>;
  onRefreshPorts: () => Promise<void>;
}

export const ArduinoStatus: React.FC<ArduinoStatusProps> = ({
  isConnected,
  serialStatus,
  availablePorts,
  onConnectToPort,
  onRefreshPorts,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPort, setSelectedPort] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!selectedPort) return;
    
    setIsConnecting(true);
    try {
      await onConnectToPort(selectedPort, baudRate);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await onRefreshPorts();
    } catch (error) {
      console.error('Failed to refresh ports:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">
              WebSocket: {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {serialStatus.connected ? (
              <Usb className="w-5 h-5 text-green-500" />
            ) : (
              <Usb className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">
              Arduino: {serialStatus.connected ? `Conectado (${serialStatus.port})` : 'Desconectado'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configurar</span>
        </button>
      </div>

      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Configuración de Arduino</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puerto Serial
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar puerto...</option>
                  {availablePorts.map((port) => (
                    <option key={port.path} value={port.path}>
                      {port.path} {port.manufacturer && `(${port.manufacturer})`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRefresh}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  title="Actualizar puertos"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baud Rate
              </label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
                <option value={57600}>57600</option>
                <option value={115200}>115200</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleConnect}
                disabled={!selectedPort || isConnecting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? 'Conectando...' : 'Conectar'}
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            <p>💡 <strong>Tip:</strong> Asegúrate de que tu Arduino esté conectado y que no esté siendo usado por otro programa (como el IDE de Arduino).</p>
          </div>
        </div>
      )}
    </div>
  );
}; 