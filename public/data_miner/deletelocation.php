<?php
header('Content-type: application/json');
include_once("config.php");
include_once("helper.php");
$return = ['status'=>false,'message'=>'Check errors'];

if(!empty($_POST)){
  $delete = $conn->prepare('DELETE FROM studios WHERE id=:id');
  $id = $_POST['id'];
  $delete->bindParam(':id', $id);
  try {
    $delete->execute();
    $return = ['status'=>true,'message'=>'Location Deleted'];
  } catch (Exception $e) {
    var_dump($e->getMessage());
  }
}

echo json_encode($return);
?>
