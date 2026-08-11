import unicodedata
import re

def limpiar_archivo(ruta_archivo):
    try:
        with open(ruta_archivo, "r", encoding="utf-8") as file:
            lineas = file.readlines()

        # Limpiar y normalizar cada línea
        lineas_normalizadas = []
        for linea in lineas:
            # Eliminar espacios al inicio y al final
            linea = linea.strip()

            # Normalizar caracteres Unicode (convertir caracteres combinados en su forma canónica)
            linea = unicodedata.normalize("NFKD", linea)

            # Reemplazar comillas tipográficas y otros caracteres problemáticos
            linea = (
                linea.replace("‘", "'")
                     .replace("’", "'")
                     .replace("“", '"')
                     .replace("”", '"')
                     .replace("—", "-")  # Reemplazar guion largo por guion normal
                     .replace("•", "*")  # Reemplazar bullet por asterisco
            )
            
            # Eliminar caracteres no imprimibles o extraños (excepto los espacios)
            linea = re.sub(r'[^\x00-\x7F]+', '', linea)  # Elimina caracteres fuera del rango ASCII

            if linea:  # Ignorar líneas vacías
                lineas_normalizadas.append(linea)

        # Sobrescribir el archivo con las líneas normalizadas
        with open(ruta_archivo, "w", encoding="utf-8") as file:
            file.write("\n".join(lineas_normalizadas))

        print("Archivo limpiado y normalizado correctamente.")
    except Exception as e:
        print(f"Error al limpiar el archivo: {e}")

if __name__ == "__main__":
    RUTA_TXT = "canciones.txt"
    limpiar_archivo(RUTA_TXT)
