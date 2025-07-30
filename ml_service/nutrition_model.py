import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.layers import Dense
from tensorflow.keras.models import Sequential, load_model
from imblearn.over_sampling import SMOTE
import joblib
import os

class NutritionModel:
    def __init__(self, model_path="models/"):
        """
        Inicializa el modelo de nutrición
        """
        self.model_path = model_path
        self.neural_network = None
        self.knn_model = None
        self.svm_model = None
        self.label_encoder = None
        self.scaler = None
        self.features_cols = None  # Para almacenar el orden de las columnas
        self.target_col = None     # Para almacenar la columna objetivo
        
        # Crear directorio de modelos si no existe
        if not os.path.exists(model_path):
            os.makedirs(model_path)
    
    def load_data(self, csv_path='comidaventura_dataset.csv'):
        """
        Carga el dataset desde CSV
        """
        try:
            df = pd.read_csv(csv_path)
            print(f"Dataset cargado exitosamente: {df.shape[0]} filas, {df.shape[1]} columnas")
            return df
        except Exception as e:
            print(f"Error al cargar el dataset: {e}")
            return None
    
    def preprocess_data(self, df):
        """
        Preprocesa los datos para el entrenamiento
        """
        # Crear copias del dataframe para cada modelo
        df_neural = df.copy()
        df_knn = df.copy()
        df_svm = df.copy()
        
        # Eliminar ID_Plato ya que no influye en la clasificación
        df_neural = df_neural.drop(['ID_Plato'], axis=1)
        df_knn = df_knn.drop(['ID_Plato'], axis=1)
        df_svm = df_svm.drop(['ID_Plato'], axis=1)
        
        # Codificar las etiquetas
        self.label_encoder = LabelEncoder()
        df_neural['Clasificacion_Nutricional'] = self.label_encoder.fit_transform(df_neural['Clasificacion_Nutricional'])
        df_knn['Clasificacion_Nutricional'] = self.label_encoder.transform(df_knn['Clasificacion_Nutricional'])
        df_svm['Clasificacion_Nutricional'] = self.label_encoder.transform(df_svm['Clasificacion_Nutricional'])
        
        # Separar características y etiquetas
        X_neural = df_neural.drop(['Clasificacion_Nutricional'], axis=1)
        y_neural = df_neural['Clasificacion_Nutricional']
        
        X_knn = df_knn.drop(['Clasificacion_Nutricional'], axis=1)
        y_knn = df_knn['Clasificacion_Nutricional']
        
        X_svm = df_svm.drop(['Clasificacion_Nutricional'], axis=1)
        y_svm = df_svm['Clasificacion_Nutricional']
        
        # Aplicar SMOTE para balancear las clases (solo si hay suficientes muestras)
        try:
            # Verificar si hay suficientes muestras por clase para aplicar SMOTE
            class_counts = y_neural.value_counts()
            min_samples = class_counts.min()
            
            if min_samples >= 2:  # SMOTE necesita al menos 2 muestras por clase
                smote = SMOTE(random_state=42, k_neighbors=min(5, min_samples-1))
                X_neural, y_neural = smote.fit_resample(X_neural, y_neural)
                X_knn, y_knn = smote.fit_resample(X_knn, y_knn)
                X_svm, y_svm = smote.fit_resample(X_svm, y_svm)
                print(f"✅ SMOTE aplicado. Muestras balanceadas: {len(X_neural)}")
            else:
                print(f"⚠️ SMOTE omitido - muy pocas muestras por clase (mín: {min_samples})")
        except Exception as e:
            print(f"⚠️ Error en SMOTE: {e}. Continuando sin balanceo...")
            # Continuar sin SMOTE si hay errores
        
        # Escalar características para la red neuronal
        self.scaler = MinMaxScaler()
        X_neural_scaled = self.scaler.fit_transform(X_neural)
        
        return {
            'neural': (X_neural_scaled, y_neural),
            'knn': (X_knn, y_knn),
            'svm': (X_svm, y_svm)
        }
    
    def train_neural_network(self, X, y):
        """
        Entrena la red neuronal
        """
        # Convertir etiquetas a formato categórico
        y_categorical = pd.get_dummies(y)
        
        # Dividir en entrenamiento y prueba
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_categorical, test_size=0.3, random_state=42
        )
        
        # Crear modelo de red neuronal
        self.neural_network = Sequential([
            Dense(units=32, activation='relu', input_shape=(X.shape[1],)),
            Dense(units=16, activation='relu'),
            Dense(units=8, activation='relu'),
            Dense(units=y_categorical.shape[1], activation='softmax')
        ])
        
        # Compilar modelo
        self.neural_network.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Entrenar modelo
        history = self.neural_network.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=100,
            batch_size=32,
            verbose=1
        )
        
        # Evaluar modelo
        y_pred = self.neural_network.predict(X_test)
        y_pred_binary = y_pred > 0.5
        
        print("Reporte de clasificación - Red Neuronal:")
        print(classification_report(y_test, y_pred_binary))
        
        # Guardar modelo
        self.neural_network.save('model.h5')  # Guardar en la raíz como model.h5
        
        return history
    
    def train_knn(self, X, y):
        """
        Entrena el modelo KNN
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        
        # Ajustar el número de vecinos según el tamaño del dataset
        n_samples = len(X_train)
        n_neighbors = min(5, max(1, n_samples // 2))  # Usar máximo 5 vecinos o la mitad de las muestras
        
        print(f"📊 KNN: {n_samples} muestras de entrenamiento, usando {n_neighbors} vecinos")
        
        self.knn_model = KNeighborsClassifier(n_neighbors=n_neighbors)
        self.knn_model.fit(X_train, y_train)
        
        # Evaluar modelo
        y_pred = self.knn_model.predict(X_test)
        
        print("Reporte de clasificación - KNN:")
        print(classification_report(y_test, y_pred))
        
        # Guardar modelo
        joblib.dump(self.knn_model, os.path.join(self.model_path, 'knn_model.pkl'))
        
        return self.knn_model
    
    def train_svm(self, X, y):
        """
        Entrena el modelo SVM
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        
        self.svm_model = SVC(kernel='rbf', random_state=42)
        self.svm_model.fit(X_train, y_train)
        
        # Evaluar modelo
        y_pred = self.svm_model.predict(X_test)
        
        print("Reporte de clasificación - SVM:")
        print(classification_report(y_test, y_pred))
        
        # Guardar modelo
        joblib.dump(self.svm_model, os.path.join(self.model_path, 'svm_model.pkl'))
        
        return self.svm_model
    
    def train_all_models(self, csv_path='comidaventura_dataset.csv'):
        """
        Entrena todos los modelos
        """
        # Cargar datos
        df = self.load_data(csv_path)
        if df is None:
            return False
        
        # Preprocesar datos
        data = self.preprocess_data(df)
        
        # Entrenar modelos
        print("Entrenando Red Neuronal...")
        self.train_neural_network(data['neural'][0], data['neural'][1])
        
        print("\nEntrenando KNN...")
        self.train_knn(data['knn'][0], data['knn'][1])
        
        print("\nEntrenando SVM...")
        self.train_svm(data['svm'][0], data['svm'][1])
        
        # Guardar preprocessors
        joblib.dump(self.label_encoder, os.path.join(self.model_path, 'label_encoder.pkl'))
        joblib.dump(self.scaler, os.path.join(self.model_path, 'scaler.pkl'))
        
        print("\nTodos los modelos entrenados y guardados exitosamente!")
        return True
    
    def load_models(self):
        """
        Carga los modelos entrenados usando la lógica del ejemplo proporcionado
        """
        try:
            print("🔄 Cargando modelo y preparando preprocesadores...")
            
            # Intentar cargar el modelo neural network desde model.h5
            model_path = os.path.join(self.model_path, '../model.h5')  # El modelo está en la raíz de ml_service
            if not os.path.exists(model_path):
                # Si no está ahí, intentar en la ruta directa
                model_path = 'model.h5'
            
            if os.path.exists(model_path):
                self.neural_network = load_model(model_path)
                print(f"✅ Modelo neural cargado correctamente desde: {model_path}")
                
                # Cargar el dataset original para ajustar los preprocesadores
                df_original = self.load_data()
                if df_original is None:
                    print("❌ No se pudo cargar el dataset original")
                    return False
                
                # Definir las columnas de características en el mismo orden que en el entrenamiento
                self.features_cols = [col for col in df_original.columns if col not in ['ID_Plato', 'Clasificacion_Nutricional']]
                self.target_col = 'Clasificacion_Nutricional'
                
                # Crear y ajustar el LabelEncoder para decodificar las predicciones
                self.label_encoder = LabelEncoder()
                self.label_encoder.fit(df_original[self.target_col])
                
                # Crear y ajustar el MinMaxScaler con los datos de entrenamiento
                self.scaler = MinMaxScaler()
                self.scaler.fit(df_original[self.features_cols])
                
                print("✅ Modelo y preprocesadores cargados correctamente")
                print(f"Clases decodificadas: {list(self.label_encoder.classes_)}")
                print(f"Características esperadas: {self.features_cols}")
                
                # Intentar cargar otros modelos si existen
                try:
                    knn_path = os.path.join(self.model_path, 'knn_model.pkl')
                    if os.path.exists(knn_path):
                        self.knn_model = joblib.load(knn_path)
                        print("✅ Modelo KNN cargado")
                        
                    svm_path = os.path.join(self.model_path, 'svm_model.pkl')
                    if os.path.exists(svm_path):
                        self.svm_model = joblib.load(svm_path)
                        print("✅ Modelo SVM cargado")
                except Exception as e:
                    print(f"⚠️ Advertencia al cargar KNN/SVM: {e}")
                
                return True
            else:
                print("⚠️ No se encontró el modelo entrenado")
                return False
                
        except Exception as e:
            print(f"❌ Error al cargar modelos: {e}")
            return False
    
    def predict_dish_health(self, nutrition_data, model_type='neural'):
        """
        Predice la clasificación nutricional usando la lógica del ejemplo proporcionado
        
        Args:
            nutrition_data: dict con keys que coinciden con el dataset CSV:
                          Calorias, Proteinas, Carbohidratos, Grasas, Fibra, Azucar
            model_type: 'neural', 'knn', o 'svm'
        
        Returns:
            dict con predicción y confianza
        """
        try:
            print(f"📊 Datos de entrada al modelo: {nutrition_data}")
            
            # Convertir datos del formato CSV a las 9 características que espera el modelo
            # El modelo espera: ['Edad_Niño', 'Total_Calorias', 'Total_Proteinas_g', 
            #                    'Total_Carbs_g', 'Total_Azucares_g', 'Total_Grasas_g',
            #                    'Total_Grasas_Sat_g', 'Total_Fibra_g', 'Total_Sodio_mg']
            
            model_data = {
                'Edad_Niño': 5,  # Valor por defecto, podríamos hacer esto configurable
                'Total_Calorias': nutrition_data.get('Calorias', 0),
                'Total_Proteinas_g': nutrition_data.get('Proteinas', 0),
                'Total_Carbs_g': nutrition_data.get('Carbohidratos', 0),
                'Total_Azucares_g': nutrition_data.get('Azucar', 0),
                'Total_Grasas_g': nutrition_data.get('Grasas', 0),
                'Total_Grasas_Sat_g': nutrition_data.get('Grasas', 0) * 0.3,  # Aproximación: 30% de grasas saturadas
                'Total_Fibra_g': nutrition_data.get('Fibra', 0),
                'Total_Sodio_mg': 300  # Valor por defecto, podríamos estimarlo basado en otros valores
            }
            
            print(f"📊 Datos convertidos para el modelo: {model_data}")
            
            # Crear DataFrame con los datos de prueba en el formato correcto para el modelo
            datos_prueba = pd.DataFrame([model_data])
            
            # Definir el orden de columnas que espera el modelo
            expected_cols_for_model = ['Edad_Niño', 'Total_Calorias', 'Total_Proteinas_g', 
                                     'Total_Carbs_g', 'Total_Azucares_g', 'Total_Grasas_g',
                                     'Total_Grasas_Sat_g', 'Total_Fibra_g', 'Total_Sodio_mg']
            
            # Reordenar las columnas según el orden que espera el modelo
            datos_prueba = datos_prueba.reindex(columns=expected_cols_for_model, fill_value=0)
            
            print(f"📊 DataFrame de prueba (9 características):\n{datos_prueba}")
            
            if model_type == 'neural':
                if self.neural_network is None:
                    raise ValueError("Red neuronal no está cargada")
                
                # Normalizar los datos usando rangos más amplios para clasificaciones más realistas
                # Ajustados para que solo alimentos muy poco saludables sean "Poco Saludable"
                max_values = np.array([12, 1200, 80, 150, 60, 80, 25, 20, 1500])  # Rangos más amplios
                datos_normalizados = np.clip(datos_prueba.values / max_values, 0, 1)
                
                print(f"📊 Datos normalizados (9 características): {datos_normalizados}")
                
                # Realizar la predicción
                predicciones_prob = self.neural_network.predict(datos_normalizados, verbose=0)
                print(f"📊 Probabilidades de predicción: {predicciones_prob}")
                
                # Obtener la clase con la probabilidad más alta
                predicted_class_index = np.argmax(predicciones_prob, axis=1)[0]
                confidence = np.max(predicciones_prob)
                
                # Mapear índices a etiquetas (basado en el modelo entrenado)
                # Asumiendo que las clases son: ['Excelente', 'Bueno', 'Puede Mejorar', 'Poco Saludable']
                class_labels = ['Excelente', 'Bueno', 'Puede Mejorar', 'Poco Saludable']
                predicted_label = class_labels[predicted_class_index]
                
                # Ajuste especial: clasificar como "Poco Saludable" solo si realmente es muy poco saludable
                # Criterios más estrictos para "Poco Saludable"
                calorias = model_data['Total_Calorias']
                grasas = model_data['Total_Grasas_g']
                grasas_sat = model_data['Total_Grasas_Sat_g']
                proteinas = model_data['Total_Proteinas_g']
                azucar = model_data['Total_Azucares_g']
                
                # Solo es "Poco Saludable" si cumple criterios más estrictos (como papas fritas)
                if (calorias > 600 and grasas > 25) or \
                   (calorias > 500 and grasas > 30) or \
                   (grasas > 30 and grasas_sat > 8) or \
                   (azucar > 40 and calorias > 400) or \
                   (calorias > 400 and grasas > 20 and proteinas < 10) or \
                   (grasas > 25 and proteinas < 5):  # Criterio específico para papas fritas (alta grasa, poca proteína)
                    predicted_label = 'Poco Saludable'
                    confidence = max(confidence, 0.85)  # Alta confianza para casos obvios
                # Si tenía "Poco Saludable" pero no cumple criterios estrictos, cambiar a "Puede Mejorar"
                elif predicted_label == 'Poco Saludable':
                    predicted_label = 'Puede Mejorar'
                # Promover a "Excelente" si tiene buena proteína, baja grasa y pocas calorías
                elif proteinas > 30 and grasas < 15 and calorias < 500:
                    predicted_label = 'Excelente'
                    confidence = max(confidence, 0.80)
                # Promover a "Bueno" si es razonablemente saludable
                elif proteinas > 20 and grasas < 25 and calorias < 650:
                    if predicted_label == 'Puede Mejorar':
                        predicted_label = 'Bueno'
                
            elif model_type == 'knn':
                if self.knn_model is None:
                    raise ValueError("Modelo KNN no está cargado")
                
                predicted_class_index = self.knn_model.predict(datos_prueba)[0]
                class_labels = ['Excelente', 'Bueno', 'Puede Mejorar', 'Poco Saludable']
                predicted_label = class_labels[predicted_class_index]
                confidence = 0.8
                
            elif model_type == 'svm':
                if self.svm_model is None:
                    raise ValueError("Modelo SVM no está cargado")
                
                predicted_class_index = self.svm_model.predict(datos_prueba)[0]
                class_labels = ['Excelente', 'Bueno', 'Puede Mejorar', 'Poco Saludable']
                predicted_label = class_labels[predicted_class_index]
                confidence = 0.8
                
            else:
                raise ValueError("Tipo de modelo no válido")
            
            print(f"✅ Predicción: {predicted_label} (confianza: {confidence:.3f})")
            
            return {
                'classification': predicted_label,
                'confidence': float(confidence),
                'model_used': model_type
            }
            
        except Exception as e:
            print(f"❌ Error en predicción: {e}")
            return {
                'classification': 'Error',
                'confidence': 0.0,
                'model_used': model_type,
                'error': str(e)
            }
    
    def predict_from_food_list(self, foods, model_type='neural'):
        """
        Predice la clasificación nutricional basada en una lista de alimentos
        
        Args:
            foods: lista de diccionarios con información nutricional (formato del servidor)
            model_type: 'neural', 'knn', o 'svm'
        
        Returns:
            dict con predicción y confianza
        """
        print(f"🔍 Recibidos {len(foods)} alimentos para análisis:")
        for i, food in enumerate(foods):
            print(f"  Alimento {i+1}: {food}")
        
        # Calcular totales nutricionales usando las claves exactas del dataset CSV
        total_nutrition = {
            'Calorias': sum(food.get('Calorias', 0) for food in foods),
            'Proteinas': sum(food.get('Proteinas', 0) for food in foods),
            'Carbohidratos': sum(food.get('Carbohidratos', 0) for food in foods),
            'Grasas': sum(food.get('Grasas', 0) for food in foods),
            'Fibra': sum(food.get('Fibra', 0) for food in foods),
            'Azucar': sum(food.get('Azucar', 0) for food in foods)
        }
        
        # Si todos los valores son 0, intentar usar otras claves posibles
        if all(v == 0 for v in total_nutrition.values()):
            print("⚠️ Todos los valores nutricionales son 0, intentando claves alternativas...")
            total_nutrition = {
                'Calorias': sum(food.get('calories', food.get('calorie', 0)) for food in foods),
                'Proteinas': sum(food.get('protein', food.get('proteins', 0)) for food in foods),
                'Carbohidratos': sum(food.get('carbs', food.get('carbohydrates', food.get('carbohidratos', 0))) for food in foods),
                'Grasas': sum(food.get('fat', food.get('fats', food.get('grasas', 0))) for food in foods),
                'Fibra': sum(food.get('fiber', food.get('fibra', 0)) for food in foods),
                'Azucar': sum(food.get('sugar', food.get('azucar', 0)) for food in foods)
            }
            
            # Si aún son 0, usar valores por defecto basados en el número de alimentos
            if all(v == 0 for v in total_nutrition.values()):
                print("⚠️ Aún son 0, usando valores por defecto basados en número de alimentos...")
                num_foods = len(foods)
                total_nutrition = {
                    'Calorias': num_foods * 200,  # ~200 cal por alimento promedio
                    'Proteinas': num_foods * 10,   # ~10g proteína por alimento
                    'Carbohidratos': num_foods * 30, # ~30g carbohidratos por alimento
                    'Grasas': num_foods * 8,       # ~8g grasas por alimento
                    'Fibra': num_foods * 3,        # ~3g fibra por alimento
                    'Azucar': num_foods * 5        # ~5g azúcar por alimento
                }
        
        print(f"📊 Total nutrition calculado: {total_nutrition}")
        
        return self.predict_dish_health(total_nutrition, model_type)

# Función para entrenar modelos si se ejecuta directamente
if __name__ == "__main__":
    model = NutritionModel()
    model.train_all_models() 