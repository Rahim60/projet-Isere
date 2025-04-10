<?php
ob_start(); // commence un tampon de sortie pour empêcher l'envoi prématuré
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Autoriser certaines méthodes HTTP (GET, POST, etc.)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Autoriser certains en-têtes
header("Access-Control-Allow-Headers: Content-Type");

require("connection.php");

try {
    // Connexion à la base de données avec PDO
    $con = connectionPDO(); // Voir connection.php

    $name = validateInput($_GET["name"]);
    $year = isset($_GET["year"])?validateInput($_GET["year"]):null;
    if (empty($name)) {
        echo json_encode(["status" => "error", "message" => "Le paramètre 'name' est obligatoire"]);
        exit();
    }

    $stmt = $con->prepare("
SELECT 
    type_evenement,
    commune_concernee,
    date_evenement,
    details_supplementaires,
    annee_approx
FROM (
    -- Événements de création
    SELECT 
        'Création' AS type_evenement,
        commune_nouv AS commune_concernee,
        date_decision AS date_evenement,
        CONCAT('Type : ', typeCreation, ' | Sources : ', villes) AS details_supplementaires,
        REGEXP_SUBSTR(date_decision, '[0-9]{4}') AS annee_approx
    FROM Creation_utf8mb4
    WHERE 
        (commune_nouv = :name OR villes LIKE CONCAT('%', :name, '%'))
        AND (:annee IS NULL OR REGEXP_SUBSTR(date_decision, '[0-9]{4}') <= :annee)

    UNION ALL

    -- Événements de modification de nom
    SELECT 
        'Modification de nom' AS type_evenement,
        nouv AS commune_concernee,
        date_decision AS date_evenement,
        CONCAT('Ancien nom : ', ancien) AS details_supplementaires,
        REGEXP_SUBSTR(date_decision, '[0-9]{4}') AS annee_approx
    FROM ModificationNom_utf8mb4
    WHERE 
        (ancien = :name OR nouv = :name)
        AND (:annee IS NULL OR REGEXP_SUBSTR(date_decision, '[0-9]{4}') <= :annee)

    UNION ALL

    -- Événements de transfert
    SELECT 
        'Transfert' AS type_evenement,
        communes AS commune_concernee,
        date AS date_evenement,
        CONCAT('Département : ', dept_origine, ' → ', dept_rattachment) AS details_supplementaires,
        REGEXP_SUBSTR(date, '[0-9]{4}') AS annee_approx
    FROM Transferts_utf8mb4
    WHERE 
        (communes LIKE CONCAT('%', :name, '%'))
        AND (:annee IS NULL OR REGEXP_SUBSTR(date, '[0-9]{4}') <= :annee)
) AS timeline
ORDER BY 
    CASE WHEN annee_approx IS NOT NULL THEN 0 ELSE 1 END,
    annee_approx,
    date_evenement;"
);


    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":annee", $year);

    if($stmt->execute()){
        $com = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status"=>"success", "data"=>$com]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
ob_end_flush(); // envoie la sortie une fois tous les headers définis
?>
