import { useEffect } from 'react';

export default function Commune({ onLoaded }) {
  useEffect(() => {
    fetch("https://geo.api.gouv.fr/departements/38/communes?fields=nom&format=json")
    .then((response) => {
        if (!response.ok) throw new Error("Erreur de chargement des communes");
        return response.json();
      })
    .then((data) => {
        if (onLoaded) onLoaded(data); // Transmet les communes vers le parent
      })
      .catch((error) => console.error("Erreur :", error));
  });

  return null; // ne rien afficher visuellement
}
