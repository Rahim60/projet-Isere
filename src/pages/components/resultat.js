import { useEffect, useState } from 'react';

export default function Resultat({ nomCommune, communesActuelles, annee }) {
  const [donnees, setDonnees] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!nomCommune) return;
    const anneeParam = annee ? annee : null;

    const fetchData = async () => {
      try {
        // Appel à l'API pour récupérer les événements liés à la commune
        const response = await fetch(`https://mi-phpmut.univ-tlse2.fr/~rahman.djobo/Humanite/timeline2.php?name=${nomCommune}&year=${anneeParam}`);
        const data = await response.json();

        // Si des données sont trouvées, on les stocke
        if (data?.data?.length > 0) {
          setDonnees(data.data);
          setErreur(null);
        } else {
          // Aucune donnée historique trouvée
          setDonnees([]);

          // Vérifie si la commune existe dans la liste actuelle
          const existeDansActuelles = Array.isArray(communesActuelles) && communesActuelles.find(c =>
            c.nom.toLowerCase().trim() === nomCommune.toLowerCase().trim()
          );

          if (existeDansActuelles) {
            setErreur("Cette commune existe actuellement, mais aucun événement n'est lié à son historique.");
          } else {
            setErreur("Cette commune ne correspond à aucun événement connu.");
          }
        }
      } catch (err) {
        console.error("Erreur :", err);
        setErreur("Une erreur est survenue lors de la récupération des données.");
      }
    };

    fetchData();
  }, [nomCommune, communesActuelles, annee]);

  // Ne rien afficher si aucun nom de commune n'est fourni
  if (!nomCommune) return null;

  return (
    <div className="w-100 mt-4">
      <h5 className="text-secondary">Informations supplémentaires sur la commune :</h5>

      {/* Message d'erreur ou d'information */}
      {erreur && (
        <div className={`alert ${erreur.startsWith("Cette commune existe") ? "alert-success" : "alert-danger"}`}>
          {erreur}
        </div>
      )}

      {/* Tableau des événements historiques */}
      {donnees.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                {Object.keys(donnees[0]).map((cle, index) => (
                  <th key={index}>{cle}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donnees.map((ligne, i) => (
                <tr key={i}>
                  {Object.values(ligne).map((valeur, j) => (
                    <td key={j}>{valeur}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
