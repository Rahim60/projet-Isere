import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Resultat from './components/resultat';
import Commune from './components/commune';

const Map = dynamic(() => import('./components/map'), { ssr: false });

export default function Home() {
  const [searchCommune, setSearchCommune] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [geojsonData, setGeojsonData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [message, setMessage] = useState('');
  const [historiqueRecherche, setHistoriqueRecherche] = useState(false);
  const [communesActuelles, setCommunesActuelles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Charger les données GeoJSON du département de l'Isère au chargement
  useEffect(() => {
    fetch("https://france-geojson.gregoiredavid.fr/repo/departements/38-isere/communes-38-isere.geojson")
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("Erreur de chargement du GeoJSON :", err));
  }, []);

  // Réinitialiser le résultat dès que l'utilisateur change les champs
  useEffect(() => {
    setHasSearched(false);
  }, [searchCommune, searchYear]);

  // Gérer la soumission du formulaire de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);

    if (!geojsonData) return;

    const found = geojsonData.features.find(f =>
      f.properties.nom.toLowerCase() === searchCommune.toLowerCase()
    );

    if (found) {
      setSelectedFeature(found);
      setHistoriqueRecherche(false);
      setMessage('');
    } else {
      setSelectedFeature(null);

      const existeActuelle = communesActuelles.find(c =>
        c.nom.toLowerCase() === searchCommune.toLowerCase()
      );

      if (existeActuelle) {
        setHistoriqueRecherche(false);
        setMessage("Cette commune existe actuellement, mais aucun événement n'est lié à son historique.");
      } else {
        setHistoriqueRecherche(true);
        setMessage("Cette commune n'existe pas dans l'état actuel. Une recherche historique est en cours...");
      }

      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center py-4">

      {/* Formulaire de recherche */}
      <form 
        onSubmit={handleSearch} 
        className="d-flex justify-content-center mb-4" 
        style={{ gap: '20px' }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Nom de la commune"
          value={searchCommune}
          onChange={(e) => setSearchCommune(e.target.value)}
          style={{ width: '250px' }}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Année (ex : 2022)"
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
          style={{ width: '150px' }}
        />
        <button type="submit" className="btn btn-primary">
          Rechercher
        </button>
      </form>

      {/* Message d'information ou d'erreur */}
      {message && (
        <div className="alert alert-danger text-center w-75" role="alert">
          {message}
        </div>
      )}

      {/* Affichage de la carte */}
      <div 
        className="card border-0 rounded shadow-lg mb-5" 
        style={{ 
          width: '800px',
          transform: 'translateY(-5px)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        <div 
          className="card-img-top" 
          style={{ 
            height: '400px',
            borderTopLeftRadius: '0.375rem',
            borderTopRightRadius: '0.375rem',
            overflow: 'hidden'
          }}
        >
          <Map geojsonData={geojsonData} selectedFeature={selectedFeature} />
        </div>

        {(selectedFeature || historiqueRecherche) && (
          <div 
            className="card-body bg-light p-4" 
            style={{
              borderBottomLeftRadius: '0.375rem',
              borderBottomRightRadius: '0.375rem',
              marginTop: '10px'
            }}
          >
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

      {/* Tableau de résultats après recherche */}
      {hasSearched && (
        <div className="w-100 px-5">
          <Resultat 
            nomCommune={searchCommune} 
            communesActuelles={communesActuelles} 
            annee={searchYear} 
          />
        </div>
      )}

      {/* Chargement silencieux des communes actuelles */}
      <Commune onLoaded={(data) => {
        setCommunesActuelles(data);
      }} />
    </div>
  );
}
