#!/usr/bin/env python3
"""
Script simple para probar la predicción del modelo
"""

from nutrition_model import NutritionModel

# Crear instancia del modelo
model = NutritionModel()

# Cargar modelo
print("🔄 Cargando modelo...")
success = model.load_models()
print(f"✅ Modelo cargado: {success}")

# Datos de prueba
test_foods = [
    {
        'Calorias': 200,
        'Proteinas': 15,
        'Carbohidratos': 30,
        'Grasas': 8,
        'Fibra': 3,
        'Azucar': 5
    },
    {
        'Calorias': 150,
        'Proteinas': 10,
        'Carbohidratos': 20,
        'Grasas': 5,
        'Fibra': 2,
        'Azucar': 3
    }
]

print("\n🧪 Probando predicción con datos de ejemplo...")

# Probar predicción
result = model.predict_from_food_list(test_foods)
print(f"\n📋 Resultado de predicción:")
print(f"   Clasificación: {result['classification']}")
print(f"   Confianza: {result['confidence']:.3f}")
print(f"   Modelo usado: {result['model_used']}")
