import json
import csv

# Charger les données JSON
with open("creations_retablissements_isere.json", "r", encoding="utf-8") as f:
    creations_retablissements = json.load(f)

# Nom du fichier CSV de sortie
csv_file = "creations_retablissements_isere.csv"

# Ouvrir le fichier CSV en mode écriture
with open(csv_file, mode='w', newline='', encoding="utf-8") as f:
    writer = csv.writer(f)

    # Écrire les en-têtes du CSV
    writer.writerow(['commune_creee', 'commune_affectee', 'mode_creation', 'date_decision', 'date_effet'])

    # Écrire les données
    for item in creations_retablissements:
        commune_creee = item['commune_creee']
        commune_affectee = ", ".join(item['commune_affectee'])  # Si plusieurs communes affectées, les joindre avec une virgule
        mode_creation = item['mode_creation']
        date_decision = item['date_decision']
        date_effet = item['date_effet']
        
        writer.writerow([commune_creee, commune_affectee, mode_creation, date_decision, date_effet])

print(f"Export terminé! Fichier CSV généré : {csv_file}")
