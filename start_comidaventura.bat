@echo off
echo ====================================
echo   ComidaVentura - Iniciando Sistema
echo ====================================
echo.

:: Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado. Por favor instala Python 3.8 o superior.
    pause
    exit /b 1
)

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js.
    pause
    exit /b 1
)

echo ✅ Python y Node.js detectados correctamente
echo.

:: Verificar si las dependencias de Python están instaladas
echo 🔍 Verificando dependencias de Python...
cd ml_service
pip show flask >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando dependencias de Python...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias de Python
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias de Python ya instaladas
)
cd ..

:: Verificar si las dependencias de Node.js están instaladas
echo 🔍 Verificando dependencias de Node.js...
if not exist "node_modules" (
    echo 📦 Instalando dependencias del frontend...
    npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias del frontend
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias del frontend ya instaladas
)

if not exist "server/node_modules" (
    echo 📦 Instalando dependencias del servidor...
    cd server
    npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias del servidor
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias del servidor ya instaladas
)

echo.
echo 🚀 Iniciando servicios...
echo.

:: Crear archivo temporal para controlar el cierre
echo. > temp_running.txt

:: Iniciar servicio ML (Python)
echo 🧠 Iniciando servicio de Machine Learning...
start "ML Service" cmd /k "cd ml_service && python app.py && echo Servicio ML terminado && pause"

:: Esperar un momento para que el servicio ML inicie
timeout /t 3 /nobreak >nul

:: Iniciar servidor Node.js
echo 🌐 Iniciando servidor Node.js...
start "Node Server" cmd /k "cd server && npm start && echo Servidor Node.js terminado && pause"

:: Esperar un momento para que el servidor inicie
timeout /t 3 /nobreak >nul

:: Iniciar frontend (Vite)
echo 🎨 Iniciando frontend React...
start "Frontend" cmd /k "npm run dev && echo Frontend terminado && pause"

echo.
echo ✅ Todos los servicios se están iniciando...
echo.
echo 📝 URLs importantes:
echo    Frontend:     http://localhost:5173
echo    Servidor:     http://localhost:3001  
echo    ML Service:   http://localhost:5000
echo.
echo 🔄 Esperando a que los servicios estén listos...
timeout /t 5 /nobreak >nul

:: Verificar servicios
echo 🧪 Verificando servicios...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Servicio ML aún iniciando...
) else (
    echo ✅ Servicio ML listo
)

curl -s http://localhost:3001/api/serial/status >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Servidor Node.js aún iniciando...
) else (
    echo ✅ Servidor Node.js listo
)

echo.
echo 🎉 ComidaVentura está listo!
echo.
echo 📚 Instrucciones:
echo    1. Abre tu navegador en http://localhost:5173
echo    2. Si es la primera vez, haz clic en "Entrenar" en el panel de IA
echo    3. ¡Disfruta creando platos saludables!
echo.
echo ⚠️  Para detener todos los servicios, cierra esta ventana
echo.

:: Mantener la ventana abierta
echo Presiona cualquier tecla para abrir el navegador automáticamente...
pause >nul

:: Abrir navegador
start http://localhost:5173

echo.
echo 🌟 ¡Disfruta ComidaVentura!
echo.
echo Para detener todos los servicios, simplemente cierra esta ventana.
pause 