import React from 'react';
import { useArduino } from '../hooks/useArduino';
import { ArduinoStatus } from './ArduinoStatus';
import { ArduinoDish } from './ArduinoDish';

export const ArduinoApp: React.FC = () => {
  const {
    dish,
    isConnected,
    serialStatus,
    availablePorts,
    connectToPort,
    resetDish,
    refreshPorts,
  } = useArduino();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍽️ ComidaVentura - Arduino RFID
          </h1>
          <p className="text-gray-600">
            Sistema de seguimiento de alimentos con Arduino y tarjetas RFID
          </p>
        </div>

        <ArduinoStatus
          isConnected={isConnected}
          serialStatus={serialStatus}
          availablePorts={availablePorts}
          onConnectToPort={connectToPort}
          onRefreshPorts={refreshPorts}
        />

        <ArduinoDish
          dish={dish}
          onReset={resetDish}
        />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📋 Instrucciones de Uso
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">🔧 Configuración</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Conecta tu Arduino al puerto USB</li>
                <li>Haz clic en "Configurar" para seleccionar el puerto</li>
                <li>Selecciona el puerto correcto (generalmente COM3, COM4, etc.)</li>
                <li>Haz clic en "Conectar"</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">🏷️ Uso de Tarjetas RFID</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Acerca una tarjeta RFID al lector</li>
                <li>El alimento se agregará automáticamente al plato</li>
                <li>Las calorías se sumarán al total</li>
                <li>Usa la tarjeta de "Reset" para limpiar el plato</li>
              </ol>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Importante:</strong> Asegúrate de cerrar el IDE de Arduino antes de conectar, 
              ya que solo un programa puede usar el puerto serial a la vez.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🍎 Alimentos Disponibles
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Salmón', emoji: '🐟', calories: 208 },
              { name: 'Pollo', emoji: '🍗', calories: 165 },
              { name: 'Huevos', emoji: '🥚', calories: 155 },
              { name: 'Brócoli', emoji: '🥦', calories: 34 },
              { name: 'Zanahoria', emoji: '🥕', calories: 41 },
              { name: 'Plátano', emoji: '🍌', calories: 89 },
              { name: 'Manzana', emoji: '🍎', calories: 52 },
              { name: 'Arroz', emoji: '🍚', calories: 111 },
              { name: 'Pan', emoji: '🍞', calories: 75 },
              { name: 'Queso', emoji: '🧀', calories: 113 },
              { name: 'Yogur', emoji: '🥛', calories: 59 },
              { name: 'Papas Fritas', emoji: '🍟', calories: 152 },
            ].map((food) => (
              <div key={food.name} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">{food.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{food.name}</div>
                <div className="text-xs text-gray-500">{food.calories} cal</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 