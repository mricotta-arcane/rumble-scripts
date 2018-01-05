<?php
  include_once("config.php");
  include_once("helper.php");
  // $name = 'seats';
  // $name = 'studios';
  if ($_POST) {
    $name = $_POST['name'];
    $locations = $conn->prepare('INSERT INTO raw (name,data,created_at) VALUES (:name,:data,NOW())');
    $locations->bindParam(':name',$name);
    $locations->bindParam(':data',$_POST['data']);
    $locations->execute();
  }

  // Processs;
  // $locations = $conn->prepare('SELECT * FROM locations');
  $raw = $conn->prepare('SELECT * FROM raw WHERE name = :name order by created_at desc limit 1');
  $raw->bindParam(':name',$name);
  $raw->execute();
  $row = $raw->fetch(PDO::FETCH_OBJ);
  $data = $row->data;
  switch ($name) {
    case 'studios':
      // Loop Sites
      foreach (json_decode($data) as $site => $studios) {
        foreach ($studios as $studio) {
          if(!empty($studio->id)){
            if(checkByStudioId($studio->id,$site,$conn)){
              $old_studio = $conn->prepare('UPDATE studios SET location=:location,name=:name,timezone=:timezone,seat=:seat,region=:region WHERE studio_id=:studio_id AND site=:site');
              $old_studio->bindParam(':studio_id',$studio->id);
              $old_studio->bindParam(':location',$studio->location);
              $old_studio->bindParam(':site',$site);
              $old_studio->bindParam(':name',$studio->name);
              $old_studio->bindParam(':timezone',$studio->timezone);

              if (!empty($studio->seat)) {
                $old_studio->bindParam(':seat',$studio->seat);
              }
              if (!empty($studio->region)) {
                $old_studio->bindParam(':region',$studio->region);
              }
              $old_studio->execute();
            } else {
              $new_studio = $conn->prepare('INSERT INTO studios (studio_id,location,site,name,status,timezone,seat,region) VALUES (:studio_id,:location,:site,:name,:status,:timezone,:seat,:region) ');
              $new_studio->bindParam(':studio_id',$studio->id);
              $new_studio->bindParam(':location',$studio->location);
              $new_studio->bindParam(':site',$site);
              $new_studio->bindParam(':name',$studio->name);
              $new_studio->bindParam(':status',$studio->status);
              $new_studio->bindParam(':timezone',$studio->timezone);
              if (!empty($studio->seat)) {
                $new_studio->bindParam(':seat',$studio->seat);
              } else {
                $new_studio->bindParam(':seat',$a='0');
              }
              if (!empty($studio->region)) {
                $new_studio->bindParam(':region',$studio->region);
              } else {
                $new_studio->bindParam(':region',$a='');
              }
              $new_studio->execute();
            }
          }
        }
      }
      break;
    default:
      foreach (json_decode($data) as $site => $studios) {
        foreach ($studios as $studio) {
          if(!empty($studio->studio_id)){
            $old_studio = $conn->prepare('UPDATE studios SET seat=:seat WHERE studio_id=:studio_id AND site=:site');
            if (is_object($studio->seat)) {
              $studio->seat = json_encode($studio->seat);
            }
            $old_studio->bindParam(':studio_id',$studio->studio_id);
            $old_studio->bindParam(':site',$site);
            $old_studio->bindParam(':seat',$studio->seat);
            $old_studio->execute();
          }
        }
      }
      # code...
      break;
  }

  // var_dump($row);
  //
  // $locations->setFetchMode(PDO::FETCH_ASSOC);
?>
<pre>
  <?php // var_dump(json_decode($data)); ?>
</pre>
