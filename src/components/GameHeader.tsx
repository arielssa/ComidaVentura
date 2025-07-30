import React from 'react';
import { Trophy, Crown, Sparkles, HelpCircle } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

interface GameHeaderProps {
  points: number;
  streak: number; // Mantenido para futura funcionalidad
  platesCreated: number; // Mantenido para futura funcionalidad  
  mode: 'creativo' | 'tradicional';
  onModeChange: (mode: 'creativo' | 'tradicional') => void;
  onHelpClick?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  points, 
  streak: _streak, // Reservado para futuras funcionalidades de racha
  platesCreated: _platesCreated, // Reservado para futuras funcionalidades de logros
  mode, 
  onModeChange, 
  onHelpClick = () => console.log('Help clicked') 
}) => {
  // Supresión temporal de warnings - variables reservadas para funcionalidades futuras
  void _streak;
  void _platesCreated;
  const { user } = useUser();
  return (
    <div className="relative mb-6">
      {/* Degradado como borde - naranja vibrante */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-red-400 rounded-3xl p-1">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl h-full w-full"></div>
      </div>
      
      {/* Contenido principal - fondo naranja como el logo */}
      <div className="relative bg-gradient-to-r from-orange-400/95 to-orange-500/95 backdrop-blur-sm text-white rounded-3xl shadow-2xl p-6">
        <div className="relative flex items-center justify-between h-20">
          
          {/* Logo - Altura estándar */}
          <div className="flex items-center space-x-4 h-14">
            <div className="relative transform hover:scale-110 transition-transform duration-300">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-1">
                <img 
                  src="/logo.png" 
                  alt="ComidaVentura Logo" 
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    // Fallback al ícono Crown si la imagen falla
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full items-center justify-center rounded-xl" style={{ display: 'none' }}>
                  <Crown className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex flex-col justify-center h-14">
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent leading-tight drop-shadow-lg">
                ComidaVentura
              </h1>
              <SignedIn>
                <p className="text-white/90 text-sm font-semibold leading-tight drop-shadow-md">
                  ¡Hola, {user?.firstName || 'Chef'}! 🍽️
                </p>
              </SignedIn>
              <SignedOut>
                <p className="text-white/90 text-sm font-semibold leading-tight drop-shadow-md">¡Vamos a cocinar! 👨‍🍳</p>
              </SignedOut>
            </div>
          </div>
          
          {/* Mode Switch - Altura estándar */}
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl p-2 border-2 border-white/40 shadow-lg h-14">
            <button
              onClick={() => onModeChange('creativo')}
              className={`px-6 py-2.5 rounded-xl text-base font-black transition-all duration-300 min-w-[120px] h-10 flex items-center justify-center drop-shadow-md ${
                mode === 'creativo'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl transform scale-105 border-2 border-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              🎨 Creativo
            </button>
            <button
              onClick={() => onModeChange('tradicional')}
              className={`px-6 py-2.5 rounded-xl text-base font-black transition-all duration-300 min-w-[120px] h-10 flex items-center justify-center drop-shadow-md ${
                mode === 'tradicional'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl transform scale-105 border-2 border-white/50'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              🍽️ Tradicional
            </button>
          </div>
          
          {/* Puntos - Altura estándar consistente */}
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 border-2 border-white/40 shadow-lg min-w-[140px] h-14">
            <div className="relative mr-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl shadow-lg">
                <Trophy className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              {points > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full animate-bounce flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold drop-shadow-sm">!</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-xl font-black text-white leading-tight drop-shadow-lg">{points}</div>
              <div className="text-xs text-white/90 font-bold leading-tight drop-shadow-md">PUNTOS</div>
            </div>
          </div>
          
          {/* Botones de acción - Altura estándar */}
          <div className="flex items-center space-x-4 h-14">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black rounded-2xl border-2 border-white/50 hover:scale-105 transition-all duration-300 shadow-xl text-base h-14 min-w-[120px] drop-shadow-lg">
                  <span>🔐 Entrar</span>
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/40 hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                      userButtonPopoverCard: "bg-white shadow-2xl border border-gray-200",
                      userButtonPopoverActionButton: "hover:bg-gray-50",
                    }
                  }}
                />
              </div>
            </SignedIn>
            
            <button
              onClick={onHelpClick}
              className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/40 hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg"
              title="Ayuda"
            >
              <HelpCircle className="w-7 h-7 text-white drop-shadow-md" />
            </button>
          </div>
        </div>
        
        {/* Barra de progreso más prominente - tonos cálidos */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-red-400 to-pink-400 rounded-b-3xl opacity-80"></div>
      </div>
    </div>
  );
};