import time
import pickle
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# Configuración de Selenium
options = Options()
options.headless = False  # Cambiar a True si no quieres que el navegador se muestre
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Diccionario con los países y sus URLs base
urls_paises = {
    "Global": "https://charts.spotify.com/charts/view/regional-global-weekly/latest",
    "Argentina": "https://charts.spotify.com/charts/view/regional-ar-weekly/latest",
    "Chile": "https://charts.spotify.com/charts/view/regional-cl-weekly/latest",
    "Colombia": "https://charts.spotify.com/charts/view/regional-co-weekly/latest",
    "Costa Rica": "https://charts.spotify.com/charts/view/regional-cr-weekly/latest",
    "Francia": "https://charts.spotify.com/charts/view/regional-fr-weekly/latest",
    "Alemania": "https://charts.spotify.com/charts/view/regional-de-weekly/latest",
    "India": "https://charts.spotify.com/charts/view/regional-in-weekly/latest",
    "Republica Dominicana": "https://charts.spotify.com/charts/view/regional-do-weekly/latest",
    "Brasil": "https://charts.spotify.com/charts/view/regional-br-weekly/latest",
    "Italia": "https://charts.spotify.com/charts/view/regional-it-weekly/latest",
    "Japon": "https://charts.spotify.com/charts/view/regional-jp-weekly/latest",
    "Mexico": "https://charts.spotify.com/charts/view/regional-mx-weekly/latest",
    "Moroco": "https://charts.spotify.com/charts/view/regional-ma-weekly/latest",
    "Peru": "https://charts.spotify.com/charts/view/regional-pe-weekly/latest",
    "Portugal": "https://charts.spotify.com/charts/view/regional-pt-weekly/latest",
    "España": "https://charts.spotify.com/charts/view/regional-es-weekly/latest",
    "Korea del sur": "https://charts.spotify.com/charts/view/regional-kr-weekly/latest",
    "Estados Unidos": "https://charts.spotify.com/charts/view/regional-us-weekly/latest",
    "Reino Unido": "https://charts.spotify.com/charts/view/regional-gb-weekly/latest"
}

# Fechas para reemplazar "latest"
fechas = [
    "2025-04-03", "2025-03-06", "2025-02-06", "2025-01-09", "2024-12-12"
    "2024-10-31", "2024-10-03", "2024-08-29", "2024-08-01", "2024-06-27", 
    "2024-05-30", "2024-05-02", "2024-03-28", "2024-02-29", "2024-02-01",
    "2023-12-28", "2023-11-30", "2023-10-26", "2023-09-28", "2023-08-31",
    "2023-07-27", "2023-06-29", "2023-05-25", "2023-04-27", "2023-03-30",
    "2023-02-23", "2023-01-26", "2022-12-29", "2022-11-24", "2022-10-27",
    "2022-09-29", "2022-08-25", "2022-07-28", "2022-06-30", "2022-05-26",
    "2022-04-28", "2022-03-31", "2022-02-24", "2022-01-27"
]

# Guardar cookies para futuras sesiones (opcional)
def save_cookies():
    with open("cookies.pkl", "wb") as file:
        pickle.dump(driver.get_cookies(), file)
    print("Cookies guardadas.")

# Solicitar iniciar sesión una vez
print("Inicia sesión manualmente en la página de Spotify. Una vez que hayas iniciado sesión, escribe 'listo' en la consola y presiona Enter para continuar.")
driver.get("https://charts.spotify.com/charts/view/regional-global-weekly/latest")
while True:
    user_input = input()
    if user_input.lower() == 'listo':
        break
    else:
        print("Escribe 'listo' para continuar.")

# Guardar cookies después del inicio de sesión
save_cookies()

# Abrir un archivo para guardar todas las canciones y artistas
with open("canciones_y_artistas.txt", "w", encoding="utf-8") as file:
    # Iterar sobre cada país y su URL base
    for pais, base_url in urls_paises.items():
        for fecha in fechas:
            # Reemplazar "latest" por la fecha específica
            url = base_url.replace("latest", fecha)
            print(f"Procesando {pais} en la fecha {fecha}...")

            # Navegar a la URL del país y fecha
            driver.get(url)
            time.sleep(10)  # Esperar para que la página cargue completamente

            # Obtener el código HTML de la página
            page_source = driver.page_source

            # Usar BeautifulSoup para analizar el HTML
            soup = BeautifulSoup(page_source, "html.parser")

            # Extraer los nombres de las canciones y los artistas
            try:
                filas = soup.find_all("td", class_="TableCell__TableCellElement-sc-1nn7cfv-0 bdJpYG encore-text-body-small")
                for fila in filas:
                    nombre_cancion = fila.find("span", class_="styled__StyledTruncatedTitle-sc-135veyd-22 fMOjxo")
                    if nombre_cancion:
                        nombre_cancion = nombre_cancion.get_text(strip=True)
                        artistas_div = fila.find("div", class_="styled__StyledArtistsTruncatedDiv-sc-135veyd-28 ibVmha")
                        if artistas_div:
                            artistas = artistas_div.find_all("a", class_="styled__StyledHyperlink-sc-135veyd-25 bVVLJU")
                            nombres_artistas = [artista.get_text(strip=True) for artista in artistas]
                        else:
                            nombres_artistas = ["Artista desconocido"]
                        resultado = f"{pais} ({fecha}): {nombre_cancion} //||\\ {', '.join(nombres_artistas)}"
                        print(resultado)  # Mostrar en consola
                        file.write(resultado + "\n")  # Guardar en el archivo
            except Exception as e:
                print(f"Error al procesar {pais} en la fecha {fecha}: {e}")

# Cerrar el navegador al finalizar
driver.quit()
print("Todas las canciones y artistas han sido procesados y guardados en 'canciones_y_artistas.txt'.")
