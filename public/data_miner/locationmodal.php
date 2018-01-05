<?php
header('Content-type: application/json');
include_once("helper.php");
?>
<?php if (!empty($_POST['modalid'])):
  $title = 'Add Location';
  $location = null;
  $modalid = $_POST['modalid'];
  $hiddenInput = '';

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
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="name">Name:</label>
                  <input type="text" class="form-control" id="name" name="name" value="<?php echo (!empty($location))?$location->name:'';?>">
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="studio_id">Studio ID:</label>
                  <input type="text" class="form-control" id="studio_id" name="studio_id" value="<?php echo (!empty($location))?$location->studio_id:'';?>">
                  <p class="help-block">Unique Studio ID, Usually found in URL.</p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="site">Web Site:</label>
                  <select class="form-control" name="site">
                    <?php foreach (getSiteOption() as $key => $value): ?>
                      <option value="<?php echo $key; ?>" <?php echo (!empty($location) && $key == $location->site)?'selected':'';?> ><?php echo $value; ?></option>
                    <?php endforeach; ?>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="timezone">Timezone:</label>
                  <select class="form-control" name="timezone">
                    <?php foreach (getTimezoneOption() as $key => $value): ?>
                      <option value="<?php echo $key; ?>" <?php echo (!empty($location) && $key == $location->timezone)?'selected':'';?> ><?php echo $value; ?></option>
                    <?php endforeach; ?>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label for="location">Location:</label>
                  <input type="text" class="form-control" id="location" name="location" value="<?php echo (!empty($location))?$location->location:'';?>">
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label for="region">Region Subdomain:</label>
                  <input type="text" class="form-control" id="region" name="region" value="<?php echo (!empty($location))?$location->region:'';?>">
                  <p class="help-block">Only applicable for Flywheel, must be all lowercase, no space and special characters.</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label for="seat">Seat:</label>
                  <input type="text" class="form-control" id="seat" name="seat" value='<?php echo (!empty($location))?$location->seat:'';?>'>
                  <p class="help-block">Seat must be number except Barry's, Barry's Bootcamp needs special format like this {"seats":25,"floors":32}</p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label for="city">City:</label>
                  <input type="text" class="form-control" id="city" name="city" value="<?php echo (!empty($location))?$location->city:'';?>">
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label for="state">State:</label>
                  <select class="form-control" name="state">
                    <?php foreach (getStates() as $key => $value): ?>
                      <option value="<?php echo $key; ?>" <?php echo (!empty($location) && $key == $location->state)?'selected':'';?> ><?php echo $value; ?></option>
                    <?php endforeach; ?>
                  </select>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label for="zipcode">ZIPCODE:</label>
                  <input type="text" class="form-control" id="zipcode" name="zipcode" value="<?php echo (!empty($location))?$location->zipcode:'';?>">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="status">Location Status:</label>
              <div class="checkbox">
                <label><input type="checkbox" name="status" value="1" <?php echo (!empty($location) && $location->status == 0)?'':'checked';?>>Enabled</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="response">

            </div>
            <button type="button" class="btn btn-default" data-action="saveLocation">Save</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
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
