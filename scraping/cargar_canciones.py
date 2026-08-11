import os
from neo4j import GraphDatabase
from dotenv import load_dotenv


load_dotenv()

# Configuración de la conexión a Neo4j
URI = os.getenv("NEO4J_URL")
USERNAME = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASS")

# Clase para interactuar con la base de datos
class Neo4jHandler:
    def __init__(self, uri, username, password):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
    
    def close(self):
        self.driver.close()
    
    def agregar_cancion_y_artistas(self, cancion, artistas):
        with self.driver.session() as session:
            session.write_transaction(self._crear_relaciones, cancion, artistas)

    @staticmethod
    def _crear_relaciones(tx, cancion, artistas):
        # Crear un nodo para la canción si no existe
        query_cancion = """
        MERGE (c:Cancion {titulo: $cancion})
        """
        tx.run(query_cancion, cancion=cancion)

        # Crear nodos para los artistas y relaciones con la canción
        for artista in artistas:
            query_artista = """
            MERGE (a:Artista {nombre: $artista})
            """
            tx.run(query_artista, artista=artista)
            
            query_relacion_cancion_artista = """
            MATCH (c:Cancion {titulo: $cancion})
            MATCH (a:Artista {nombre: $artista})
            MERGE (c)-[:INTERPRETADA_POR]->(a)
            """
            tx.run(query_relacion_cancion_artista, cancion=cancion, artista=artista)

# Función para leer el archivo y procesar los datos
def procesar_archivo_y_guardar_en_neo4j(ruta_archivo, db_handler):
    with open(ruta_archivo, "r", encoding="utf-8") as file:
        for linea in file:
            if ": " in linea:
                # Ignorar el país y quedarnos solo con el resto de la línea
                _, detalle = linea.split(": ", 1)
                # Separar la canción de los artistas
                if " - " in detalle:
                    titulo, artistas_raw = detalle.split(" - ", 1)
                    # Dividir los artistas por comas
                    artistas = [artista.strip() for artista in artistas_raw.split(",")]
                    # Guardar en la base de datos
                    db_handler.agregar_cancion_y_artistas(titulo.strip(), artistas)

# Main
if __name__ == "__main__":
    # Ruta al archivo de texto
    RUTA_TXT = "canciones.txt"

    # Inicializar el handler de Neo4j
    db_handler = Neo4jHandler(URI, USERNAME, PASSWORD)

    try:
        # Procesar el archivo y guardar los datos en Neo4j
        procesar_archivo_y_guardar_en_neo4j(RUTA_TXT, db_handler)
        print("Datos procesados y guardados correctamente en Neo4j.")
    except Exception as e:
        print(f"Error al procesar los datos: {e}")
    finally:
        # Cerrar la conexión
        db_handler.close()
