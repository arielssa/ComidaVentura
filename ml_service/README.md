# ComidaVentura ML Service

Servicio de Machine Learning para predecir la clasificación nutricional de platos en el proyecto ComidaVentura.

## Características

- **Múltiples modelos de ML**: Red Neuronal, KNN, y SVM
- **Predicción en tiempo real**: Análisis instantáneo de platos
- **API REST**: Endpoints fáciles de usar
- **Entrenamiento automático**: Capacidad de reentrenar modelos
- **Interfaz web integrada**: Panel de control en el frontend

## Instalación

### Requisitos previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Instalación de dependencias

```bash
cd ml_service
pip install -r requirements.txt
```

### Estructura de archivos

```
ml_service/
├── app.py                      # Servidor Flask principal
├── nutrition_model.py          # Clases y funciones del modelo ML
├── comidaventura_dataset.csv   # Dataset de entrenamiento
├── requirements.txt            # Dependencias de Python
├── models/                     # Directorio para modelos entrenados
│   ├── neural_network.h5
│   ├── knn_model.pkl
│   ├── svm_model.pkl
│   ├── label_encoder.pkl
│   └── scaler.pkl
└── README.md                   # Este archivo
```

## Uso

### 1. Iniciar el servicio

```bash
python app.py
```

El servicio estará disponible en `http://localhost:5000`

### 2. Verificar el estado del servicio

```bash
curl http://localhost:5000/health
```

### 3. Entrenar los modelos (primera vez)

```bash
curl -X POST http://localhost:5000/train
```

### 4. Hacer predicciones

#### Predicción basada en valores nutricionales

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "nutrition": {
      "calories": 200,
      "protein": 15,
      "carbs": 25,
      "fat": 8,
      "fiber": 3,
      "sugar": 5
    },
    "model_type": "neural"
  }'
```

#### Predicción basada en lista de alimentos

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "foods": [
      {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0, "sugar": 0},
      {"calories": 34, "protein": 3, "carbs": 7, "fat": 0.4, "fiber": 2.6, "sugar": 1.5}
    ],
    "model_type": "neural"
  }'
```

## API Endpoints

### GET /health
Verifica el estado del servicio.

**Respuesta:**
```json
{
  "status": "healthy",
  "service": "ComidaVentura ML Service",
  "version": "1.0.0"
}
```

### POST /train
Inicia el entrenamiento de todos los modelos.

**Respuesta:**
```json
{
  "message": "Entrenamiento iniciado",
  "status": {
    "status": "training",
    "progress": 0,
    "message": "Iniciando entrenamiento..."
  }
}
```

### GET /training-status
Obtiene el estado actual del entrenamiento.

**Respuesta:**
```json
{
  "status": "completed",
  "progress": 100,
  "message": "Entrenamiento completado exitosamente"
}
```

### POST /predict
Predice la clasificación nutricional de un plato.

**Parámetros:**
- `nutrition`: Objeto con valores nutricionales directos
- `foods`: Array de alimentos con sus valores nutricionales
- `model_type`: Tipo de modelo a usar ("neural", "knn", "svm")

**Respuesta:**
```json
{
  "prediction": {
    "classification": "Saludable",
    "confidence": 0.85,
    "model_used": "neural"
  },
  "timestamp": 1703123456.789
}
```

### GET /model-info
Obtiene información sobre los modelos cargados.

**Respuesta:**
```json
{
  "models_loaded": {
    "neural_network": true,
    "knn_model": true,
    "svm_model": true,
    "label_encoder": true,
    "scaler": true
  },
  "available_classes": ["Muy Saludable", "Saludable", "Moderadamente Saludable", "Poco Saludable"],
  "model_path": "models/"
}
```

## Integración con el Frontend

El servicio está integrado con el frontend de ComidaVentura a través del servidor Node.js. Los endpoints están disponibles en:

- `http://localhost:3001/api/ml/status`
- `http://localhost:3001/api/ml/train`
- `http://localhost:3001/api/ml/predict`
- `http://localhost:3001/api/ml/predict-current`

## Clasificaciones Nutricionales

El modelo puede predecir las siguientes clasificaciones:

1. **Muy Saludable** 🌟 - Alimentos muy nutritivos y balanceados
2. **Saludable** ✅ - Alimentos generalmente buenos para la salud
3. **Moderadamente Saludable** ⚠️ - Alimentos que deben consumirse con moderación
4. **Poco Saludable** ❌ - Alimentos que deben limitarse en la dieta

## Configuración del Dataset

El dataset incluye las siguientes características:
- **Calorías**: Energía total del alimento
- **Proteínas**: Contenido proteico (g)
- **Carbohidratos**: Contenido de carbohidratos (g)
- **Grasas**: Contenido de grasas (g)
- **Fibra**: Contenido de fibra (g)
- **Azúcar**: Contenido de azúcar (g)

## Modelos Disponibles

### Red Neuronal
- Arquitectura: 32 → 16 → 8 → 4 neuronas
- Función de activación: ReLU (capas ocultas), Softmax (salida)
- Optimizador: Adam
- Función de pérdida: Categorical Crossentropy

### K-Nearest Neighbors (KNN)
- Vecinos: 5
- Métrica: Euclidiana

### Support Vector Machine (SVM)
- Kernel: RBF (Radial Basis Function)
- Regularización: C=1.0

## Solución de Problemas

### Error: "Los modelos no están entrenados"
1. Ejecuta el endpoint de entrenamiento: `POST /train`
2. Espera a que el entrenamiento termine
3. Verifica el estado con: `GET /training-status`

### Error: "ML service is not responding"
1. Verifica que el servicio Python esté ejecutándose
2. Revisa los logs en la consola
3. Verifica que el puerto 5000 esté disponible

### Error: "Error al cargar modelos"
1. Verifica que existan los archivos de modelos en `/models/`
2. Ejecuta el entrenamiento nuevamente
3. Verifica los permisos del directorio

## Desarrollo

### Agregar nuevos datos de entrenamiento

1. Modifica `comidaventura_dataset.csv`
2. Ejecuta el reentrenamiento: `POST /train`
3. Verifica la precisión del modelo

### Agregar nuevos modelos

1. Modifica `nutrition_model.py`
2. Agrega las funciones de entrenamiento y predicción
3. Actualiza los endpoints en `app.py`

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza las pruebas correspondientes
4. Envía un pull request

## Licencia

Este proyecto es parte de ComidaVentura y está bajo la misma licencia del proyecto principal. 