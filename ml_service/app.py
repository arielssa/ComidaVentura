from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from nutrition_model import NutritionModel
import os
import threading
import time
import json
import subprocess

app = Flask(__name__)

# Configuración CORS más específica
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'], 
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)

# Instancia global del modelo
nutrition_model = NutritionModel()

# Variable para controlar el estado del entrenamiento
training_status = {'status': 'not_started', 'progress': 0, 'message': ''}

@app.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint para verificar el estado del servicio
    """
    return jsonify({
        'status': 'healthy',
        'service': 'ComidaVentura ML Service',
        'version': '1.0.0'
    })

@app.route('/train', methods=['POST'])
def train_models():
    """
    Endpoint para entrenar los modelos de ML
    """
    global training_status
    
    if training_status['status'] == 'training':
        return jsonify({
            'error': 'El entrenamiento ya está en progreso',
            'status': training_status
        }), 400
    
    # Iniciar entrenamiento en hilo separado
    def train_thread():
        global training_status
        training_status = {'status': 'training', 'progress': 0, 'message': 'Iniciando entrenamiento...'}
        
        try:
            training_status['message'] = 'Cargando datos...'
            training_status['progress'] = 10
            
            # Entrenar modelos
            training_status['message'] = 'Entrenando modelos...'
            training_status['progress'] = 30
            
            success = nutrition_model.train_all_models()
            
            if success:
                training_status['message'] = 'Cargando modelos entrenados...'
                training_status['progress'] = 80
                
                # Cargar modelos después del entrenamiento
                nutrition_model.load_models()
                
                training_status = {
                    'status': 'completed',
                    'progress': 100,
                    'message': 'Entrenamiento completado exitosamente'
                }
            else:
                training_status = {
                    'status': 'failed',
                    'progress': 0,
                    'message': 'Error durante el entrenamiento'
                }
                
        except Exception as e:
            training_status = {
                'status': 'failed',
                'progress': 0,
                'message': f'Error: {str(e)}'
            }
    
    # Iniciar hilo de entrenamiento
    thread = threading.Thread(target=train_thread)
    thread.start()
    
    return jsonify({
        'message': 'Entrenamiento iniciado',
        'status': training_status
    })

@app.route('/training-status', methods=['GET'])
def get_training_status():
    """
    Endpoint para obtener el estado del entrenamiento
    """
    return jsonify(training_status)

@app.route('/predict', methods=['POST'])
def predict_dish():
    """
    Endpoint para predecir la clasificación nutricional de un plato
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        # Verificar si los modelos están cargados
        if nutrition_model.neural_network is None:
            print("🔄 Modelos no encontrados, iniciando entrenamiento automático...")
            if not nutrition_model.load_models():
                # Si load_models retorna False, necesitamos entrenar
                print("🔄 Entrenando modelos automáticamente...")
                try:
                    success = nutrition_model.train_all_models()
                    if not success:
                        return jsonify({
                            'error': 'Error al entrenar los modelos automáticamente'
                        }), 500
                    print("✅ Modelos entrenados exitosamente")
                except Exception as e:
                    return jsonify({
                        'error': f'Error durante el entrenamiento automático: {str(e)}'
                    }), 500
        
        # Obtener tipo de modelo (por defecto neural)
        model_type = data.get('model_type', 'neural')
        
        if 'nutrition' in data:
            # Predicción basada en datos nutricionales directos
            nutrition_data = data['nutrition']
            prediction = nutrition_model.predict_dish_health(nutrition_data, model_type)
            
        elif 'foods' in data:
            # Predicción basada en lista de alimentos
            foods = data['foods']
            prediction = nutrition_model.predict_from_food_list(foods, model_type)
            
        else:
            return jsonify({
                'error': 'Debe proporcionar "nutrition" o "foods" en la petición'
            }), 400
        
        return jsonify({
            'prediction': prediction,
            'timestamp': time.time()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error en la predicción: {str(e)}'
        }), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """
    Endpoint para predecir múltiples platos
    """
    try:
        data = request.json
        
        if not data or 'dishes' not in data:
            return jsonify({'error': 'Debe proporcionar una lista de "dishes"'}), 400
        
        # Verificar si los modelos están cargados
        if nutrition_model.neural_network is None:
            print("🔄 Modelos no encontrados, iniciando entrenamiento automático...")
            if not nutrition_model.load_models():
                # Si load_models retorna False, necesitamos entrenar
                print("🔄 Entrenando modelos automáticamente...")
                try:
                    success = nutrition_model.train_all_models()
                    if not success:
                        return jsonify({
                            'error': 'Error al entrenar los modelos automáticamente'
                        }), 500
                    print("✅ Modelos entrenados exitosamente")
                except Exception as e:
                    return jsonify({
                        'error': f'Error durante el entrenamiento automático: {str(e)}'
                    }), 500
        
        dishes = data['dishes']
        model_type = data.get('model_type', 'neural')
        predictions = []
        
        for i, dish in enumerate(dishes):
            try:
                if 'nutrition' in dish:
                    prediction = nutrition_model.predict_dish_health(dish['nutrition'], model_type)
                elif 'foods' in dish:
                    prediction = nutrition_model.predict_from_food_list(dish['foods'], model_type)
                else:
                    prediction = {
                        'classification': 'Error',
                        'confidence': 0.0,
                        'error': 'Formato de datos inválido'
                    }
                
                predictions.append({
                    'dish_index': i,
                    'prediction': prediction
                })
                
            except Exception as e:
                predictions.append({
                    'dish_index': i,
                    'prediction': {
                        'classification': 'Error',
                        'confidence': 0.0,
                        'error': str(e)
                    }
                })
        
        return jsonify({
            'predictions': predictions,
            'timestamp': time.time()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error en la predicción batch: {str(e)}'
        }), 500

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """
    Endpoint para obtener información sobre los modelos
    """
    try:
        # Verificar si los modelos están cargados
        models_loaded = {
            'neural_network': nutrition_model.neural_network is not None,
            'knn_model': nutrition_model.knn_model is not None,
            'svm_model': nutrition_model.svm_model is not None,
            'label_encoder': nutrition_model.label_encoder is not None,
            'scaler': nutrition_model.scaler is not None
        }
        
        # Obtener clases disponibles si el label_encoder está cargado
        available_classes = None
        if nutrition_model.label_encoder is not None:
            available_classes = nutrition_model.label_encoder.classes_.tolist()
        
        # Verificar si existen archivos de modelos
        model_files = {}
        if os.path.exists(nutrition_model.model_path):
            model_files = {
                'neural_network.h5': os.path.exists(os.path.join(nutrition_model.model_path, 'neural_network.h5')),
                'knn_model.pkl': os.path.exists(os.path.join(nutrition_model.model_path, 'knn_model.pkl')),
                'svm_model.pkl': os.path.exists(os.path.join(nutrition_model.model_path, 'svm_model.pkl')),
                'label_encoder.pkl': os.path.exists(os.path.join(nutrition_model.model_path, 'label_encoder.pkl')),
                'scaler.pkl': os.path.exists(os.path.join(nutrition_model.model_path, 'scaler.pkl'))
            }
        
        return jsonify({
            'models_loaded': models_loaded,
            'model_files': model_files,
            'available_classes': available_classes,
            'model_path': nutrition_model.model_path,
            'training_status': training_status
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error obteniendo información del modelo: {str(e)}'
        }), 500

