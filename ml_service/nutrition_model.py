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
        
        # Aplicar SMOTE para balancear las clases
        smote = SMOTE(random_state=42)
        X_neural, y_neural = smote.fit_resample(X_neural, y_neural)
        X_knn, y_knn = smote.fit_resample(X_knn, y_knn)
        X_svm, y_svm = smote.fit_resample(X_svm, y_svm)
        
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
        self.neural_network.save(os.path.join(self.model_path, 'neural_network.h5'))
        
        return history
    
    def train_knn(self, X, y):
        """
        Entrena el modelo KNN
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        
        self.knn_model = KNeighborsClassifier(n_neighbors=5)
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
        Carga los modelos entrenados
        """
        try:
            # Intentar cargar desde diferentes ubicaciones
            model_paths = [
                'model.h5',  # Ruta en el directorio actual
                os.path.join('..', 'model.h5'),  # Ruta en el directorio padre
                os.path.join(self.model_path, 'neural_network.h5'),  # Ruta en models/
                os.path.join(self.model_path, 'model.h5'),  # Ruta alternativa en models/
                os.path.abspath('model.h5'),  # Ruta absoluta
                'C:\\Users\\USUARIO\\Desktop\\ComidaVentura-1\\ml_service\\model.h5'  # Ruta específica del usuario
            ]
            
            neural_loaded = False
            for path in model_paths:
                if os.path.exists(path):
                    try:
                        self.neural_network = load_model(path)
                        print(f"Red neuronal cargada desde: {path}")
                        
                        # Crear encoder y scaler para 9 características
                        self.label_encoder = LabelEncoder()
                        self.label_encoder.classes_ = np.array(['Muy Saludable', 'Saludable', 'Moderadamente Saludable', 'Poco Saludable'])
                        
                        # Crear scaler para 9 características que coincida con el modelo
                        self.scaler = MinMaxScaler()
                        # Configurar escalas apropiadas para las 9 características
                        # [calories, protein, carbs, fat, fiber, sugar, sodium, cholesterol, vitaminScore]
                        self.scaler.scale_ = np.array([1/500, 1/50, 1/100, 1/30, 1/10, 1/30, 1/500, 1/200, 1/10])
                        self.scaler.min_ = np.array([0, 0, 0, 0, 0, 0, 0, 0, 0])
                        
                        neural_loaded = True
                        break
                    except Exception as e:
                        print(f"Error al cargar desde {path}: {e}")
                        continue
            
            if not neural_loaded:
                print("No se pudo cargar la red neuronal, creando encoder y scaler por defecto")
                # Crear encoder y scaler básicos para que funcione la predicción
                self.label_encoder = LabelEncoder()
                self.label_encoder.classes_ = np.array(['Muy Saludable', 'Saludable', 'Moderadamente Saludable', 'Poco Saludable'])
                self.scaler = MinMaxScaler()
                # Configurar el scaler con valores típicos para 9 características
                self.scaler.scale_ = np.array([1/500, 1/50, 1/100, 1/30, 1/10, 1/30, 1/500, 1/200, 1/10])  # Escalas aproximadas
                self.scaler.min_ = np.array([0, 0, 0, 0, 0, 0, 0, 0, 0])
                return neural_loaded
            
            # Intentar cargar otros modelos (opcional)
            try:
                if os.path.exists(os.path.join(self.model_path, 'knn_model.pkl')):
                    self.knn_model = joblib.load(os.path.join(self.model_path, 'knn_model.pkl'))
                if os.path.exists(os.path.join(self.model_path, 'svm_model.pkl')):
                    self.svm_model = joblib.load(os.path.join(self.model_path, 'svm_model.pkl'))
            except Exception as e:
                print(f"Advertencia: No se pudieron cargar KNN/SVM: {e}")
            
            # Cargar preprocessors o crear por defecto
            try:
                if os.path.exists(os.path.join(self.model_path, 'label_encoder.pkl')):
                    self.label_encoder = joblib.load(os.path.join(self.model_path, 'label_encoder.pkl'))
                else:
                    self.label_encoder = LabelEncoder()
                    self.label_encoder.classes_ = np.array(['Muy Saludable', 'Saludable', 'Moderadamente Saludable', 'Poco Saludable'])
                
                if os.path.exists(os.path.join(self.model_path, 'scaler.pkl')):
                    self.scaler = joblib.load(os.path.join(self.model_path, 'scaler.pkl'))
                else:
                    self.scaler = MinMaxScaler()
                    # Configurar el scaler con valores típicos para datos nutricionales
                    self.scaler.scale_ = np.array([1/500, 1/50, 1/100, 1/30, 1/10, 1/30])
                    self.scaler.min_ = np.array([0, 0, 0, 0, 0, 0])
                    
            except Exception as e:
                print(f"Error al cargar preprocessors: {e}")
                # Crear por defecto
                self.label_encoder = LabelEncoder()
                self.label_encoder.classes_ = np.array(['Muy Saludable', 'Saludable', 'Moderadamente Saludable', 'Poco Saludable'])
                self.scaler = MinMaxScaler()
                self.scaler.scale_ = np.array([1/500, 1/50, 1/100, 1/30, 1/10, 1/30])
                self.scaler.min_ = np.array([0, 0, 0, 0, 0, 0])
            
            print("Modelos cargados exitosamente!")
            return True
        except Exception as e:
            print(f"Error al cargar modelos: {e}")
            return False
    
    def predict_dish_health(self, nutrition_data, model_type='neural'):
        """
        Predice la clasificación nutricional de un plato
        
        Args:
            nutrition_data: dict con keys: calories, protein, carbs, fat, fiber, sugar, sodium, cholesterol, vitaminScore
            model_type: 'neural', 'knn', o 'svm'
        
        Returns:
            dict con predicción y confianza
        """
        try:
            # Convertir datos a array con 9 características
            features = np.array([[
                nutrition_data['calories'],
                nutrition_data['protein'],
                nutrition_data['carbs'],
                nutrition_data['fat'],
                nutrition_data['fiber'],
                nutrition_data['sugar'],
                nutrition_data.get('sodium', 50),  # Valor por defecto si no existe
                nutrition_data.get('cholesterol', 0),  # Valor por defecto si no existe
                nutrition_data.get('vitaminScore', 4)  # Valor por defecto si no existe
            ]])
            
            print(f"📊 Datos originales enviados al modelo: {features}")
            print(f"📊 Datos de entrada: {nutrition_data}")
            
            if model_type == 'neural':
                if self.neural_network is None:
                    raise ValueError("Red neuronal no está cargada")
                
                # Usar normalización estándar (0-1) basada en rangos realistas
                # Rangos: [calories(0-800), protein(0-60), carbs(0-120), fat(0-40), fiber(0-15), sugar(0-40), sodium(0-600), cholesterol(0-300), vitaminScore(0-10)]
                max_values = np.array([800, 60, 120, 40, 15, 40, 600, 300, 10])
                features_normalized = np.clip(features / max_values, 0, 1)  # Limitar entre 0 y 1
                
                print(f"📊 Datos normalizados: {features_normalized}")
                
                # Hacer predicción con datos normalizados
                prediction = self.neural_network.predict(features_normalized, verbose=0)
                predicted_class = np.argmax(prediction)
                confidence = np.max(prediction)
                
            elif model_type == 'knn':
                if self.knn_model is None:
                    raise ValueError("Modelo KNN no está cargado")
                
                predicted_class = self.knn_model.predict(features)[0]
                # KNN no proporciona probabilidad directamente
                confidence = 0.8  # Valor fijo por simplicidad
                
            elif model_type == 'svm':
                if self.svm_model is None:
                    raise ValueError("Modelo SVM no está cargado")
                
                predicted_class = self.svm_model.predict(features)[0]
                # SVM no proporciona probabilidad directamente
                confidence = 0.8  # Valor fijo por simplicidad
                
            else:
                raise ValueError("Tipo de modelo no válido")
            
            # Decodificar etiqueta
            predicted_label = self.label_encoder.inverse_transform([predicted_class])[0]
            
            return {
                'classification': predicted_label,
                'confidence': float(confidence),
                'model_used': model_type
            }
            
        except Exception as e:
            print(f"Error en predicción: {e}")
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
            foods: lista de diccionarios con información nutricional
            model_type: 'neural', 'knn', o 'svm'
        
        Returns:
            dict con predicción y confianza
        """
        # Calcular totales nutricionales con las 9 características
        total_nutrition = {
            'calories': sum(food.get('calories', 0) for food in foods),
            'protein': sum(food.get('protein', 0) for food in foods),
            'carbs': sum(food.get('carbs', 0) for food in foods),
            'fat': sum(food.get('fat', 0) for food in foods),
            'fiber': sum(food.get('fiber', 0) for food in foods),
            'sugar': sum(food.get('sugar', 0) for food in foods),
            'sodium': sum(food.get('sodium', 50) for food in foods),
            'cholesterol': sum(food.get('cholesterol', 0) for food in foods),
            'vitaminScore': sum(food.get('vitaminScore', 4) for food in foods) / len(foods) if foods else 4  # Promedio para vitaminas
        }
        
        return self.predict_dish_health(total_nutrition, model_type)

# Función para entrenar modelos si se ejecuta directamente
if __name__ == "__main__":
    model = NutritionModel()
    model.train_all_models() 