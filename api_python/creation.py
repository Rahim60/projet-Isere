import requests
from bs4 import BeautifulSoup
import json

# Télécharger la page Wikipédia pour les anciennes communes de l'Isère
url = "https://fr.wikipedia.org/wiki/Liste_des_anciennes_communes_de_l%27Isère"
reponse = requests.get(url)
soup = BeautifulSoup(reponse.text, 'html.parser')

# Récupération du tableau des créations et rétablissements
tables = soup.find_all('table', {'class': 'wikitable'})
table = tables[2]  # Le tableau des créations et rétablissements (il s'agit du troisième tableau sur la page)

rows = table.find_all('tr')

creations_retablissements = []
current_creation = None

for row in rows[1:]:
    cells = row.find_all('td')
    nb = len(cells)

    #  CAS normal : nouvelle création ou rétablissement
    if nb >= 4 and cells[0].get_text(strip=True):
        if current_creation:
            creations_retablissements.append(current_creation)

        # On crée un nouveau bloc création/rétablissement
        current_creation = {
            'commune_creee': cells[0].get_text(strip=True),
            'commune_affectee': [cells[1].get_text(strip=True)],
            'mode_creation': cells[2].get_text(strip=True) if nb > 2 else '',
            'date_decision': cells[3].get_text(strip=True) if nb > 3 else '',
            'date_effet': cells[4].get_text(strip=True) if nb > 4 else ''
        }

    # CAS : ligne avec plusieurs communes affectées à ajouter
    elif nb <= 2 and current_creation:
        for cell in cells:
            text = cell.get_text(strip=True)
            if text:
                current_creation['commune_affectee'].append(text)

    # Ajouter la dernière création ou rétablissement si nécessaire
    if current_creation:
        creations_retablissements.append(current_creation)

# Exportation des données en format JSON
with open("creations_retablissements_isere.json", "w", encoding="utf-8") as f:
    json.dump(creations_retablissements, f, ensure_ascii=False, indent=2)

print("Export terminé! Fichier JSON généré : creations_retablissements_isere.json")
