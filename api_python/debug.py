import requests
from bs4 import BeautifulSoup

# Télécharger la page Wikipédia pour les anciennes communes de l'Isère
url = "https://fr.wikipedia.org/wiki/Liste_des_anciennes_communes_de_l%27Isère"
reponse = requests.get(url)
soup = BeautifulSoup(reponse.text, 'html.parser')

# Vérification des tables sur la page
tables = soup.find_all('table', {'class': 'wikitable'})
print(f"Nombre de tableaux trouvés : {len(tables)}")

# Vérification de ce que contient chaque tableau
for i, table in enumerate(tables):
    print(f"\nTableau {i+1}:")
    rows = table.find_all('tr')
    for row in rows:
        cells = row.find_all('td')
        if cells:  # Si la ligne contient des cellules
            print([cell.get_text(strip=True) for cell in cells])
