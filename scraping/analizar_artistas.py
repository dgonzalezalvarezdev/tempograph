import requests
from neo4j import GraphDatabase
import base64
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de conexión
NEO4J_URL = os.getenv("NEO4J_URL")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASS = os.getenv("NEO4J_PASS")

# Credenciales de Spotify
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

def get_access_token(client_id, client_secret):
    auth_str = f"{client_id}:{client_secret}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()
    headers = {
        "Authorization": f"Basic {b64_auth_str}"
    }
    data = {
        "grant_type": "client_credentials"
    }
    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    response.raise_for_status()
    return response.json()["access_token"]

def get_artist_data_from_spotify(spotify_id, token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(f"https://api.spotify.com/v1/artists/{spotify_id}", headers=headers)
    response.raise_for_status()
    data = response.json()
    return {
        "followers": data.get("followers", {}).get("total", 0),
        "genres": data.get("genres", [])
    }

class Neo4jQuery:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def listar_artistas_sin_followers(self):
        with self.driver.session() as session:
            result = session.read_transaction(self._obtener_artistas_sin_followers)
            return result

    @staticmethod
    def _obtener_artistas_sin_followers(tx):
        query = """
        MATCH (a:Artista)
        WHERE a.followers IS NULL
        RETURN DISTINCT a.nombre AS artista, a.spotify_id AS spotify_id
        ORDER BY artista
        """
        result = tx.run(query)
        return result.data()

    def actualizar_artista(self, spotify_id, followers, genres):
        with self.driver.session() as session:
            session.write_transaction(self._guardar_datos_artista, spotify_id, followers, genres)

    @staticmethod
    def _guardar_datos_artista(tx, spotify_id, followers, genres):
        query = """
        MATCH (a:Artista {spotify_id: $spotify_id})
        SET a.followers = $followers,
            a.generos = $genres
        """
        tx.run(query, spotify_id=spotify_id, followers=followers, genres=genres)

if __name__ == "__main__":
    token = get_access_token(CLIENT_ID, CLIENT_SECRET)
    neo4j_query = Neo4jQuery(NEO4J_URL, NEO4J_USER, NEO4J_PASS)

    try:
        artistas = neo4j_query.listar_artistas_sin_followers()
        for artista in artistas:
            nombre = artista["artista"]
            spotify_id = artista["spotify_id"]
            print(f"🔍 Buscando datos para: {nombre} (ID: {spotify_id})")

            try:
                datos = get_artist_data_from_spotify(spotify_id, token)
                print(f"   👥 Seguidores: {datos['followers']}, 🎼 Géneros: {', '.join(datos['genres'])}")
                neo4j_query.actualizar_artista(spotify_id, datos["followers"], datos["genres"])
            except requests.RequestException as e:
                print(f"   ❌ Error al obtener datos de Spotify: {e}")
    finally:
        neo4j_query.close()
