<?php
function connectionPDO() {
    $host = "mi-mariadb.univ-tlse2.fr";
    $dbname = "24_2L3_rahman_djobo";
    $username = "rahman.djobo";
    $password = "Ram60#nouveau";

    return new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
}
function validateInput($data) {
    return trim(htmlspecialchars($data));
}

?>
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
        AND (:annee IS NULL OR REGEXP_SUBSTR(date_decision, '[0-9]{4}') = :annee)

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
        AND (:annee IS NULL OR REGEXP_SUBSTR(date_decision, '[0-9]{4}') = :annee)

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
        AND (:annee IS NULL OR REGEXP_SUBSTR(date, '[0-9]{4}') = :annee)
) AS timeline
ORDER BY 
    CASE WHEN annee_approx IS NOT NULL THEN 0 ELSE 1 END,
    annee_approx,
    date_evenement;