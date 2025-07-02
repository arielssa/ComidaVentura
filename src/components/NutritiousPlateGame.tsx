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
  happy: '😃🦊',
  celebrate: '🎉🦊',
  encourage: '🤩🦊',
  wrong: '😮🦊',
};

const motivationalMessages = [
  '¡Sigue así! Vas muy bien.',
  '¡Solo falta un ingrediente!',
  '¡Eres un chef saludable!',
  '¡Qué plato tan colorido!',
  '¡Excelente elección!',
];

const ecuadorianRecipes: EcuadorianRecipe[] = [
  {
    name: 'Seco de Pollo',
    ingredients: ['chicken', 'carrots', 'rice', 'banana'],
  },
  {
    name: 'Encebollado',
    ingredients: ['fish', 'onion', 'banana'],
  },
  {
    name: 'Bolón de Verde',
    ingredients: ['banana', 'cheese'],
  },
  {
    name: 'Arroz con Pollo',
    ingredients: ['chicken', 'rice', 'carrots', 'peas'],
  },
  {
    name: 'Yogur con Frutas',
    ingredients: ['yogurt', 'banana', 'apple', 'berries'],
  },
];

function getFoxState(placedCount: number, total: number, completed: boolean, wrong: boolean) {
  if (wrong) return 'wrong';
  if (completed) return 'celebrate';
  if (placedCount === total - 1) return 'encourage';
  if (placedCount > 0) return 'happy';
  return 'normal';
}

function getMotivationalMessage(placedCount: number, total: number, completed: boolean, wrong: boolean) {
  if (wrong) return '¡Ese ingrediente no es parte de la receta!';
  if (completed) return '¡Felicidades! ¡Completaste la receta!';
  if (placedCount === total - 1) return motivationalMessages[1];
  if (placedCount > 0) return motivationalMessages[Math.floor(Math.random() * (motivationalMessages.length - 2)) + 2];
  return 'Escanea los ingredientes con NFC para completar la receta.';
}

const addSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const winSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const wrongSoundUrl = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3'; // Cambia por un sonido negativo real

const GEMINI_API_KEY = 'AIzaSyCLbIaIKobsQWdCMFFnrTScXbIqeeRg4Lk'; // <-- Reemplaza por tu API Key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const getAvailableRecipes = (foods: Food[]): EcuadorianRecipe[] => {
  const availableIds = foods.map(f => f.id);
  return ecuadorianRecipes.filter(recipe =>
    recipe.ingredients.every(ing => availableIds.includes(ing))
  );
};

