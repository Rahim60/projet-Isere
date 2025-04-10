import requests
from bs4 import BeautifulSoup
import json

# Télécharger la page Wikipédia pour les anciennes communes de l'Isère
url = "https://fr.wikipedia.org/wiki/Liste_des_anciennes_communes_de_l%27Isère"
reponse = requests.get(url)
soup = BeautifulSoup(reponse.text, 'html.parser')

# Récupération du tableau des fusions
tables = soup.find_all('table', {'class': 'wikitable'})
table = tables[1]  # Le tableau des fusions (il s'agit probablement du deuxième tableau)

rows = table.find_all('tr')

fusions_isere = []
current_fusion = None
inside_valid_fusion = False  # pour savoir si on est dans une fusion active

for row in rows[1:]:
    cells = row.find_all('td')
    nb = len(cells)

    #  CAS normal : nouvelle fusion complète
    if nb >= 3 and cells[0].get_text(strip=True):
        if current_fusion:
            fusions_isere.append(current_fusion)

        # On crée un nouveau bloc fusion
        current_fusion = {
            'nouvelle_commune': cells[0].get_text(strip=True),
            'communes_fusionnees': [cells[1].get_text(strip=True)],
            'regime': cells[2].get_text(strip=True) if nb > 2 else '',
            'date_decision': cells[3].get_text(strip=True) if nb > 3 else '',
            'date_effet': cells[4].get_text(strip=True) if nb > 4 else ''
        }
        inside_valid_fusion = True

    # CAS : ligne avec anciennes communes à ajouter
    elif nb <= 2 and current_fusion and inside_valid_fusion:
        for cell in cells:
            text = cell.get_text(strip=True)
            if text:
                current_fusion['communes_fusionnees'].append(text)

    # CAS douteux : ligne ni complète ni simple
    elif 2 < nb < 5:
        print(" Ligne incomplète détectée :", [cell.get_text(strip=True) for cell in cells])
        if current_fusion and inside_valid_fusion:
            for cell in cells:
                text = cell.get_text(strip=True)
                if text:
                    current_fusion['communes_fusionnees'].append(text)

    else:
        # Ligne étrange ou vide : on clôt
        if current_fusion:
            fusions_isere.append(current_fusion)
        current_fusion = None
        inside_valid_fusion = False

# Ne pas oublier d'ajouter la dernière fusion
if current_fusion:
    fusions_isere.append(current_fusion)

# Exportation des données en format JSON
with open("fusions_isere.json", "w", encoding="utf-8") as f:
    json.dump(fusions_isere, f, ensure_ascii=False, indent=2)

print("Export terminé! Fichier JSON généré : fusions_isere.json")
