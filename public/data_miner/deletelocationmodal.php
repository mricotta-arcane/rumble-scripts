<?php
header('Content-type: application/json');
include_once("helper.php");
?>
<?php if (!empty($_POST['modalid'])):
  $title = 'Add Location';
  $location = null;
  $hiddenInput = '';
  $modalid = $_POST['modalid'];
  if (!empty($_POST['modaldata']) && $_POST['modaldata']!='undefined') {
    include_once("config.php");
    $modaldata = $_POST['modaldata'];
    $id = json_decode($modaldata)->id;
    if ($check = checkById($id,$conn)) {
      $location = $check->fetchObject();
      $title = 'Edit Location';
      $hiddenInput = '<input type="hidden" value="'.$location->id.'">';
    } else {
      $return = ['status'=>false];
      echo json_encode($return);
      die();
    }
  }
  ?>
  <?php ob_start(); ?>
  <div id="<?php echo $modalid ?>" class="modal fade " role="dialog">
    <div class="modal-dialog modal-lg">
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title"><?php echo $title ?></h4>
        </div>
        <form class="" action="#" method="post">
          <?php if (!empty($location)): ?>
            <input type="hidden" name="id" value="<?php echo (!empty($location))?$location->id:'';?>">
          <?php endif; ?>
          <div class="modal-body">
            Are you sure want to delete this location? <?php echo $location->site ?>: <?php echo $location->name ?>
          </div>
          <div class="modal-footer">
            <div class="response">
            </div>
            <button type="button" class="btn btn-danger" data-action="deleteLocation">Delete</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <?php
  $html = ob_get_clean();
  $return = ['status'=>true,'html'=>$html];
  ?>
<?php else: ?>
  <?php $return = ['status'=>false]; ?>
<?php endif; ?>
<?php echo json_encode($return); ?>
