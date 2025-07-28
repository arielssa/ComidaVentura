# 🍽️ ComidaVentura - Aventura Nutricional con IA

ComidaVentura es una aplicación educativa interactiva que enseña nutrición a través del juego, con integración de **Inteligencia Artificial** para predecir qué tan saludables son los platos creados por los usuarios.

![ComidaVentura Banner](https://img.shields.io/badge/ComidaVentura-Nutrici%C3%B3n%20con%20IA-brightgreen?style=for-the-badge&logo=react)

## 🌟 Características Principales

### 🎮 Juego Interactivo
- **Modo Creativo**: Crea platos libremente y experimenta
- **Modo Tradicional**: Aprende recetas ecuatorianas auténticas
- **Interfaz amigable**: Diseño colorido y atractivo para niños
- **Gamificación**: Sistema de puntos y logros

### 🧠 Inteligencia Artificial
- **Predicción en tiempo real**: Análisis automático de la salud nutricional
- **Múltiples modelos ML**: Red Neuronal, KNN, SVM
- **Recomendaciones personalizadas**: Consejos adaptativos según el plato
- **Clasificación nutricional**: 4 niveles de salud con feedback visual

### 🔗 Integración con Hardware
- **Arduino compatible**: Conexión con sensores físicos
- **Scanner simulado**: Detección virtual de alimentos
- **WebSocket en tiempo real**: Comunicación bidireccional
- **Soporte multi-plataforma**: Windows, macOS, Linux

## 📋 Requisitos del Sistema

### Software Necesario
- **Node.js** 18.0 o superior
- **Python** 3.8 o superior
- **npm** o **yarn**
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

### Hardware Opcional
- **Arduino Uno/Nano** para sensores físicos
- **Puerto USB** disponible
- **Sensores de peso** (opcional)

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Windows)
```bash
# Simplemente ejecuta el archivo batch
double-click start_comidaventura.bat
```

### Opción 2: Instalación Manual

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ComidaVentura-1.git
cd ComidaVentura-1
```

#### 2. Instalar dependencias del frontend
```bash
npm install
```

#### 3. Instalar dependencias del servidor
```bash
cd server
npm install
cd ..
```

#### 4. Instalar dependencias de Python (ML)
```bash
cd ml_service
pip install -r requirements.txt
cd ..
```

## 🎯 Inicio Rápido

### 1. Iniciar todos los servicios

**Terminal 1 - Servicio de IA:**
```bash
cd ml_service
python app.py
```

**Terminal 2 - Servidor Backend:**
```bash
cd server
npm start
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

### 2. Acceder a la aplicación
Abre tu navegador en: `http://localhost:5173`

### 3. Primera configuración
1. **Entrenar IA**: Haz clic en "🏋️ Entrenar" en el panel de IA
2. **Esperar entrenamiento**: El proceso toma 2-3 minutos
3. **¡Listo!**: Comienza a crear platos saludables

## 🎮 Cómo Usar ComidaVentura

### Modo Creativo 🎨
1. Selecciona "Creativo" en el modo de juego
2. Agrega alimentos a tu plato virtual
3. Haz clic en **"¿Qué tan saludable es mi plato?"**
4. Recibe feedback instantáneo con recomendaciones
5. Experimenta con diferentes combinaciones

### Modo Tradicional 🇪🇨
1. Selecciona "Tradicional"
2. Elige una receta ecuatoriana
3. Agrega los ingredientes correctos
4. Aprende sobre la cultura culinaria local
5. Obtén puntos por completar recetas

### Panel de IA 🧠
- **Predicción automática**: Se activa al cambiar alimentos
- **Modelos disponibles**: Red Neuronal (recomendado), KNN, SVM
- **Clasificaciones**:
  - 🌟 **Muy Saludable**: Plato perfectamente balanceado
  - ✅ **Saludable**: Buena opción nutricional
  - ⚠️ **Moderadamente Saludable**: Puede mejorar
  - ❌ **Poco Saludable**: Necesita más alimentos nutritivos

## 🏗️ Arquitectura del Sistema

```
ComidaVentura/
├── 🎨 Frontend (React + TypeScript)
│   ├── src/components/          # Componentes UI
│   ├── src/hooks/              # Hooks personalizados
│   └── src/types/              # Definiciones TypeScript
├── 🌐 Backend (Node.js + Express)
│   ├── server.js               # Servidor principal
│   └── Arduino integration     # Comunicación serial
├── 🧠 ML Service (Python + Flask)
│   ├── app.py                  # API de ML
│   ├── nutrition_model.py      # Modelos de IA
│   └── comidaventura_dataset.csv # Datos de entrenamiento
└── 📱 Arduino (Opcional)
    └── Sensores físicos
```

