import requests
import base64
import os
import time
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Variables de acceso a Spotify
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Conexión a Neo4j
NEO4J_URL = os.getenv("NEO4J_URL")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASS = os.getenv("NEO4J_PASS")

class Neo4jConnector:
    def __init__(self, url, user, password):
        self.driver = GraphDatabase.driver(url, auth=(user, password))
        
    def close(self):
        self.driver.close()
        
    def insertar_cancion_y_artista(self, cancion_id, cancion_nombre, artistas, genero, popularidad, duracion, bpm, danceability, loudness, dissonance, pitch_salience, chords_change_rate, chords_strength, spectral_centroid, tonal_entropy, spectral_complexity, uri):
        with self.driver.session() as session:
            for artista in artistas:
                session.write_transaction(self._crear_cancion_y_artista, cancion_id, cancion_nombre, artista['id'], artista['nombre'], genero, popularidad, duracion, bpm, danceability, loudness, dissonance, pitch_salience, chords_change_rate, chords_strength, spectral_centroid, tonal_entropy, spectral_complexity, uri)

    @staticmethod
    def _crear_cancion_y_artista(tx, cancion_id, cancion_nombre, artista_id, artista_nombre, genero, popularidad, duracion, bpm, danceability, loudness, dissonance, pitch_salience, chords_change_rate, chords_strength, spectral_centroid, tonal_entropy, spectral_complexity, uri):
        query = (
            "MERGE (a:Artista {spotify_id: $artista_id}) "
            "ON CREATE SET a.nombre = $artista_nombre "
            "MERGE (c:Cancion {spotify_id: $cancion_id}) "
            "ON CREATE SET c.titulo = $cancion_nombre, c.genero = $genero, c.popularidad = $popularidad, "
            "c.duracion = $duracion, c.bpm = $bpm, c.danceability = $danceability, c.loudness = $loudness, "
            "c.dissonance = $dissonance, c.pitch_salience = $pitch_salience, c.chords_change_rate = $chords_change_rate, "
            "c.chords_strength = $chords_strength, c.spectral_centroid = $spectral_centroid, c.tonal_entropy = $tonal_entropy, "
            "c.spectral_complexity = $spectral_complexity, c.uri = $uri "
            "MERGE (a)-[:INTERPRETADA_POR]->(c)"
        )
        tx.run(query, artista_id=artista_id, artista_nombre=artista_nombre, cancion_id=cancion_id, cancion_nombre=cancion_nombre,
            genero=genero, popularidad=popularidad, duracion=duracion, bpm=bpm, danceability=danceability,
            loudness=loudness, dissonance=dissonance, pitch_salience=pitch_salience,
            chords_change_rate=chords_change_rate, chords_strength=chords_strength,
            spectral_centroid=spectral_centroid, tonal_entropy=tonal_entropy,
            spectral_complexity=spectral_complexity, uri=uri)

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

def make_request_with_retry(url, headers, params=None):
    while True:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", "5"))
            print(f"⚠️ Límite alcanzado. Esperando {retry_after} segundos...")
            time.sleep(retry_after)
        else:
            response.raise_for_status()
            return response

def get_artist_genres(artist_id, token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = make_request_with_retry(f"https://api.spotify.com/v1/artists/{artist_id}", headers)
    artist_info = response.json()
    return artist_info.get("genres", [])

def search_track(song_name, token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    params = {
        "q": f"track:{song_name}",
        "type": "track",
        "limit": 1
    }
    response = make_request_with_retry("https://api.spotify.com/v1/search", headers, params)
    tracks = response.json().get("tracks", {}).get("items", [])
    if not tracks:
        return None

    track = tracks[0]
    artist_data = [{"id": artist["id"], "nombre": artist["name"]} for artist in track["artists"]]
    artist_ids = [artist["id"] for artist in track["artists"]]

    all_genres = set()
    for artist_id in artist_ids:
        genres = get_artist_genres(artist_id, token)
        all_genres.update(genres)

    return {
        "id": track["id"],
        "name": track["name"],
        "artists": artist_data,
        "popularity": track["popularity"],
        "duration_sec": track["duration_ms"] / 1000,
        "genres": list(all_genres),
        "uri": track["uri"]
    }

def read_songs_from_file(filename, token, neo4j_connector):
    with open(filename, "r") as file:
        lines = file.readlines()

    for i, line in enumerate(lines, start=1):
        parts = line.split(" //||\\ ")
        if len(parts) < 12:
            print(f"Línea {i} - ⚠️ Formato incorrecto o incompleto: {line.strip()}")
            continue

        song_name = parts[0].strip()
        artists = parts[1].strip()
        bpm = float(parts[2].split(":")[1].strip()) if "BPM" in parts[2] else None
        danceability = float(parts[3].split(":")[1].strip()) if "Danceability" in parts[3] else None
        loudness = float(parts[4].split(":")[1].strip()) if "Loudness" in parts[4] else None
        dissonance = float(parts[5].split(":")[1].strip()) if "Dissonance" in parts[5] else None
        pitch_salience = float(parts[6].split(":")[1].strip()) if "Pitch Salience" in parts[6] else None
        chords_change_rate = float(parts[7].split(":")[1].strip()) if "Chords Change Rate" in parts[7] else None
        chords_strength = float(parts[8].split(":")[1].strip()) if "Chords Strength" in parts[8] else None
        spectral_centroid = float(parts[9].split(":")[1].strip()) if "Spectral Centroid" in parts[9] else None
        tonal_entropy = float(parts[10].split(":")[1].strip()) if "Tonal Entropy" in parts[10] else None
        spectral_complexity = float(parts[11].split(":")[1].strip()) if "Spectral Complexity" in parts[11] else None

        print(f"Línea {i} - Buscando información para: {song_name} - {artists}")

        info = search_track(song_name, token)
        if info:
            print(f"🎵 {info['name']} - {', '.join(a['nombre'] for a in info['artists'])}")
            print(f"   Popularidad: {info['popularity']}, Duración: {info['duration_sec']:.2f}s")
            print(f"   Géneros: {', '.join(info['genres']) if info['genres'] else 'No disponible'}")
            print(f"   URI: {info['uri']}")

            neo4j_connector.insertar_cancion_y_artista(
                info['id'], info['name'], info['artists'], info['genres'], info['popularity'],
                info['duration_sec'], bpm, danceability, loudness, dissonance, pitch_salience,
                chords_change_rate, chords_strength, spectral_centroid, tonal_entropy,
                spectral_complexity, info['uri']
            )

if __name__ == "__main__":
    token = get_access_token(CLIENT_ID, CLIENT_SECRET)
    neo4j_connector = Neo4jConnector(NEO4J_URL, NEO4J_USER, NEO4J_PASS)
    read_songs_from_file("canciones.txt", token, neo4j_connector)
    neo4j_connector.close()
