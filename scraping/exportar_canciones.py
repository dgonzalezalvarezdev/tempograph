import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# Configuración de la conexión
uri = os.getenv("NEO4J_URL") 
username = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASS")

# Crear el controlador de la base de datos
driver = GraphDatabase.driver(uri, auth=(username, password))

def contar_canciones():
    with driver.session() as session:
        query = "MATCH (c:Cancion) RETURN COUNT(c) AS total_canciones;"
        result = session.run(query)
        total_canciones = result.single()["total_canciones"]
        return total_canciones

# Llamar a la función y mostrar el resultado
total = contar_canciones()
print(f"Total de canciones en la base de datos Neo4j: {total}")

# Cerrar la conexión
driver.close()
