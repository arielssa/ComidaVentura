import React, { useEffect, useRef, useState } from 'react';
import './NutritiousPlateGame.css';
import { Food } from '../types';
import { foods } from '../data/foods';
import { useArduino } from '../hooks/useArduino';
import PlateHealthPredictor from './PlateHealthPredictor';

interface EcuadorianRecipe {
  name: string;
  ingredients: string[]; // ids de Food
}

interface NutritiousPlateGameProps {
  receta: Food[];
  ingredientes: Food[];
  initialMode?: 'creativo' | 'tradicional';
}

// Mapeo de categorías a secciones del plato
const plateSections = [
  { key: 'fruit', label: 'Frutas', color: '#FFD966', emoji: '🍎' },
  { key: 'vegetable', label: 'Verduras', color: '#93C47D', emoji: '🥦' },
  { key: 'protein', label: 'Proteínas', color: '#6FA8DC', emoji: '🍗' },
  { key: 'grain', label: 'Cereales', color: '#F6B26B', emoji: '🌾' },
];

const foxFaces = {
  normal: '🦊',
  happy: '😄🦊',
  celebrate: '🎉🦊✨',
  encourage: '🌟🦊',
  wrong: '😅🦊',
  thinking: '🤔🦊',
  excited: '🤩🦊',
  waiting: '👀🦊',
  cheering: '👏🦊',
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

const waitingMessages = [
  'Agrega ingredientes paracomenzar la aventura culinaria 🌟',
  '¿Qué rico plato vamos a crear hoy? ¡Empecemos! 👨‍🍳',
];

// Enhanced Progress Component (temporarily unused)
// const ProgressRing: React.FC<{ progress: number; total: number; mode: string }> = ({ progress, total }) => {
//   const radius = 45;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDasharray = circumference;
//   const strokeDashoffset = circumference - (progress / total) * circumference;
//   
//   return (
//     <div className="progress-ring-container">
//       <svg className="progress-ring" width="120" height="120">
//         <circle
//           className="progress-ring-background"
//           cx="60"
//           cy="60"
//           r={radius}
//           fill="transparent"
//           stroke="rgba(255,255,255,0.3)"
//           strokeWidth="8"
//         />
//         <circle
//           className="progress-ring-fill"
//           cx="60"
//           cy="60"
//           r={radius}
//           fill="transparent"
//           stroke="url(#progressGradient)"
//           strokeWidth="8"
//           strokeDasharray={strokeDasharray}
//           strokeDashoffset={strokeDashoffset}
//           transform="rotate(-90 60 60)"
//         />
//         <defs>
//           <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#32d74b" />
//             <stop offset="50%" stopColor="#ffcc02" />
//             <stop offset="100%" stopColor="#ff9500" />
//           </linearGradient>
//         </defs>
//       </svg>
//       <div className="progress-content">
//         <div className="progress-text">
//           <span className="progress-numbers">{progress}/{total}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// Enhanced Empty Plate Component
const EmptyPlate: React.FC<{ mode: string }> = ({ mode }) => {
  return (
    <div className="empty-plate-container">
      <div className="empty-plate-content">
        <div className="empty-plate-icon">🍽️</div>
        <h3 className="empty-plate-title">
          {mode === 'creativo' ? '¡Tu Plato Creativo!' : '¡Sigue la Receta!'}
        </h3>
        <p className="empty-plate-subtitle">
          {mode === 'creativo' 
            ? 'Escanea ingredientes para hacer tu plato mágico'
            : 'Escanea los ingredientes de la receta uno por uno'
          }
        </p>
        <div className="empty-plate-categories">
                  {plateSections.map((section) => (
          <div key={section.key} className="category-hint">
            <span className="category-emoji">{section.emoji}</span>
            <span className="category-label">{section.label}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Fox Character Component
const FoxCharacter: React.FC<{ state: string; message: string; isAnimating: boolean; ingredientCount: number }> = ({ state, message, isAnimating, ingredientCount }) => {
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

  const getEncouragementLevel = () => {
    if (ingredientCount === 0) return 'waiting';
    if (ingredientCount < 3) return 'encourage';
    if (ingredientCount < 5) return 'excited';
    return 'cheering';
  };

  return (
    <div className={`guide-character ${getEncouragementLevel()}`}>
      <div className="fox-container">
        <span 
          className={`fox-face ${state === 'celebrate' ? 'celebrate' : ''} ${state === 'wrong' ? 'wrong' : ''} ${isAnimating ? 'bouncing' : ''}`} 
          role="img" 
          aria-label="Guía Nutricional"
        >
          {foxFaces[state as keyof typeof foxFaces]}
        </span>
        {ingredientCount > 0 && (
          <div className="ingredient-counter">
            <span className="counter-number">{ingredientCount}</span>
            <span className="counter-icon">🥗</span>
          </div>
        )}
      </div>
      <div className={`guide-text ${isTyping ? 'typing' : ''}`}>
        {isTyping ? (
          <span className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        ) : (
          currentMessage
        )}
      </div>
    </div>
  );
};

// Achievement Badge Component
const AchievementBadge: React.FC<{ type: 'first_ingredient' | 'balanced_plate' | 'recipe_master' | 'creative_chef'; isVisible: boolean }> = ({ type, isVisible }) => {
  const badges = {
    first_ingredient: { emoji: '🌱', title: '¡Primer Ingrediente!', color: '#32d74b' },
    balanced_plate: { emoji: '⚖️', title: '¡Plato Balanceado!', color: '#007aff' },
    recipe_master: { emoji: '👨‍🍳', title: '¡Maestro Chef!', color: '#ff9500' },
    creative_chef: { emoji: '🎨', title: '¡Chef Creativo!', color: '#af52de' },
  };

  const badge = badges[type];

  if (!isVisible) return null;

  return (
    <div className="achievement-badge">
      <div className="badge-icon">{badge.emoji}</div>
      <div className="badge-title" style={{ color: badge.color }}>{badge.title}</div>
    </div>
  );
};

// Enhanced Particle Effect Component
const ParticleEffect: React.FC<{ isActive: boolean; type: 'celebration' | 'sparkle' | 'achievement' }> = ({ isActive, type }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; emoji: string }>>([]);

  useEffect(() => {
    if (isActive) {
      const emojis = type === 'celebration' ? ['🎊', '🎉', '⭐', '🌟'] : 
                   type === 'achievement' ? ['🏆', '👏', '🎖️', '🥇'] : ['✨', '💫', '🌟'];
      
      const newParticles = Array.from({ length: type === 'celebration' ? 25 : 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
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
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

function getFoxState(placedCount: number, total: number, completed: boolean, wrong: boolean, isThinking: boolean = false) {
  if (wrong) return 'wrong';
  if (completed) return 'celebrate';
  if (isThinking) return 'thinking';
  if (placedCount === 0) return 'waiting';
  if (placedCount === total - 1) return 'encourage';
  if (placedCount > 0) return 'happy';
  return 'normal';
}

function getMotivationalMessage(placedCount: number, total: number, completed: boolean, wrong: boolean) {
  if (wrong) return '¡Oops! Ese ingrediente no es parte de esta receta. ¡Intenta con otro! 😊';
  if (completed) return celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
  if (placedCount === 0) return waitingMessages[Math.floor(Math.random() * waitingMessages.length)];
  if (placedCount === total - 1) return motivationalMessages[1];
  if (placedCount > 0) return motivationalMessages[Math.floor(Math.random() * (motivationalMessages.length - 2)) + 2];
  return 'Escanea los ingredientes con NFC para completar la receta. ¡Vamos a crear algo delicioso! 🍽️';
}

const addSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const winSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const wrongSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';

const GEMINI_API_KEY = 'AIzaSyCLbIaIKobsQWdCMFFnrTScXbIqeeRg4Lk';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// --- Configuración para generación de imágenes con Gemini ---
const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=TU_API_KEY_AQUI'; // Cambia TU_API_KEY_AQUI por tu clave real

// HOW_TO_PLAY moved to header - keeping for potential future use
// const HOW_TO_PLAY = [
//   '🎮 ¿Cómo jugar?',
//   '📱 Escanea los ingredientes con las tarjetas NFC', 
//   '🎨 En modo creativo: ¡Crea tu plato libremente!',
//   '🍽️ En modo tradicional: ¡Sigue la receta propuesta!',
//   '🏆 ¡Gana puntos y medallas por completar recetas!'
// ];

const NutritiousPlateGame: React.FC<NutritiousPlateGameProps> = ({ receta, ingredientes, initialMode = 'creativo' }) => {
  const { resetDish } = useArduino();
  // --- Modo de juego ---
  const [mode, setMode] = useState<'creativo' | 'tradicional'>(initialMode);
  
  // Sincronizar modo con el prop inicial
  useEffect(() => {
    if (initialMode !== mode) {
      setMode(initialMode);
      if (initialMode === 'tradicional') {
        setTradicionalPlaced([]);
        setWrongIngredient(null);
      }
    }
  }, [initialMode]);
  const [selectedRecipe, setSelectedRecipe] = useState<EcuadorianRecipe | null>(null);
  const [tradicionalPlaced, setTradicionalPlaced] = useState<string[]>([]);
  const [wrongIngredient, setWrongIngredient] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);

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

  // Achievement system
  useEffect(() => {
    const count = ingredientes.length;
    if (count === 1 && prevPlacedCount.current === 0) {
      setShowAchievement('first_ingredient');
      setTimeout(() => setShowAchievement(null), 3000);
    } else if (count === 4 && prevPlacedCount.current < 4) {
      setShowAchievement('balanced_plate');
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [ingredientes.length]);

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
    } catch {
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
      setShowAchievement('recipe_master');
      winSound.current?.play();
      setTimeout(() => setShowAchievement(null), 3000);
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

  useEffect(() => {
    if (mode === 'creativo') {
      if (placedCount > prevPlacedCount.current && !completed) {
        setShowSparkles(true);
        addSound.current?.play();
      }
      if (completed && prevPlacedCount.current !== placedCount) {
        setShowCelebration(true);
        setShowAchievement('creative_chef');
        winSound.current?.play();
        setTimeout(() => setShowAchievement(null), 3000);
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
  const [showRecipe, setShowRecipe] = useState(false);
  const [recipeSteps, setRecipeSteps] = useState<Array<{ texto: string; imagen: string; url?: string }>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState<string | null>(null);

  const handleGenerateRecipe = async () => {
    setRecipeLoading(true);
    setRecipeError(null);
    setIsThinking(true);
    setRecipeSteps([]);
    setCurrentStep(0);
    setLoadingImages(false);
    setRecipeTitle(null);
    
    const ingredientNames = ingredientes.map(f => f.name).join(', ');
    const prompt = `Dame una receta sencilla, divertida y saludable para niños pequeños usando estos ingredientes: ${ingredientNames}.
Responde SOLO con el JSON, sin explicaciones, sin texto antes o después, sin comentarios, sin formato Markdown. El JSON debe tener un campo "titulo" (nombre divertido de la receta) y un array llamado pasos, donde cada paso tiene un campo "texto" (explicación divertida y breve del paso) y un campo "imagen" (descripción visual para generar una imagen de ese paso, estilo dibujo animado, sin texto ni marcas de agua). La receta debe tener solo 3 o 4 pasos, nunca más. Ejemplo:
{
  "titulo": "Ensalada mágica de frutas",
  "pasos": [
    { "texto": "Corta la manzana en trozos pequeños 🍎", "imagen": "Niño cortando una manzana en una tabla de cocina, estilo dibujo animado" },
    { "texto": "Pon la manzana en un plato bonito", "imagen": "Plato colorido con trozos de manzana, estilo dibujo animado" }
  ]
}`;
    
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
      let pasos: Array<{ texto: string; imagen: string }> = [];
      try {
        // Extraer el bloque JSON aunque venga rodeado de texto
        let jsonText = text;
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          jsonText = match[0];
        }
        const json = JSON.parse(jsonText);
        pasos = json.pasos || [];
        setRecipeTitle(json.titulo || null);
      } catch (e) {
        setRecipeError('No se pudo procesar la receta. Intenta de nuevo.');
        setRecipeLoading(false);
        setIsThinking(false);
        setRecipeTitle(null);
        return;
      }
      // Ahora, por cada paso, pide la imagen a Gemini
      setLoadingImages(true);
      const stepsWithImages = await Promise.all(
        pasos.map(async (paso) => {
          try {
            // Petición a Gemini para generar imagen (simulado, debes poner tu endpoint y clave)
            const imgPrompt = paso.imagen;
            const imgResponse = await fetch(GEMINI_IMAGE_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  { parts: [ { text: imgPrompt } ] }
                ]
              })
            });
            const imgData = await imgResponse.json();
            // Aquí debes adaptar según la respuesta real de Gemini para imágenes
            // Por ejemplo, si devuelve una URL:
            const url = imgData?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
            // Si Gemini devuelve una URL directa, úsala. Si es base64, puedes hacer: 'data:image/png;base64,' + url
            return { ...paso, url: url ? 'data:image/png;base64,' + url : undefined };
          } catch {
            return { ...paso };
          }
        })
      );
      setRecipeSteps(stepsWithImages);
      setLoadingImages(false);
      setShowRecipe(true);
      setShowSparkles(true);
    } catch {
      setRecipeError('Ocurrió un error al generar la receta. ¡Intenta de nuevo! 🔄');
    } finally {
      setRecipeLoading(false);
      setIsThinking(false);
    }
  };

  const handleBackToIngredients = () => {
    setShowRecipe(false);
    setRecipeError(null);
    setRecipeSteps([]);
    setCurrentStep(0);
    setRecipeTitle(null);
  };

  // Cambiar el handler del botón de reinicio
  const handleRestart = async () => {
    setShowCelebration(false);
    setShowSparkles(false);
    setWrongIngredient(null);
    setShowAchievement(null);
    setShowRecipe(false);
    setRecipeError(null);
    setRecipeTitle(null);
    
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
      <ParticleEffect isActive={!!showAchievement} type="achievement" />
      {/* Achievement Badge */}
      {showAchievement && (
        <AchievementBadge 
          type={showAchievement as 'first_ingredient' | 'balanced_plate' | 'recipe_master' | 'creative_chef'} 
          isVisible={true}
        />
      )}

      {/* Header removido - ahora se maneja desde App.tsx */}

      {/* Layout principal reestructurado */}
      <div className="nutritious-plate-game main-layout">
        {/* Panel Izquierdo */}
        <div className="side-panel left-panel">
          <div className="welcome-card">
            <div className="welcome-fox">
              <FoxCharacter 
                state={foxState} 
                message={motivational} 
                isAnimating={showSparkles || showCelebration}
                ingredientCount={ingredientes.length}
              />
            </div>
            <div className="welcome-text">
              {mode === 'creativo' ? (
                <>
                  <h2 className="welcome-title creative">¡Hola, Chef!</h2>
                  <p>Agrega tu primer ingrediente para comenzar la aventura culinaria.</p>
                </>
              ) : (
                <>
                  <h2 className="welcome-title traditional">¡HOLA, PEQUE CHEF!</h2>
                  <p>¡Pon un ingrediente en el plato mágico para empezar a jugar!</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Panel Central */}
        <div className="center-panel">
          <div className="plate-area">
            <div className="plate-svg-container">
              <div className={`center-ingredient-counter${ingredientes.length === 0 ? ' counter-opacity-low' : ''}`}>
                <span className="counter-number-center">{ingredientes.length}</span>
                <span className="counter-icon-center">🥗</span>
              </div>
              {ingredientes.length === 0 ? (
                <EmptyPlate mode={mode} />
              ) : (
                <svg width="420" height="420" viewBox="0 0 420 420">
                  {(mode === 'creativo'
                    ? Array.from(new Map(ingredientes.map(f => [f.id, f])).values()).map(f => {
                        // Buscar el emoji en foods si no existe en food.image
                        return f.image ? f : foods.find(foodObj => foodObj.id === f.id) || f;
                      })
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
                      <g key={food.id + idx} className="food-section">
                        <path
                          d={pathData}
                          fill={isPlaced ? color : '#fff'}
                          stroke="#888"
                          strokeWidth="3"
                          style={{ 
                            cursor: 'default', 
                            transition: 'all 0.3s ease-in-out',
                            filter: isPlaced ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                          }}
                        />
                        <g>
                          <text
                            x={210 + 110 * Math.cos((Math.PI / 180) * (angle + 360 / total / 2))}
                            y={210 + 95 * Math.sin((Math.PI / 180) * (angle + 360 / total / 2))}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize="2.2rem"
                            style={{
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {food.image}
                          </text>
                          <text
                            x={210 + 110 * Math.cos((Math.PI / 180) * (angle + 360 / total / 2))}
                            y={210 + 120 * Math.sin((Math.PI / 180) * (angle + 360 / total / 2))}
                            textAnchor="middle"
                            alignmentBaseline="hanging"
                            fontSize="0.95rem"
                            fill="#333"
                            fontWeight="normal"
                            style={{
                              textShadow: '0 1px 2px rgba(255,255,255,0.7)',
                              fontFamily: 'Comic Neue, Fredoka One, cursive, sans-serif',
                              letterSpacing: '0.01em'
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
              )}
            </div>
          </div>
          <button className="restart-btn" onClick={handleRestart} disabled={loadingRecipe}>
            {mode === 'creativo' ? 'Reiniciar' : 'Limpiar'}
          </button>
        </div>

        {/* Panel Derecho */}
        <div className="side-panel right-panel">
          <div className="ingredients-card">
            {mode === 'creativo' ? (
              showRecipe ? (
                // Carrusel de pasos de la receta generada
                <>
                  <h2 className="ingredients-title creative">¡Tu Receta Mágica!</h2>
                  {recipeTitle && (
                    <div className="recipe-title-carrusel">{recipeTitle}</div>
                  )}
                  <p>¡Aquí tienes una receta paso a paso!</p>
                  {recipeSteps.length > 0 ? (
                    <div className="recipe-carousel">
                      <div className="recipe-step-img">
                        {loadingImages ? (
                          <div className="img-placeholder">
                            <span role="img" aria-label="Cargando imagen" style={{fontSize: '2.5rem'}}>⏳</span>
                          </div>
                        ) : recipeSteps[currentStep]?.url ? (
                          <img src={recipeSteps[currentStep].url} alt={recipeSteps[currentStep].texto} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px'}} />
                        ) : (
                          <div className="img-placeholder">
                            <span role="img" aria-label="Imagen del paso" style={{fontSize: '3rem'}}>🖼️</span>
                          </div>
                        )}
                      </div>
                      <div className="recipe-step-text">
                        {recipeSteps[currentStep].texto}
                      </div>
                      <div className="carousel-controls">
                        <button className="carousel-btn" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>&lt;</button>
                        <span className="carousel-index">Paso {currentStep + 1} de {recipeSteps.length}</span>
                        <button className="carousel-btn" onClick={() => setCurrentStep(s => Math.min(recipeSteps.length - 1, s + 1))} disabled={currentStep === recipeSteps.length - 1}>&gt;</button>
                      </div>
                    </div>
                  ) : (
                    <div className="ai-recipe-error">No se encontraron pasos en la receta.</div>
                  )}
                  <button className="ai-recipe-btn back-btn" onClick={handleBackToIngredients}>
                    ← Volver a ingredientes
                  </button>
                  {recipeError && <div className="ai-recipe-error">{recipeError}</div>}
                </>
              ) : (
                // Vista normal de ingredientes
                <>
                  <h2 className="ingredients-title creative">¡Creativo!</h2>
                  <p>Agrega ingredientes para llenar tu plato mágico.</p>
                  <div className="ingredients-list">
                    {ingredientes.map((food) => {
                      // Buscar el emoji en foods si no existe en food.image
                      const foodData = food.image ? food : foods.find(f => f.id === food.id) || food;
                      return (
                        <div key={food.id} className="ingredient-card">
                          <span className="ingredient-img">{foodData.image}</span>
                          <span className="ingredient-name">{food.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className="ai-recipe-btn" onClick={handleGenerateRecipe} disabled={ingredientes.length === 0 || recipeLoading}>
                    ¡Dame ideas!
                  </button>
                  {recipeError && <div className="ai-recipe-error">{recipeError}</div>}
                </>
              )
            ) : (
              <>
                <h2 className="ingredients-title traditional">¡Tus ingredientes!</h2>
                {selectedRecipe?.name && (
                  <div className="traditional-recipe-title">
                    <span>🍽️ <b>{selectedRecipe.name}</b></span>
                  </div>
                )}
                <p>¡Mira qué cosas ricas tienes!</p>
                <div className="ingredients-list">
                  {(selectedRecipe ? selectedRecipe.ingredients.map(id => foods.find(f => f.id === id)).filter(Boolean) as Food[] : []).map((food) => (
                    <div key={food.id} className="ingredient-card">
                      <span className="ingredient-img">{food.image}</span>
                      <span className="ingredient-name">{food.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Predictor de Salud del Plato */}
      {ingredientes.length > 0 && (
        <div className="health-predictor-container">
          <PlateHealthPredictor 
            foods={ingredientes} 
            className="health-predictor"
          />
        </div>
      )}
    </div>
  );
};

export default NutritiousPlateGame; 