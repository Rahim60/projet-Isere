import requests
from bs4 import BeautifulSoup
import csv
import re

# Configuration
url = "https://fr.wikipedia.org/wiki/Liste_des_anciennes_communes_de_l%27Is%C3%A8re"
output_file = "transferts_communes.csv"

def clean_text(text):
    """Nettoyer le texte des notes et références"""
    return re.sub(r'\[.*?\]', '', text).strip()

def extract_communes(cell):
    """Extraire les communes d'une cellule TD"""
    text = re.sub(r'\([^)]*\)', '', cell.get_text())  # Supprimer les (1 commune)
    communes = [clean_text(c) for c in text.split(',')]
    return [c for c in communes if c]

print("⏳ Téléchargement de la page...")
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, "html.parser")
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")
    exit()

# Recherche du tableau cible
print("🔍 Recherche du tableau des transferts...")
target_table = None


for table in soup.find_all("table", class_="wikitable"):
    headers = [th.get_text(" ", strip=True).lower() for th in table.find_all("th")]
    required_headers = [
        "département d'origine",
        "département de rattachement",
        "communes concernées"
    ]
    if all(any(h in header for header in headers) for h in required_headers):
        target_table = table
        break

if not target_table:
    print("❌ Tableau des transferts non trouvé")
    exit()

# Extraction des données
print("📊 Extraction des données...")
data = []

for row in target_table.find_all("tr")[1:]:  # Skip header row
    cols = row.find_all("td")
    if len(cols) < 4:
        continue

    try:
        departement_origine = clean_text(cols[0].get_text())
        departement_rattachement = clean_text(cols[1].get_text())
        communes = extract_communes(cols[2])
        decision = clean_text(cols[3].get_text())

        # Extraire les années (ex: "1967", "1968", "1852")
        years = re.findall(r'\b(?:18|19|20)\d{2}\b', decision)
        unique_years = sorted(set(years))
        annees = ", ".join(unique_years) if unique_years else "Année inconnue"

        # Extraire une date complète (ex: "5 mars 1971")
        date_match = re.search(r'\d{1,2}\s+\w+\s+\d{4}', decision)
        date = date_match.group(0) if date_match else "Date inconnue"

        data.append({
            "Département d'origine": departement_origine,
            "Département de rattachement": departement_rattachement,
            "Nombre de communes": len(communes),
            "Communes concernées": ", ".join(communes[:3]) + ("..." if len(communes) > 3 else ""),
            "Toutes les communes": ", ".join(communes),
            "Date": date,
            "Années de décision": annees,
            "Décision complète": decision
        })
    except Exception as e:
        print(f"⚠️ Erreur traitement ligne: {e}")

# Export CSV
print(f"💾 Sauvegarde dans {output_file}...")
try:
    with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
        fieldnames = [
            "Département d'origine",
            "Département de rattachement",
            "Nombre de communes",
            "Communes concernées",
            "Toutes les communes",
            "Date",
            "Années de décision",
            "Décision complète"
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

    print(f"✅ {len(data)} transferts enregistrés avec succès")
    print(f"📋 Exemple de données:")
    for i, item in enumerate(data):
        print(f"\nTransfert {i+1}:")
        print(f"- De: {item['Département d\'origine']}")
        print(f"- Vers: {item['Département de rattachement']}")
        print(f"- Communes: {item['Communes concernées']}")
        print(f"- Date: {item['Date']}")
        print(f"- Années: {item['Années de décision']}")
except Exception as e:
    print(f"❌ Erreur lors de l'export CSV: {e}")
