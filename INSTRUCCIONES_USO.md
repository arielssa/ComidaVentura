# 🚀 Instrucciones de Uso - ComidaVentura con IA

## ✅ Problema Resuelto

Hemos corregido el error **"can't access property calories, food.nutrition is undefined"**. Ahora el sistema maneja correctamente alimentos que vienen de diferentes fuentes (Arduino, modo creativo, etc.).

## 🎯 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# Haz doble clic en el archivo batch
start_comidaventura.bat
```

### Opción 2: Inicio Manual
```bash
# Terminal 1 - Servicio ML (usa tu modelo model.h5 existente)
cd ml_service
python app.py

# Terminal 2 - Servidor Node.js
cd server  
npm start

# Terminal 3 - Frontend
npm run dev
```

## 🎮 Cómo Usar el Predictor de Salud

### 1. **Modo Creativo**
1. Selecciona **"Creativo"** en el modo de juego
2. Agrega alimentos haciendo clic en los disponibles
3. **Automáticamente aparecerá** el panel de predicción de IA
4. Haz clic en **"¿Qué tan saludable es mi plato?"**
5. Recibe tu análisis con recomendaciones

### 2. **Modo Arduino (Hardware)**
1. Conecta tu Arduino al puerto USB
2. Los alimentos escaneados aparecerán automáticamente
3. El predictor funcionará con la información disponible
4. Las predicciones serán menos precisas pero funcionales

### 3. **Modo Tradicional**
1. Selecciona **"Tradicional"**
2. Elige una receta ecuatoriana
3. Agrega los ingredientes correctos
4. Usa el predictor para evaluar la receta completa

## 🧠 Información del Modelo IA

### **Tu Modelo Actual**
- ✅ **Ubicación**: `C:\Users\USUARIO\Desktop\ComidaVentura-1\ml_service\model.h5`
- ✅ **Estado**: Detectado automáticamente
- ✅ **Tipo**: Red Neuronal entrenada
- ✅ **No necesitas entrenar de nuevo**

### **Clasificaciones Disponibles**
- 🌟 **Muy Saludable** - Plato perfectamente balanceado
- ✅ **Saludable** - Buena opción nutricional  
- ⚠️ **Moderadamente Saludable** - Puede mejorar
- ❌ **Poco Saludable** - Necesita más alimentos nutritivos

## 🔧 Correcciones Realizadas

### **1. Manejo Robusto de Datos**
- ✅ El sistema ahora maneja alimentos sin `nutrition` completa
- ✅ Usa `actualCalories` de Arduino cuando está disponible
- ✅ Aplica valores por defecto cuando faltan datos
- ✅ No hay más errores de "undefined"

### **2. Información Nutricional Completa**
- ✅ Actualizado `foodMapping` en el servidor con datos completos
- ✅ Alimentos de Arduino ahora tienen información nutricional
- ✅ Predicciones más precisas para todos los modos

### **3. Validaciones Mejoradas**
- ✅ Verificación automática de datos disponibles
- ✅ Mensajes de advertencia informativos
- ✅ Manejo de errores más robusto

## 🎯 URLs del Sistema

Cuando todos los servicios estén corriendo:
- **Frontend**: http://localhost:5173
- **Servidor Node.js**: http://localhost:3001
- **Servicio ML**: http://localhost:5000

## 🐛 Verificar que Todo Funciona

### **1. Servicio ML**
```bash
# Verificar estado
curl http://localhost:5000/health
# Debe responder: {"status": "healthy", "service": "ComidaVentura ML Service"}
```

### **2. Servidor Node.js**
```bash
# Verificar estado ML
curl http://localhost:3001/api/ml/status
# Debe mostrar información del servicio ML
```

### **3. Frontend**
1. Abre http://localhost:5173
2. Selecciona modo "Creativo"
3. Agrega alimentos (ej: Pollo, Brócoli, Manzana)
4. Debe aparecer el botón **"¿Qué tan saludable es mi plato?"**
5. Haz clic y verifica que aparece la predicción

## 📋 Solución de Problemas

### **Error: "Servicio ML no disponible"**
```bash
# 1. Verificar Python
python --version

# 2. Reinstalar dependencias
cd ml_service
pip install -r requirements.txt

# 3. Ejecutar manualmente
python app.py
```

### **Error: "No se puede conectar Arduino"**
1. Verifica que Arduino esté conectado al USB
2. En Windows: Device Manager → Ports (COM & LPT)
3. Anota el puerto (ej: COM4)
4. En la aplicación: Configuración → Cambiar puerto

### **Error: "Puerto en uso"**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux  
lsof -i :3001
kill -9 <PID>
```

## 🎉 Prueba Completa del Sistema

### **Test 1: Modo Creativo**
1. Inicia todos los servicios
2. Abre http://localhost:5173
3. Modo "Creativo" → Agrega: Pollo + Brócoli + Manzana
4. Clic en "¿Qué tan saludable es mi plato?"
5. **Resultado esperado**: "Muy Saludable" o "Saludable"

### **Test 2: Plato No Saludable**
1. Agrega: Papas Fritas + Pan Blanco + Queso
2. Clic en predicción
3. **Resultado esperado**: "Poco Saludable" o "Moderadamente Saludable"

### **Test 3: Arduino (si tienes hardware)**
1. Conecta Arduino
2. Escanea alimentos
3. Verifica que aparecen en el plato
4. Usa el predictor
5. **Resultado esperado**: Predicción basada en calorías básicas

## 🚀 **¡Listo para Usar!**

Tu sistema ComidaVentura ahora tiene:
- ✅ **IA integrada** con tu modelo existente
- ✅ **Predicciones robustas** sin errores
- ✅ **Múltiples modos** de uso
- ✅ **Interfaz educativa** y divertida

### **Próximos Pasos**
1. Ejecuta `start_comidaventura.bat`
2. Experimenta con diferentes combinaciones de alimentos
3. Observa cómo la IA califica tus platos
4. ¡Aprende sobre nutrición de manera divertida!

---

**🌟 ¡Disfruta tu aventura nutricional con ComidaVentura! 🌟** 