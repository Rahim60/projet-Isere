import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Resultat from './components/resultat';
import Commune from './components/commune';
import Header from './components/header';

// Chargement dynamique de la carte (désactivé pour le rendu côté serveur)
const Map = dynamic(() => import('./components/map'), { ssr: false });

export default function Home() {
  // États pour gérer les données de l'application
  const [searchCommune, setSearchCommune] = useState(''); // Stocke la commune recherchée
  const [searchYear, setSearchYear] = useState(''); // Stocke l'année recherchée
  const [geojsonData, setGeojsonData] = useState(null); // Données GeoJSON des communes
  const [selectedFeature, setSelectedFeature] = useState(null); // Commune sélectionnée sur la carte
  const [message, setMessage] = useState(''); // Messages d'information/erreur
  const [historiqueRecherche, setHistoriqueRecherche] = useState(false); // Flag pour recherche historique
  const [communesActuelles, setCommunesActuelles] = useState([]); // Liste des communes actuelles
  const [hasSearched, setHasSearched] = useState(false); // Indique si une recherche a été effectuée

  // Effet pour charger les données GeoJSON au montage du composant
  useEffect(() => {
    fetch("https://france-geojson.gregoiredavid.fr/repo/departements/38-isere/communes-38-isere.geojson")
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("Erreur de chargement du GeoJSON :", err));
  }, []);

  // Effet pour réinitialiser l'état de recherche quand les critères changent
  useEffect(() => {
    setHasSearched(false);
  }, [searchCommune, searchYear]);

  
   //Gère la soumission du formulaire de recherche
   
  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);

    // Vérifie que les données GeoJSON sont chargées
    if (!geojsonData) return;

    // Recherche la commune dans les données GeoJSON
    const found = geojsonData.features.find(f =>
      f.properties.nom.toLowerCase() === searchCommune.toLowerCase()
    );

    if (found) {
      // Cas où la commune est trouvée
      setSelectedFeature(found);
      setHistoriqueRecherche(false);
      setMessage('');
    } else {
      // Cas où la commune n'est pas trouvée
      setSelectedFeature(null);

      // Vérifie si la commune existe dans la liste actuelle
      const existeActuelle = communesActuelles.find(c =>
        c.nom.toLowerCase() === searchCommune.toLowerCase()
      );

      if (existeActuelle) {
        // Commune existe mais sans historique
        setHistoriqueRecherche(false);
        setMessage("Cette commune existe actuellement, mais aucun événement n'est lié à son historique.");
      } else {
        // Commune n'existe pas actuellement
        setHistoriqueRecherche(true);
        setMessage("Cette commune n'existe pas dans l'état actuel. Une recherche historique est en cours...");
      }

      // Efface le message après 4 secondes
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <>
      {/* En-tête de l'application */}
      <Header/>
      
      {/* Contenu principal */}
      <div className="container py-5 d-flex flex-column align-items-center">

        {/* Formulaire de recherche */}
        <form
          onSubmit={handleSearch}
          className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 mb-4 p-3 bg-white rounded shadow-sm"
          style={{ maxWidth: '800px', width: '100%' }}
        >
          {/* Champ de saisie pour la commune */}
          <input
            type="text"
            className="form-control"
            placeholder="Nom de la commune"
            value={searchCommune}
            onChange={(e) => setSearchCommune(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          
          {/* Champ de saisie pour l'année */}
          <input
            type="text"
            className="form-control"
            placeholder="Année (ex : 2022)"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            style={{ maxWidth: '150px' }}
          />
          
          {/* Bouton de soumission */}
          <button type="submit" className="btn btn-primary px-4">
            Rechercher
          </button>
        </form>

        {/* Affichage des messages d'information/erreur */}
        {message && (
          <div className="alert alert-warning fade show text-center w-75 shadow-sm" role="alert">
            {message}
          </div>
        )}

        {/* Carte interactive */}
        <div 
          className="card border-0 shadow-lg mb-5 hover-lift" 
          style={{ width: '800px' }}
        >
          <div 
            className="card-img-top" 
            style={{ 
              height: '400px', 
              borderTopLeftRadius: '0.5rem', 
              borderTopRightRadius: '0.5rem', 
              overflow: 'hidden' 
            }}
          >
            <Map geojsonData={geojsonData} selectedFeature={selectedFeature} />
          </div>

          {/* Affichage des informations de la commune sélectionnée */}
          {(selectedFeature || historiqueRecherche) && (
            <div className="card-body bg-light p-4" style={{ borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
              <h5 className="card-title text-primary mb-3">Commune sélectionnée</h5>
              <div className="d-flex justify-content-between">
                <p className="card-text mb-2">
                  <strong>Nom :</strong> {selectedFeature ? selectedFeature.properties.nom : searchCommune}
                </p>
                <p className="card-text mb-2">
                  <strong>Année :</strong> {searchYear || "Non spécifiée"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Affichage des résultats de recherche */}
        {hasSearched && (
          <div className="w-100 px-5">
            <Resultat 
              nomCommune={searchCommune} 
              communesActuelles={communesActuelles} 
              annee={searchYear} 
            />
          </div>
        )}

        {/* Chargement des communes actuelles (composant invisible) */}
        <Commune onLoaded={(data) => setCommunesActuelles(data)} />

        {/* Styles CSS personnalisés */}
        <style jsx>{`
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          body {
            background-color: #f8f9fa;
          }
        `}</style>
      </div>
    </> 
  );
}
