import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Crown, Sparkles, ChefHat } from 'lucide-react';

interface SplashScreenProps {
  onLoadingComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLoadingComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('¡Preparando ingredientes mágicos!');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const loadingMessages = [
      '🥕 Cortando zanahorias...',
      '🍎 Lavando manzanas frescas...',
      '🥦 Preparando brócoli verde...',
      '🍗 Cocinando pollo dorado...',
      '🌾 Midiendo arroz integral...',
      '✨ ¡Casi listo para cocinar!'
    ];

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        
        // Cambiar mensaje según el progreso
        const messageIndex = Math.floor((newProgress / 100) * loadingMessages.length);
        if (messageIndex < loadingMessages.length) {
          setLoadingText(loadingMessages[messageIndex]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowLogin(true), 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    onLoadingComplete();
  };

  if (!showLogin) {
    // Pantalla de loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center relative overflow-hidden">
        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-12 h-12 bg-green-300/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-orange-300/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-pink-300/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-8 w-10 h-10 bg-blue-300/20 rounded-full animate-pulse"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          {/* Logo y título */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              ComidaVentura
            </h1>
            <p className="text-gray-600 text-lg">¡La aventura culinaria está por comenzar! 🍽️</p>
          </div>

          {/* Chef illustration */}
          <div className="mb-8">
            <img 
              src="/chef.png" 
              alt="Chef ComidaVentura" 
              className="w-32 h-32 mx-auto object-contain animate-pulse"
              onError={(e) => {
                // Fallback si no se encuentra la imagen
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextEl = target.nextElementSibling as HTMLElement;
                if (nextEl) nextEl.style.display = 'flex';
              }}
            />
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full items-center justify-center" style={{ display: 'none' }}>
              <ChefHat className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Loading bar */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-purple-600 font-semibold text-lg animate-bounce">
              {loadingText}
            </p>
          </div>

          {/* Progress percentage */}
          <div className="text-4xl font-bold text-gray-700 mb-2">
            {Math.round(loadingProgress)}%
          </div>
          <p className="text-gray-500 text-sm">Cargando ingredientes mágicos...</p>
        </div>
      </div>
    );
  }

  // Pantalla de login/bienvenida - Minimalista
  return (
    <div className="h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center relative overflow-hidden">
      {/* Elementos decorativos mínimos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 text-4xl animate-pulse">🍎</div>
        <div className="absolute top-32 right-24 text-4xl animate-bounce">⭐</div>
        <div className="absolute bottom-20 right-20 text-4xl animate-pulse">🥦</div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        
        {/* Logo compacto */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ComidaVentura
          </h1>
        </div>

        {/* Chef - Tamaño reducido */}
        <div className="mb-6">
          <img 
            src="/chef.png" 
            alt="Chef ComidaVentura" 
            className="w-32 h-32 mx-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const nextEl = target.nextElementSibling as HTMLElement;
              if (nextEl) nextEl.style.display = 'flex';
            }}
          />
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full items-center justify-center" style={{ display: 'none' }}>
            <ChefHat className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Call to Action directo */}
        <div className="space-y-4">
          <SignedIn>
            <p className="text-green-800 font-semibold text-lg mb-4">
              ¡Listo para cocinar! 🎉
            </p>
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              🍳 ¡Empezar a Cocinar!
            </button>
          </SignedIn>

          <SignedOut>
            <div className="mb-4">
              <p className="text-orange-800 font-bold text-lg mb-2">
                ¡Hola pequeño chef! 👨‍🍳
              </p>
              <p className="text-gray-600 text-sm">
                Únete para guardar tu progreso y desbloquear recetas especiales
              </p>
            </div>
            
            <SignInButton mode="modal">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 text-lg">
                👑 ¡Ser Chef ComidaVentura!
              </button>
            </SignInButton>
            
            <p className="text-xs text-gray-500 mt-3">
              🎁 Puntos extra • 🏆 Logros • 📊 Progreso guardado
            </p>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};