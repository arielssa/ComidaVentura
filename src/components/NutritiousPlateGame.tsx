import React, { useEffect, useRef, useState } from 'react';
import './NutritiousPlateGame.css';
import { Food } from '../types';
import { foods } from '../data/foods';
import { useArduino } from '../hooks/useArduino';

interface EcuadorianRecipe {
  name: string;
  ingredients: string[]; // ids de Food
}

interface NutritiousPlateGameProps {
  receta: Food[];
  ingredientes: Food[];
}

// Mapeo de categorías a secciones del plato
const plateSections = [
  { key: 'fruit', label: 'Frutas', color: '#FFD966' },
  { key: 'vegetable', label: 'Verduras', color: '#93C47D' },
  { key: 'protein', label: 'Proteínas', color: '#6FA8DC' },
  { key: 'grain', label: 'Cereales', color: '#F6B26B' },
];

const foxFaces = {
  normal: '🦊',
  happy: '😄🦊',
  celebrate: '🎉🦊✨',
  encourage: '🌟🦊',
  wrong: '😅🦊',
  thinking: '🤔🦊',
  excited: '🤩🦊',
};

const motivationalMessages = [
  '¡Excelente! ¡Sigue construyendo tu plato saludable! 🌟',
  '¡Solo falta un ingrediente más! ¡Ya casi terminas! 🎯',
  '¡Eres un chef súper saludable! ¡Me encanta tu plato! 👨‍🍳',
  '¡Qué plato tan colorido y nutritivo! ¡Perfecto! 🌈',
  '¡Fantástica elección! ¡Ese ingrediente es súper nutritivo! ✨',
  '¡Increíble! ¡Tu plato se ve delicioso y saludable! 🍽️',
];

const celebrationMessages = [
  '¡INCREÍBLE! ¡Completaste una receta súper nutritiva! 🎊',
  '¡BRAVO! ¡Eres el mejor chef saludable del mundo! 🏆',
  '¡FANTÁSTICO! ¡Tu plato está perfecto y delicioso! ⭐',
  '¡GENIAL! ¡Has creado una comida súper balanceada! 🎉',
];

const ecuadorianRecipes: EcuadorianRecipe[] = [
  {
    name: 'Seco de Pollo 🍗',
    ingredients: ['chicken', 'carrots', 'rice', 'banana'],
  },
  {
    name: 'Encebollado 🐟',
    ingredients: ['fish', 'onion', 'banana'],
  },
  {
    name: 'Bolón de Verde 🍌',
    ingredients: ['banana', 'cheese'],
  },
  {
    name: 'Arroz con Pollo 🍚',
    ingredients: ['chicken', 'rice', 'carrots', 'peas'],
  },
  {
    name: 'Yogur con Frutas 🥛',
    ingredients: ['yogurt', 'banana', 'apple', 'berries'],
  },
];

// Enhanced Fox Character Component
const FoxCharacter: React.FC<{ state: string; message: string; isAnimating: boolean }> = ({ state, message, isAnimating }) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message !== currentMessage) {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentMessage(message);
        setIsTyping(false);
      }, 300);
    }
  }, [message, currentMessage]);

  return (
    <div className="guide-character">
      <span 
        className={`fox-face${state === 'celebrate' ? ' celebrate' : ''}${state === 'wrong' ? ' wrong' : ''}${isAnimating ? ' bouncing' : ''}`} 
        role="img" 
        aria-label="Guía Nutricional"
      >
        {foxFaces[state as keyof typeof foxFaces]}
      </span>
      <div className={`guide-text ${isTyping ? 'typing' : ''}`}>
        {isTyping ? 'Pensando...' : currentMessage}
      </div>
    </div>
  );
};

// Particle Effect Component
const ParticleEffect: React.FC<{ isActive: boolean; type: 'celebration' | 'sparkle' }> = ({ isActive, type }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: type === 'celebration' ? 20 : 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, type]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="particle-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${type}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`,
          }}
        >
          {type === 'celebration' ? '🎊' : '✨'}
        </div>
      ))}
    </div>
  );
};

