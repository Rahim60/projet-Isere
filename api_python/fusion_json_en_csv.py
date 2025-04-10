import json
import csv

# Charger le fichier JSON
with open("fusions_isere.json", "r", encoding="utf-8") as f:
    fusions_isere = json.load(f)

# Ouvrir un fichier CSV pour l'écriture
with open("fusions_isere.csv", "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ['nouvelle_commune', 'communes_fusionnees', 'regime', 'date_decision', 'date_effet']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    # Écrire l'en-tête du CSV
    writer.writeheader()

    # Écrire les lignes de données dans le CSV
    for fusion in fusions_isere:
        # Joindre les anciennes communes avec une virgule
        fusion['communes_fusionnees'] = ", ".join(fusion['communes_fusionnees'])
        writer.writerow(fusion)

print("Export terminé! Fichier CSV généré : fusions_isere.csv")
