<?php
require("connection.php");
header("Content-Type: application/json; charset=UTF-8");
// Autoriser l'accès depuis n'importe quelle origine (à adapter selon vos besoins)
header("Access-Control-Allow-Origin: *");

// Autoriser certaines méthodes HTTP (GET, POST, etc.)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Autoriser certains en-têtes
header("Access-Control-Allow-Headers: Content-Type, Authorization");

try {
    // Connexion à la base de données avec PDO
    $con = connectionPDO(); // Voir connection.php

    $name = validateInput($_GET["name"]);
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
    SELECT 
        'Création' AS type_evenement,
        commune_nouv AS commune_concernee,
        date_decision AS date_evenement,
        CONCAT('Type : ', typeCreation, ' | Sources : ', villes) AS details_supplementaires,
        REGEXP_SUBSTR(date_decision, '[0-9]{4}') AS annee_approx
    FROM Creation_utf8mb4
    WHERE commune_nouv = :name OR villes LIKE '%:name%'

    UNION ALL

    SELECT 
        'Modification de nom' AS type_evenement,
        nouv AS commune_concernee,
        date_decision AS date_evenement,
        CONCAT('Ancien nom : ', ancien) AS details_supplementaires,
        REGEXP_SUBSTR(date_decision, '[0-9]{4}') AS annee_approx
    FROM ModificationNom_utf8mb4
    WHERE ancien = :name OR nouv = :name

    UNION ALL

    SELECT 
        'Transfert' AS type_evenement,
        communes AS commune_concernee,
        date AS date_evenement,
        CONCAT('Département : ', dept_origine, ' → ', dept_rattachment) AS details_supplementaires,
        REGEXP_SUBSTR(date, '[0-9]{4}') AS annee_approx
    FROM Transferts_utf8mb4
    WHERE communes LIKE '%:name%'
) AS timeline
ORDER BY 
    CASE WHEN annee_approx IS NOT NULL THEN 0 ELSE 1 END,
    annee_approx,
    date_evenement;"
);

    $stmt->bindParam(":name", $name);
    if($stmt->execute()){
        $com = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status"=>"succes", "data"=>$com]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