const NutritiousPlateGame: React.FC<NutritiousPlateGameProps> = ({ receta, ingredientes }) => {
  const { resetDish } = useArduino();
  // --- Modo de juego ---
  const [mode, setMode] = useState<'creativo' | 'tradicional'>('creativo');
  const [selectedRecipe, setSelectedRecipe] = useState<EcuadorianRecipe | null>(null);
  const [tradicionalPlaced, setTradicionalPlaced] = useState<string[]>([]); // ids
  const [wrongIngredient, setWrongIngredient] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // --- Sonidos ---
  const addSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const prevPlacedCount = useRef(0);

  // --- Tradicional: pedir receta dinámica a la IA ---
  const fetchTraditionalRecipe = async () => {
    setLoadingRecipe(true);
    setRecipeError(null);
    setSelectedRecipe(null);
    setTradicionalPlaced([]);
    setWrongIngredient(null);
    // Usar los ingredientes disponibles en foods
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
      // Parsear nombre y lista de ingredientes
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('Respuesta inesperada de la IA');
      const name = lines[0];
      // Buscar los foods que coincidan con los nombres devueltos
      const ingredientFoods: Food[] = lines.slice(1).map((line: string) => {
        // Buscar por nombre exacto o similar
        return foods.find(f => f.name.toLowerCase() === line.toLowerCase() || f.name.toLowerCase().includes(line.toLowerCase()));
      }).filter(Boolean) as Food[];
      if (ingredientFoods.length < 2) throw new Error('No se encontraron suficientes ingredientes válidos');
      setSelectedRecipe({ name, ingredients: ingredientFoods.map(f => f.id) });
    } catch (err) {
      setRecipeError('No se pudo obtener una receta. Intenta de nuevo.');
    } finally {
      setLoadingRecipe(false);
    }
  };

  // --- Tradicional: pedir receta al entrar o al reiniciar ---
  useEffect(() => {
    if (mode === 'tradicional') {
      fetchTraditionalRecipe();
    }
    // eslint-disable-next-line
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
      addSound.current?.play();
    } else {
      setWrongIngredient(last.id);
      wrongSound.current?.play();
      setTimeout(() => setWrongIngredient(null), 1200);
    }
    // eslint-disable-next-line
  }, [ingredientes.length]);

  const tradicionalCompleted = selectedRecipe && tradicionalPlaced.length === (selectedRecipe?.ingredients.length || 0);

  useEffect(() => {
    if (tradicionalCompleted) winSound.current?.play();
    // eslint-disable-next-line
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
        addSound.current?.play();
      }
      if (completed && prevPlacedCount.current !== placedCount) {
        winSound.current?.play();
      }
      prevPlacedCount.current = placedCount;
    }
    // eslint-disable-next-line
  }, [placedCount, completed, mode]);

  // Fox state y mensaje
  const foxState = getFoxState(
    mode === 'creativo' ? placedCount : tradicionalPlaced.length,
    mode === 'creativo' ? plateSections.length : (selectedRecipe?.ingredients.length || 0),
    mode === 'creativo' ? completed : !!tradicionalCompleted,
    !!wrongIngredient
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
    const ingredientNames = ingredientes.map(f => f.name).join(', ');
    const prompt = `Dame una receta sencilla, divertida y saludable para niños pequeños usando estos ingredientes: ${ingredientNames}. Responde solo con la receta, en español, con pasos claros y cortos.`;
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
    } catch (err) {
      setRecipeError('Ocurrió un error al generar la receta.');
    } finally {
      setRecipeLoading(false);
    }
  };

  // Cambiar el handler del botón de reinicio
  const handleRestart = async () => {
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
      {/* Header superior centrado */}
      <div className="game-header-center">
        <div className="game-mode-selector">
          <button className={mode === 'creativo' ? 'active' : ''} onClick={() => setMode('creativo')}>Modo Creativo</button>
          <button className={mode === 'tradicional' ? 'active' : ''} onClick={() => { setMode('tradicional'); setTradicionalPlaced([]); setWrongIngredient(null); }}>Receta Tradicional</button>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(mode === 'creativo' ? ingredientes.length : (selectedRecipe?.ingredients.length || 0)) === 0 ? 0 : (mode === 'creativo' ? ingredientes.length : tradicionalPlaced.length) / (mode === 'creativo' ? ingredientes.length : (selectedRecipe?.ingredients.length || 1)) * 100}%` }}
          />
        </div>
        <div className="points-bar">
          <span className="points-label">Puntos:</span>
          <span className="points-value">{mode === 'creativo' ? ingredientes.length * 10 : tradicionalPlaced.length * 20}</span>
          {(mode === 'tradicional' && tradicionalCompleted) || (mode === 'creativo' && ingredientes.length > 0) ? <span className="points-trophy">🏆</span> : null}
        </div>
      </div>
      {/* División en dos columnas */}
      <div className="nutritious-plate-game">
        <div className="plate-column">
          <div className="guide-character">
            <span className={`fox-face${foxState === 'celebrate' ? ' celebrate' : ''}`} role="img" aria-label="Guía">
              {foxFaces[foxState as keyof typeof foxFaces]}
            </span>
            <div className="guide-text">
              {motivational}
            </div>
          </div>
          {/* Plato central (SVG) */}
          {mode === 'tradicional' && selectedRecipe && (
            <div className="traditional-recipe-title" style={{marginBottom: '8px'}}>{selectedRecipe.name}</div>
          )}
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
                    style={{ cursor: 'default', transition: 'fill 0.3s' }}
                  />
                  <g>
                    <text
                      x={210 + 110 * Math.cos((Math.PI / 180) * (angle + 360 / total / 2))}
                      y={210 + 110 * Math.sin((Math.PI / 180) * (angle + 360 / total / 2))}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize="2.8rem"
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
                    >
                      {food.name}
                    </text>
                  </g>
                </g>
              );
            })}
            <circle cx="210" cy="210" r="170" fill="none" stroke="#444" strokeWidth="6" />
          </svg>
          {(mode === 'tradicional' && tradicionalCompleted) || (mode === 'creativo' && ingredientes.length > 0) ? (
            <div className="celebration">
              <span role="img" aria-label="Estrella">🌟</span>
              <span role="img" aria-label="Confeti">🎉</span>
              <div className="medal">🏅</div>
            </div>
          ) : null}
          <button className="restart-btn" onClick={handleRestart}>Reiniciar</button>
          <div className="help-btn" title="¿Cómo jugar?">
            <span role="img" aria-label="Ayuda">❓</span>
            <div className="help-tooltip">
              Escanea los ingredientes de la receta con las tarjetas NFC. ¡Cada vez que agregues uno, el plato se colorea! Completa todos para ganar una medalla y puntos.
            </div>
          </div>
        </div>
        <div className="ingredients-column">
          <div className="ingredients-list">
            {(mode === 'creativo'
              ? ingredientes.filter((food, idx, arr) => false)
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
                <span className="ingredient-img" role="img" aria-label={food.name}>{food.image}</span>
                <div className="ingredient-name">{food.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* --- Panel de receta sugerida por IA --- */}
      {mode === 'creativo' && (
        <div className="ingredients-column">
          <button className="ai-recipe-btn" onClick={handleGenerateRecipe} disabled={ingredientes.length === 0 || recipeLoading}>
            {recipeLoading ? 'Generando receta...' : 'Sugerir receta con IA'}
          </button>
          {recipeError && <div className="ai-recipe-error">{recipeError}</div>}
          {recipeResult && (
            <div className="ai-recipe-result">
              <div className="ai-recipe-title">Receta sugerida:</div>
              <div className="ai-recipe-text">{recipeResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritiousPlateGame; 