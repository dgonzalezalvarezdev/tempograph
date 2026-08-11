from flask import Flask, request, jsonify
import essentia.standard as es
from youtubesearchpython import VideosSearch
import yt_dlp
import os
import re
import time

app = Flask(__name__)

CARPETA_AUDIO = "/app/audio"
os.makedirs(CARPETA_AUDIO, exist_ok=True)


def buscar_y_descargar_audio(cancion, artista, carpeta_destino=CARPETA_AUDIO):
    query = f"{cancion} {artista} audio"
    videos_search = VideosSearch(query, limit=1)
    resultado = videos_search.result()["result"]

    if not resultado:
        return None, "No se encontró resultado en YouTube."

    url = resultado[0]["link"]
    nombre_archivo = f"{cancion}_{artista}".replace(" ", "_").replace("/", "_")
    ruta_archivo = os.path.join(carpeta_destino, nombre_archivo + ".wav")

    opciones = {
        'format': 'bestaudio/best',
        'outtmpl': ruta_archivo.replace(".wav", ".%(ext)s"),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'quiet': True,
    }

    try:
        with yt_dlp.YoutubeDL(opciones) as ydl:
            ydl.download([url])
    except Exception as e:
        return None, f"Error al descargar audio: {str(e)}"

    return ruta_archivo, None


def analizar_audio(audiofile):
    try:
        features, _ = es.MusicExtractor(
            lowlevelStats=['mean', 'stdev'],
            rhythmStats=['mean', 'stdev'],
            tonalStats=['mean', 'stdev']
        )(audiofile)

        resultado = {
            "bpm": features['rhythm.bpm'],
            "danceability": features['rhythm.danceability'],
            "loudness": features['lowlevel.average_loudness'],
            "dissonance": features['lowlevel.dissonance.mean'],
            "pitch_salience": features['lowlevel.pitch_salience.mean'],
            "chords_changes_rate": features['tonal.chords_changes_rate'],
            "chords_strength": features['tonal.chords_strength.mean'],
            "spectral_centroid": features['lowlevel.spectral_centroid.mean'],
            "tonal_entropy": features['tonal.hpcp_entropy.mean'],
            "spectral_complexity": features['lowlevel.spectral_complexity.mean'],
        }

        return resultado, None
    except Exception as e:
        return None, f"Error al analizar audio: {str(e)}"
    finally:
        if os.path.exists(audiofile):
            os.remove(audiofile)


@app.route("/procesar", methods=["GET"])
def procesar():
    cancion = request.args.get("cancion")
    artista = request.args.get("artista")

    if not cancion or not artista:
        return jsonify({"error": "Faltan parámetros: cancion y artista"}), 400

    print(f"🎵 Procesando: {cancion} - {artista}")

    ruta_audio, error_descarga = buscar_y_descargar_audio(cancion, artista)
    if error_descarga:
        return jsonify({"error": error_descarga}), 500

    resultado, error_analisis = analizar_audio(ruta_audio)
    if error_analisis:
        return jsonify({"error": error_analisis}), 500

    return jsonify({
        "cancion": cancion,
        "artista": artista,
        "caracteristicas": resultado
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