## 🔧 Configuración Avanzada

### Variables de Entorno
Crea un archivo `.env` en la raíz:
```env
# Puerto del frontend
VITE_PORT=5173

# Puerto del servidor
SERVER_PORT=3001

# Puerto del servicio ML
ML_SERVICE_PORT=5000

# Puerto serie Arduino (Windows)
ARDUINO_PORT=COM4

# Puerto serie Arduino (macOS/Linux)
ARDUINO_PORT=/dev/ttyUSB0
```

### Configuración de Arduino
```cpp
// Código ejemplo para Arduino
void setup() {
  Serial.begin(9600);
}

void loop() {
  // Enviar datos de sensores
  Serial.println("Added: Chicken (165 calories)");
  delay(1000);
}
```

## 📊 Modelos de Machine Learning

### Red Neuronal (Recomendado)
- **Arquitectura**: 32 → 16 → 8 → 4 neuronas
- **Precisión**: ~85-90%
- **Tiempo de predicción**: <100ms
- **Uso**: Análisis general de platos

### K-Nearest Neighbors (KNN)
- **Vecinos**: 5
- **Precisión**: ~80-85%
- **Ventaja**: Interpretable y rápido
- **Uso**: Comparación con platos similares

### Support Vector Machine (SVM)
- **Kernel**: RBF
- **Precisión**: ~75-80%
- **Ventaja**: Robusto con datos pequeños
- **Uso**: Clasificación binaria saludable/no saludable

## 📈 Dataset Nutricional

El sistema incluye un dataset con 60+ alimentos caracterizados por:
- **Calorías**: Energía total por porción
- **Proteínas**: Contenido proteico (g)
- **Carbohidratos**: Contenido de carbohidratos (g)
- **Grasas**: Contenido de grasas (g)
- **Fibra**: Contenido de fibra (g)
- **Azúcar**: Contenido de azúcar (g)

## 🛠️ Desarrollo

### Estructura de Componentes
```typescript
// Ejemplo de uso del hook de ML
import { useMLService } from '../hooks/useMLService';

const MyComponent = () => {
  const { predictDishHealth, isLoading, lastPrediction } = useMLService();
  
  const handlePredict = async () => {
    const result = await predictDishHealth(foods, 'neural');
    console.log(result); // Resultado de la predicción
  };
};
```

### API del Servicio ML
```bash
# Verificar estado
GET http://localhost:5000/health

# Entrenar modelos
POST http://localhost:5000/train

# Hacer predicción
POST http://localhost:5000/predict
Content-Type: application/json
{
  "foods": [{"calories": 165, "protein": 31, ...}],
  "model_type": "neural"
}
```

## 🐛 Solución de Problemas

### Error: "Servicio ML no disponible"
```bash
# Verificar que Python esté instalado
python --version

# Reinstalar dependencias
cd ml_service
pip install -r requirements.txt

# Iniciar servicio manualmente
python app.py
```

### Error: "Arduino no conectado"
```bash
# Windows: Verificar puerto COM
# Device Manager → Ports (COM & LPT)

# macOS/Linux: Listar puertos
ls /dev/tty*
```

### Error: "Puerto en uso"
```bash
# Windows: Encontrar proceso usando puerto
netstat -ano | findstr :3001

# macOS/Linux: Encontrar proceso
lsof -i :3001

# Terminar proceso
taskkill /PID <PID> /F  # Windows
kill -9 <PID>          # macOS/Linux
```

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev          # Frontend en localhost:5173
npm run server       # Backend en localhost:3001
python ml_service/app.py  # ML en localhost:5000
```

### Producción
```bash
npm run build        # Construir frontend
npm run preview      # Vista previa de producción
```

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crea** un Pull Request

### Estándares de Código
- **ESLint** para JavaScript/TypeScript
- **Prettier** para formateo
- **Black** para Python
- **Conventional Commits** para mensajes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **React Team** por el framework
- **TensorFlow** por las herramientas de ML
- **Arduino Community** por el soporte de hardware
- **Nutrition Data** providers

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/ComidaVentura-1/issues)
- **Email**: soporte@comidaventura.com
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/ComidaVentura-1/wiki)

---

<div align="center">

**🌟 ¡Hecho con ❤️ para la educación nutricional! 🌟**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white)](https://arduino.cc/)

</div> 