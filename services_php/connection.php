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
