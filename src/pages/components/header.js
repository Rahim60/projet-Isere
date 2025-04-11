export default function Header() {
    return (
      <header 
        className="py-8 text-white text-center"
        style={{ 
          backgroundColor: '#1b5cca', // Bleu turquoise
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="container">
          <h1 className="m-0 fs-4 fw-normal">Recherche sur les communes de l'Isère</h1>
        </div>
      </header>
    );
  };
  
  
