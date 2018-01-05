<?php
  header('Content-type: application/json');
  include_once("config.php");
  $studios = $conn->prepare('SELECT * FROM studios WHERE status = 1 AND studio_id IS NOT NULL order by site asc, studio_id asc ');
  $studios->execute();
  $studios->setFetchMode(PDO::FETCH_OBJ);
  $list = [];
  foreach ($studios as $studio) {
    if (!empty($studio->seat)) {
      $list[$studio->site][]=$studio;
    }
  }
  $list_json = 'exports.all='.json_encode($list);
  $location_file = fopen("locations.js", "w");
  fwrite($location_file,$list_json);
  fclose($location_file);

  $studios = $conn->prepare('SELECT * FROM studios order by site asc, studio_id asc ');
  $studios->execute();
  $studios->setFetchMode(PDO::FETCH_OBJ);
  $list = [];
  foreach ($studios as $studio) {
    $list[$studio->site][]=$studio;
  }
  $list_json = 'exports.all='.json_encode($list);
  $location_file = fopen("locations_all.js", "w");
  fwrite($location_file,$list_json);
  fclose($location_file);
  $return['status']=true;

  echo json_encode($return);
?>