@app.route('/load-models', methods=['POST'])
def load_models():
    """
    Endpoint para cargar modelos entrenados
    """
    try:
        success = nutrition_model.load_models()
        
        if success:
            return jsonify({
                'message': 'Modelos cargados exitosamente',
                'models_loaded': True
            })
        else:
            return jsonify({
                'error': 'Error al cargar los modelos',
                'models_loaded': False
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': f'Error cargando modelos: {str(e)}'
        }), 500

@app.route('/save-emotions', methods=['POST', 'OPTIONS'])
def save_emotions():
    """
    Recibe un array de emociones, lo guarda como JSON y genera una gráfica en emotion_results
    """
    # Manejar peticiones OPTIONS (preflight)
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        print("=== RECIBIENDO PETICIÓN DE EMOCIONES ===")
        data = request.get_json()
        print(f"Datos recibidos: {data}")
        
        emotions = data.get('emotions')
        if not emotions or not isinstance(emotions, list):
            print("❌ Error: No se recibieron emociones válidas")
            return jsonify({'error': 'No se recibieron emociones válidas'}), 400

        print(f"✅ {len(emotions)} emociones recibidas correctamente")

        # Crear carpeta de resultados si no existe
        results_dir = os.path.join(os.path.dirname(__file__), '../FaceExpressionRecognition/emotion_results')
        os.makedirs(results_dir, exist_ok=True)
        print(f"📁 Directorio de resultados: {results_dir}")

        # Guardar JSON con timestamp
        import datetime
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        json_path = os.path.join(results_dir, f'emotions_{timestamp}.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(emotions, f, ensure_ascii=False)
        print(f"✅ JSON guardado en: {json_path}")

        # Llamar al script de graficado
        output_path = os.path.join(results_dir, f'graph_{timestamp}.png')
        print(f"📊 Generando gráfica en: {output_path}")
        
        try:
            subprocess.run([
                'python',
                os.path.join(os.path.dirname(__file__), '../FaceExpressionRecognition/draw_expressions.py'),
                json_path,
                output_path
            ], check=True)
            print("✅ Gráfica generada exitosamente")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error generando gráfica: {e}")
            # Continúa aunque falle la gráfica

        result = {
            'message': 'Emociones y gráfica guardadas',
            'json': json_path,
            'graph': output_path,
            'count': len(emotions),
            'timestamp': timestamp
        }
        print(f"✅ Proceso completado: {result}")
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error general: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'available_endpoints': [
            '/health',
            '/train',
            '/training-status',
            '/predict',
            '/predict-batch',
            '/model-info',
            '/load-models'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Error interno del servidor',
        'message': str(error)
    }), 500

if __name__ == '__main__':
    print("🚀 Iniciando ComidaVentura ML Service...")
    print("📊 Intentando cargar modelos existentes...")
    
    # Intentar cargar modelos al inicio
    try:
        if nutrition_model.load_models():
            print("✅ Modelos cargados exitosamente")
        else:
            print("⚠️  No se encontraron modelos entrenados")
            print("� Iniciando entrenamiento automático...")
            try:
                success = nutrition_model.train_all_models()
                if success:
                    print("✅ Modelos entrenados automáticamente")
                else:
                    print("❌ Error en el entrenamiento automático")
            except Exception as train_error:
                print(f"❌ Error durante el entrenamiento: {train_error}")
                print("�💡 Usa el endpoint /train para entrenar manualmente")
    except Exception as e:
        print(f"⚠️  Error al cargar modelos: {e}")
        print("💡 Usa el endpoint /train para entrenar los modelos")
    
    # Iniciar servidor Flask
    app.run(host='0.0.0.0', port=5000, debug=True) 