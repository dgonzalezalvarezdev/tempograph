def verificar_archivo(ruta_archivo):
    try:
        with open(ruta_archivo, "r", encoding="utf-8") as file:
            for i, linea in enumerate(file, start=1):
                print(f"Línea {i}: {repr(linea.strip())}")
    except Exception as e:
        print(f"Error al leer el archivo: {e}")

if __name__ == "__main__":
    RUTA_TXT = "canciones_sin_repetidas.txt"
    verificar_archivo(RUTA_TXT)
