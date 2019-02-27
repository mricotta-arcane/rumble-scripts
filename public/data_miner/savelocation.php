<?php
header('Content-type: application/json');
include_once("config.php");
include_once("helper.php");
$return = ['status'=>false,'message'=>'Check errors'];

if(!empty($_POST)){

  if (empty($_POST['name'])) {
    $return['errors']['name'][]="Name is required";
  }
  if (empty($_POST['studio_id'])) {
    $return['errors']['studio_id'][]="Studio ID is required";
  }
  if (empty($_POST['location'])) {
    $return['errors']['location'][]="Location is required";
  }
  if (empty($_POST['seat'])) {
    $return['errors']['seat'][]="Seat is required";
  } else {
    $seat = $_POST['seat'];
    if ($_POST['site']=='Barrys' || $_POST['site']=='BarrysInternational') {
      $seatobj = json_decode($seat);
      if(empty($seatobj->seats) || empty($seatobj->floors)){
        $return['errors']['seat'][]='Please use {"seats":25,"floors":32} format for Barrys location';
      }
    } else {
      if(!is_numeric($seat)){
        $return['errors']['seat'][]='Seat must be numeric';
      }
    }
  }

  if ($_POST['site']=='Flywheel' && empty($_POST['region'])) {
    $return['errors']['region'][]='Region is required for Flywheel';
  }

  if(empty($return['errors'])){
    if(empty($_POST['id'])){
      $location = $conn->prepare('INSERT INTO studios (studio_id,location,site,name,status,timezone,seat,region,city,state,zipcode) VALUES (:studio_id,:location,:site,:name,:status,:timezone,:seat,:region,:city,:state,:zipcode) ');
    } else {
      $id = $_POST['id'];
      if ($check = checkById($id,$conn)) {
        $location = $conn->prepare('UPDATE studios SET studio_id=:studio_id,location=:location,site=:site,name=:name,status=:status,timezone=:timezone,seat=:seat,region=:region,city=:city,state=:state,zipcode=:zipcode WHERE id=:id');
        $location->bindParam(':id',$_POST['id'],PDO::PARAM_INT);
      } else {
        $return['errors']['name'][]='Location is not found in DB';
      }
    }
    $param = $_POST;
    if(empty($param['status'])){
      $param['status'] = 0;
    }
    if(empty($param['city'])){
      $param['city'] = null;
    }
    if(empty($param['zipcode'])){
      $param['zipcode'] = null;
    }
    foreach ($param as $key => &$value) {
      $location->bindParam(':'.$key, $value);
    }
    try {
      $location->execute();
      $return = ['status'=>true,'message'=>'Location saved'];
    } catch (Exception $e) {
      var_dump($e->getMessage());
    }
  }
}

echo json_encode($return);
?>
