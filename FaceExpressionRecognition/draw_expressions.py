import json
import pandas as pd
import matplotlib.pyplot as plt
import sys

if len(sys.argv) < 3:
    print("Uso: python draw_expressions.py <ruta_json> <ruta_salida_png>")
    sys.exit(1)

json_path = sys.argv[1]
output_path = sys.argv[2]

# Leer el JSON desde el archivo
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)  # Esto devuelve una lista de diccionarios

# Convertimos la lista en un DataFrame
df = pd.DataFrame(data)

# Graficamos
plt.figure(figsize=(10, 6))
for column in df.columns:
    plt.plot(df.index, df[column], marker='o', label=column)

plt.title("Evolución de emociones")
plt.xlabel("Índice de medición")
plt.ylabel("Probabilidad")
plt.yscale("log")  # Escala logarítmica para diferenciar valores pequeños
plt.legend()
plt.grid(True, which="both", linestyle="--", linewidth=0.5)
plt.tight_layout()
plt.savefig(output_path)
