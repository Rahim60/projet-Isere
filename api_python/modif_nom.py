from bs4 import BeautifulSoup
import requests
import csv

URL = "https://fr.wikipedia.org/wiki/Liste_des_anciennes_communes_de_l%27Isère"
response = requests.get(URL)
soup = BeautifulSoup(response.content, "html.parser")

tables = soup.find_all("table", {"class": "wikitable"})

modif_table = None

# Identifier la bonne table (celle avec "Ancien nom" et "Nouveau nom")
for table in tables:
    headers = [th.get_text(strip=True) for th in table.find_all("th")]
    if "Ancien nom" in headers and "Nouveau nom" in headers:
        modif_table = table
        break

if not modif_table:
    raise ValueError("Le tableau des modifications de noms n’a pas été trouvé.")

rows = modif_table.find_all("tr")[1:]
data = []
id_counter = 1

for row in rows:
    cols = row.find_all(["td", "th"])
    if len(cols) >= 3:
        ancien_nom = cols[0].get_text(strip=True).replace("\xa0", " ")
        nouveau_nom = cols[1].get_text(strip=True).replace("\xa0", " ")
        date_decision = cols[2].get_text(strip=True).replace("\xa0", " ")

        data.append([id_counter, ancien_nom, nouveau_nom, date_decision])
        id_counter += 1

# Sauvegarde en CSV
with open("modifications_noms.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerow(["id", "ancien_nom", "nouveau_nom", "date_decision"])
    writer.writerows(data)

print("✅ Fichier modifications_noms.csv généré avec succès.")
