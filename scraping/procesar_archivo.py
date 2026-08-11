import re

# Definir los nombres de archivo de entrada y salida
ENTRADA = "canciones_a_descargar.txt"
SALIDA = "canciones_sin_repetidas.txt"

def extraer_info(linea):
    """Extrae nombre de canción y artistas"""
    # Cambiar la expresión regular para que coincida con cualquier texto antes del ":"
    match = re.match(r".*?: (.*?) //\|\|\\ (.*)", linea)
    if match:
        nombre_cancion = match.group(1).strip()
        artistas = match.group(2).strip()
        return nombre_cancion, artistas
    return None, None

def eliminar_repetidos(entrada, salida):
    """Elimina las canciones repetidas basadas en el nombre y los artistas"""
    canciones_vistas = set()  # Usamos un set para almacenar las canciones ya procesadas
    # Cambiar la apertura de archivo para usar 'utf-8' como codificación
    with open(entrada, "r", encoding="utf-8") as archivo_entrada, open(salida, "w", encoding="utf-8") as archivo_salida:
        for linea in archivo_entrada:
            cancion, artistas = extraer_info(linea)
            if cancion and artistas:
                clave_cancion = f"{cancion} //||\\ {artistas}"
                if clave_cancion not in canciones_vistas:
                    archivo_salida.write(linea)
                    canciones_vistas.add(clave_cancion)


# Llamar a la función para eliminar los duplicados
eliminar_repetidos(ENTRADA, SALIDA)

print("Se han eliminado las canciones repetidas.")
