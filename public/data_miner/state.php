<?php
header('Content-type: application/json');
$return = ['status'=>false];
include_once("config.php");
if (!empty($_POST)) {
    $id = $_POST['id'];
    $status = $_POST['status'];
    $old_studio = $conn->prepare('UPDATE studios SET status=:status WHERE id=:id');
    $old_studio->bindParam(':id',$id);
    $old_studio->bindParam(':status',$status);
    if($old_studio->execute()){
      $return['status']=true;
    };
  echo json_encode($return);
}
?>