function getFoxState(placedCount: number, total: number, completed: boolean, wrong: boolean, isThinking: boolean = false) {
  if (wrong) return 'wrong';
  if (completed) return 'celebrate';
  if (isThinking) return 'thinking';
  if (placedCount === total - 1) return 'encourage';
  if (placedCount > 0) return 'happy';
  return 'normal';
}

function getMotivationalMessage(placedCount: number, total: number, completed: boolean, wrong: boolean) {
  if (wrong) return '¡Oops! Ese ingrediente no es parte de esta receta. ¡Intenta con otro! 😊';
  if (completed) return celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
  if (placedCount === total - 1) return motivationalMessages[1];
  if (placedCount > 0) return motivationalMessages[Math.floor(Math.random() * (motivationalMessages.length - 2)) + 2];
  return 'Escanea los ingredientes con NFC para completar la receta. ¡Vamos a crear algo delicioso! 🍽️';
}

const addSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const winSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const wrongSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';

const GEMINI_API_KEY = 'AIzaSyCLbIaIKobsQWdCMFFnrTScXbIqeeRg4Lk';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;



const NutritiousPlateGame: React.FC<NutritiousPlateGameProps> = ({ receta, ingredientes }) => {
  const { resetDish } = useArduino();
  // --- Modo de juego ---
  const [mode, setMode] = useState<'creativo' | 'tradicional'>('creativo');
  const [selectedRecipe, setSelectedRecipe] = useState<EcuadorianRecipe | null>(null);
  const [tradicionalPlaced, setTradicionalPlaced] = useState<string[]>([]);
  const [wrongIngredient, setWrongIngredient] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  // --- Sonidos ---
  const addSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const prevPlacedCount = useRef(0);

  // Initialize sounds
  useEffect(() => {
    addSound.current = new Audio(addSoundUrl);
    winSound.current = new Audio(winSoundUrl);
    wrongSound.current = new Audio(wrongSoundUrl);
    
    // Set volume and prepare sounds
    [addSound.current, winSound.current, wrongSound.current].forEach(sound => {
      if (sound) {
        sound.volume = 0.3;
        sound.preload = 'auto';
      }
    });
  }, []);

  // --- Tradicional: pedir receta dinámica a la IA ---
  const fetchTraditionalRecipe = async () => {
    setLoadingRecipe(true);
    setIsThinking(true);
    setRecipeError(null);
    setSelectedRecipe(null);
    setTradicionalPlaced([]);
    setWrongIngredient(null);
    
    const availableNames = foods.map(f => f.name).join(', ');
    const prompt = `Dame una receta típica ecuatoriana (o si no es posible, una receta saludable) usando solo estos ingredientes: ${availableNames}. Responde SOLO con el nombre del plato en la primera línea y luego una lista de ingredientes (uno por línea, solo el nombre del ingrediente, sin cantidades ni explicaciones).`;
    
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: prompt } ] }
          ]
        })
      });
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('Respuesta inesperada de la IA');
      
      const name = lines[0];
      const ingredientFoods: Food[] = lines.slice(1).map((line: string) => {
        return foods.find(f => f.name.toLowerCase() === line.toLowerCase() || f.name.toLowerCase().includes(line.toLowerCase()));
      }).filter(Boolean) as Food[];
      
      if (ingredientFoods.length < 2) throw new Error('No se encontraron suficientes ingredientes válidos');
      
      setSelectedRecipe({ name, ingredients: ingredientFoods.map(f => f.id) });
      setShowSparkles(true);
    } catch (_err) {
      setRecipeError('No se pudo obtener una receta. ¡Intenta de nuevo! 🔄');
    } finally {
      setLoadingRecipe(false);
      setIsThinking(false);
    }
  };

  // --- Tradicional: pedir receta al entrar o al reiniciar ---
  useEffect(() => {
    if (mode === 'tradicional') {
      fetchTraditionalRecipe();
    }
  }, [mode]);

  // --- Tradicional: lógica de ingredientes ---
  useEffect(() => {
    if (mode !== 'tradicional' || !selectedRecipe) return;
    const last = ingredientes[ingredientes.length - 1];
    if (!last) return;
    if (tradicionalPlaced.includes(last.id)) return;
    
    if (selectedRecipe.ingredients.includes(last.id)) {
      setTradicionalPlaced(prev => [...prev, last.id]);
      setWrongIngredient(null);
      setShowSparkles(true);
      addSound.current?.play();
    } else {
      setWrongIngredient(last.id);
      wrongSound.current?.play();
      setTimeout(() => setWrongIngredient(null), 1500);
    }
  }, [ingredientes.length]);

  const tradicionalCompleted = selectedRecipe && tradicionalPlaced.length === (selectedRecipe?.ingredients.length || 0);

  useEffect(() => {
    if (tradicionalCompleted) {
      setShowCelebration(true);
      winSound.current?.play();
    }
  }, [tradicionalCompleted]);

  // --- Creativo: lógica original ---
  const placed: { [key: string]: boolean } = {};
  plateSections.forEach(section => {
    const recetaFood = receta.find(f => f.category === section.key);
    if (recetaFood) {
      placed[section.key] = ingredientes.some(i => i.id === recetaFood.id);
    } else {
      placed[section.key] = false;
    }
  });
  const placedCount = Object.values(placed).filter(Boolean).length;
  const completed = plateSections.every(section => placed[section.key]);
  const points = placedCount * 10;

  useEffect(() => {
    if (mode === 'creativo') {
      if (placedCount > prevPlacedCount.current && !completed) {
        setShowSparkles(true);
        addSound.current?.play();
      }
      if (completed && prevPlacedCount.current !== placedCount) {
        setShowCelebration(true);
        winSound.current?.play();
      }
      prevPlacedCount.current = placedCount;
    }
  }, [placedCount, completed, mode]);

  // Fox state y mensaje
  const foxState = getFoxState(
    mode === 'creativo' ? placedCount : tradicionalPlaced.length,
    mode === 'creativo' ? plateSections.length : (selectedRecipe?.ingredients.length || 0),
    mode === 'creativo' ? completed : !!tradicionalCompleted,
    !!wrongIngredient,
    isThinking || loadingRecipe
  );
  
  const motivational = getMotivationalMessage(
    mode === 'creativo' ? placedCount : tradicionalPlaced.length,
    mode === 'creativo' ? plateSections.length : (selectedRecipe?.ingredients.length || 0),
    mode === 'creativo' ? completed : !!tradicionalCompleted,
    !!wrongIngredient
  );

  // --- GEMINI API ---
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<string | null>(null);

  const handleGenerateRecipe = async () => {
    setRecipeLoading(true);
    setRecipeError(null);
    setRecipeResult(null);
    setIsThinking(true);
    
    const ingredientNames = ingredientes.map(f => f.name).join(', ');
    const prompt = `Dame una receta sencilla, divertida y saludable para niños pequeños usando estos ingredientes: ${ingredientNames}. Responde solo con la receta, en español, con pasos claros y cortos. Hazla muy divertida y usa emojis.`;
    
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: prompt } ] }
          ]
        })
      });
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar la receta.';
      setRecipeResult(text);
      setShowSparkles(true);
    } catch (err) {
      setRecipeError('Ocurrió un error al generar la receta. ¡Intenta de nuevo! 🔄');
    } finally {
      setRecipeLoading(false);
      setIsThinking(false);
    }
  };

  // Cambiar el handler del botón de reinicio
  const handleRestart = async () => {
    setShowCelebration(false);
    setShowSparkles(false);
    setWrongIngredient(null);
    
    if (mode === 'tradicional') {
      await resetDish();
      fetchTraditionalRecipe();
    } else {
      await resetDish();
      window.location.reload();
    }
  };

  // --- Render ---
  return (
    <div className="nutritious-plate-game-wrapper">
      {/* Particle Effects */}
      <ParticleEffect isActive={showCelebration} type="celebration" />
      <ParticleEffect isActive={showSparkles} type="sparkle" />
      
      {/* Header superior centrado */}
      <div className="game-header-center">
        <div className="game-mode-selector">
          <button 
            className={mode === 'creativo' ? 'active' : ''} 
            onClick={() => setMode('creativo')}
            disabled={loadingRecipe}
          >
            🎨 Modo Creativo
          </button>
          <button 
            className={mode === 'tradicional' ? 'active' : ''} 
            onClick={() => { 
              setMode('tradicional'); 
              setTradicionalPlaced([]); 
              setWrongIngredient(null); 
            }}
            disabled={loadingRecipe}
          >
            🍽️ Receta Tradicional
          </button>
        </div>
        
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ 
              width: `${(mode === 'creativo' ? ingredientes.length : (selectedRecipe?.ingredients.length || 0)) === 0 ? 0 : (mode === 'creativo' ? ingredientes.length : tradicionalPlaced.length) / (mode === 'creativo' ? ingredientes.length : (selectedRecipe?.ingredients.length || 1)) * 100}%` 
            }}
          />
        </div>
        
        <div className="points-bar">
          <span className="points-label">🏆 Puntos:</span>
          <span className="points-value">
            {mode === 'creativo' ? ingredientes.length * 10 : tradicionalPlaced.length * 20}
          </span>
          {(mode === 'tradicional' && tradicionalCompleted) || (mode === 'creativo' && ingredientes.length > 0) ? 
            <span className="points-trophy">🏆</span> : null
          }
        </div>
      </div>

      {/* División en dos columnas */}
      <div className="nutritious-plate-game">
        <div className="plate-column">
          <FoxCharacter 
            state={foxState} 
            message={motivational} 
            isAnimating={showSparkles || showCelebration}
          />
          
          {/* Plato central (SVG) */}
          {mode === 'tradicional' && selectedRecipe && (
            <div className="traditional-recipe-title">
              {loadingRecipe ? '🤔 Pensando en una receta...' : selectedRecipe.name}
            </div>
          )}
          
          <div className="plate-area">
            <svg width="420" height="420" viewBox="0 0 420 420">
              {(mode === 'creativo'
                ? Array.from(new Map(ingredientes.map(f => [f.id, f])).values())
                : (selectedRecipe ? selectedRecipe.ingredients.map(id => foods.find(f => f.id === id)).filter(Boolean) as Food[] : [])
              ).map((food, idx, arr) => {
                const total = arr.length;
                const angle = (360 / total) * idx;
                const largeArc = 360 / total > 180 ? 1 : 0;
                const radius = 170;
                const x1 = 210 + radius * Math.cos((Math.PI / 180) * angle);
                const y1 = 210 + radius * Math.sin((Math.PI / 180) * angle);
                const x2 = 210 + radius * Math.cos((Math.PI / 180) * (angle + 360 / total));
                const y2 = 210 + radius * Math.sin((Math.PI / 180) * (angle + 360 / total));
                const pathData = `M210,210 L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
                
                // Coloreado: creativo siempre, tradicional solo si escaneado
                let isPlaced = true;
                if (mode === 'tradicional' && selectedRecipe) {
                  isPlaced = tradicionalPlaced.includes(food.id);
                }
                const color = plateSections[idx % plateSections.length].color;
                
                return (
                  <g key={food.id + idx}>
                    <path
                      d={pathData}
                      fill={isPlaced ? color : '#fff'}
                      stroke="#888"
                      strokeWidth="3"
                      style={{ 
                        cursor: 'default', 
                        transition: 'fill 0.3s ease-in-out',
                        filter: isPlaced ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                      }}
                    />
                    <g>
                      <text
                        x={210 + 110 * Math.cos((Math.PI / 180) * (angle + 360 / total / 2))}
                        y={210 + 110 * Math.sin((Math.PI / 180) * (angle + 360 / total / 2))}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize="2.8rem"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {food.image}
                      </text>
                      <text
                        x={210 + 110 * Math.cos((Math.PI / 180) * (angle + 360 / total / 2))}
                        y={210 + 140 * Math.sin((Math.PI / 180) * (angle + 360 / total / 2))}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize="1.2rem"
                        fill="#111"
                        fontWeight="bold"
                        style={{
                          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                        }}
                      >
                        {food.name}
                      </text>
                    </g>
                  </g>
                );
              })}
              <circle 
                cx="210" 
                cy="210" 
                r="170" 
                fill="none" 
                stroke="#444" 
                strokeWidth="6" 
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
          </div>
          
          {(mode === 'tradicional' && tradicionalCompleted) || (mode === 'creativo' && ingredientes.length > 0) ? (
            <div className="celebration">
              <span role="img" aria-label="Estrella">🌟</span>
              <span role="img" aria-label="Confeti">🎉</span>
              <div className="medal">🏅</div>
            </div>
          ) : null}
          
          <button className="restart-btn" onClick={handleRestart} disabled={loadingRecipe}>
            {loadingRecipe ? '⏳ Cargando...' : '🔄 Reiniciar'}
          </button>
          
          <div className="help-btn" title="¿Cómo jugar?">
            <span role="img" aria-label="Ayuda">❓</span>
            <div className="help-tooltip">
              🎮 <strong>¿Cómo jugar?</strong><br/>
              📱 Escanea los ingredientes con las tarjetas NFC<br/>
              🎨 En modo creativo: ¡Crea tu plato libremente!<br/>
              🍽️ En modo tradicional: ¡Sigue la receta propuesta!<br/>
              🏆 ¡Gana puntos y medallas por completar recetas!
            </div>
          </div>
        </div>
        
        <div className="ingredients-column">
          <div className="ingredients-list">
            {(mode === 'creativo'
              ? ingredientes.filter((food, idx, arr) => false) // Empty for creative mode
              : (selectedRecipe
                  ? selectedRecipe.ingredients
                      .map(id => foods.find(f => f.id === id))
                      .filter(Boolean)
                      .filter((food) => !tradicionalPlaced.includes(food!.id)) as Food[]
                  : [])
            ).map((food, idx) => (
              <div
                key={food.id + idx}
                className="ingredient-card"
                style={{ cursor: 'default' }}
              >
                <span className="ingredient-img" role="img" aria-label={food.name}>
                  {food.image}
                </span>
                <div className="ingredient-name">{food.name}</div>
              </div>
            ))}
          </div>
          
          {/* Loading state for traditional mode */}
          {mode === 'tradicional' && loadingRecipe && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>🤔 Creando una receta deliciosa...</p>
            </div>
          )}
          
          {/* Error state */}
          {recipeError && (
            <div className="ai-recipe-error">
              {recipeError}
            </div>
          )}
        </div>
      </div>
      
      {/* --- Panel de receta sugerida por IA --- */}
      {mode === 'creativo' && (
        <div className="ai-recipe-panel">
          <button 
            className="ai-recipe-btn" 
            onClick={handleGenerateRecipe} 
            disabled={ingredientes.length === 0 || recipeLoading}
          >
            {recipeLoading ? (
              <>
                <span className="loading-spinner"></span>
                🤖 Creando receta mágica...
              </>
            ) : (
              '🤖✨ Sugerir receta con IA'
            )}
          </button>
          
          {recipeResult && (
            <div className="ai-recipe-result">
              <div className="ai-recipe-title">🍽️ ¡Receta Mágica Creada!</div>
              <div className="ai-recipe-text">{recipeResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritiousPlateGame; 