<?php
// RuM313d@7a
// ALTER TABLE `studios` ADD `region` VARCHAR(255) NOT NULL AFTER `seat`;
// ALTER TABLE `studios` ADD `city` VARCHAR(255) NULL AFTER `region`, ADD `state` VARCHAR(255) NULL AFTER `city`, ADD `zipcode` VARCHAR(255) NULL AFTER `state`;
// CREATE TABLE `data_miner`.`logs` ( `id` BIGINT NOT NULL AUTO_INCREMENT ,  `site` VARCHAR(255) NOT NULL ,  `location_id` INT NOT NULL ,  `script_date` VARCHAR(255) NOT NULL ,  `name` VARCHAR(255) NOT NULL ,  `location` VARCHAR(255) NOT NULL ,  `Instructor` VARCHAR(255) NOT NULL ,  `class_date` VARCHAR(255) NOT NULL ,  `length` VARCHAR(255) NOT NULL ,  `seats` INT NOT NULL ,  `enrolled_seats` INT NOT NULL ,  `open_seats` INT NOT NULL ,  `treads` INT NOT NULL ,  `enrolled_treads` INT NOT NULL ,  `open_treads` INT NOT NULL ,  `class_id` INT NOT NULL ,    PRIMARY KEY  (`id`)) ENGINE = InnoDB;
  include_once("config.php");
  include_once("helper.php");
  $studios = $conn->prepare('SELECT * FROM studios order by site asc, studio_id asc ');
  $studios->execute();
  $studios->setFetchMode(PDO::FETCH_OBJ);
  $instructors = $conn->prepare('SELECT * FROM instructors order by site asc, instructor_id asc ');
  $instructors->execute();
  $instructors->setFetchMode(PDO::FETCH_OBJ);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
  <title>Data Miner</title>

  <!-- Bootstrap -->
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

  <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->
</head>
<body>
  <div class="container">
    <hr>
    <ul class="nav nav-tabs" role="tablist">
      <li role="presentation" class="active"><a href="#locations" aria-controls="locations" role="tab" data-toggle="tab">Locations</a></li>
      <!-- <li role="presentation"><a href="#instructors" aria-controls="instructors" role="tab" data-toggle="tab">Instructors</a></li> -->
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
      <div role="tabpanel" class="tab-pane active" id="locations">
        <h1>Locations</h1>
        <div class="">
          <a href="getzip.php" class="btn btn-success noform">Download all CSV ZIP</a>
          <a href="http://rumble-script.arcanestrategies.com/data_miner/log/scraper_summary.csv" class="btn btn-success noform">Download Summary</a>
          <a href="http://rumble-script.arcanestrategies.com/data_miner/log/class_summary.csv" class="btn btn-success noform">Download Class Summary</a>
          <a href="#" class="btn btn-success noform" data-action="modal" data-modalbody="locationmodal.php" data-modalid="addLocationModal">Add Location</a>
          <!-- <a href="getlocations.php" class="btn btn-success noform">Get locations</a> -->
        </div>
        <div class="text-right">
          After you're happy with the locations click
          <a href="#" class="btn btn-success noform" data-action="generateConfig">Generate Config</a>
          to apply changes to scraper
        </div>
        <?php if ($studios->rowCount() > 0): ?>
          <table class="table">
            <thead>
              <th>
                Site
              </th>
              <th>
                Name
              </th>
              <th>
                Location
              </th>
              <th>
                Seats
              </th>
              <th>
                Studio ID
              </th>
              <th>
                Timezone
              </th>
              <!-- <th>
                Status
              </th> -->
              <th>
                Action
              </th>
            </thead>
            <?php foreach ($studios as $studio): ?>
              <tr>
                <td>
                  <?php echo $studio->site ?>
                </td>
                <td>
                  <a href="<?php echo getUrl($studio); ?>" target="_blank">
                    <?php echo $studio->name ?>
                  </a>
                  <!-- http://rumble-script.arcanestrategies.com/data_miner/log/scraper_day_soulcycle_1023.csv -->
                  <div class="">
                    <a class="btn btn-xs btn-default" href="http://rumble-script.arcanestrategies.com/data_miner/log/scraper_day_<?php echo getSite($studio) ?>_<?php echo $studio->studio_id ?>.csv" target="_blank">Daily CSV</a>
                    <a class="btn btn-xs btn-default" href="http://rumble-script.arcanestrategies.com/data_miner/log/scraper_week_<?php echo getSite($studio) ?>_<?php echo $studio->studio_id ?>.csv" target="_blank">Weekly CSV</a>
                  </div>

                </td>
                <td>
                  <?php echo $studio->location ?>
                  <?php if (!empty($studio->region)): ?>
                    <br>
                    <small><?php echo $studio->region ?></small>
                  <?php endif; ?>
                  <?php if (!empty($studio->city) || !empty($studio->state) || !empty($studio->zipcode)): ?>
                    <br>
                    <small><?php echo $studio->city ?> <?php echo $studio->state ?> <?php echo $studio->zipcode ?></small>
                  <?php endif; ?>
                </td>
                <td>
                  <?php if (is_array($studio->seat)): ?>
                    <?php echo implode(',',$studio->seat) ?>
                  <?php else: ?>
                    <?php echo $studio->seat ?>
                  <?php endif; ?>
                </td>
                <td>
                  <?php echo $studio->studio_id ?>
                </td>
                <td>
                  <?php echo $studio->timezone ?>
                </td>
                <!-- <td>
                  <?php echo $studio->status ?>
                </td> -->
                <td>
                  <?php $modaldata = json_encode(['id'=>$studio->id]); ?>
                  <a href="#" class="btn btn-success btn-sm noform" data-action="modal" data-modaldata='<?php echo $modaldata; ?>' data-modalbody="locationmodal.php" data-modalid="addLocationModal">Edit Location</a>
                  <?php if ($studio->status == 1): ?>
                    <a href="#" class="btn btn-sm btn-danger noform" data-action="changeStudioState" data-status="0" data-id="<?php echo $studio->id ?>">Disable</a>
                  <?php else: ?>
                    <a href="#" class="btn btn-sm btn-warning noform" data-action="changeStudioState" data-status="1" data-id="<?php echo $studio->id ?>">Enable</a>
                  <?php endif; ?>
                  <a href="#" class="btn btn-danger btn-sm noform" data-action="modal" data-modaldata='<?php echo $modaldata; ?>' data-modalbody="deletelocationmodal.php" data-modalid="deleteLocationModal">Delete</a>
                </td>
              </tr>

            <?php endforeach; ?>

          </table>
        <?php else: ?>
          No location data found, Please run getLocations.js
        <?php endif; ?>
      </div>
      <div role="tabpanel" class="tab-pane" id="instructors">
        <h1>Instructors</h1>
        <div class="">
          <!-- <a href="instructor.php" class="btn btn-success noform" target="_blank">Batch Update</a> -->
        </div>
        <?php if ($instructors->rowCount() > 0): ?>
          <table class="table">
            <thead>
              <th>
                Site
              </th>
              <th>
                Name
              </th>
              <th>
                Instructor ID
              </th>
              <!-- <th>
                Data
              </th> -->
            </thead>
            <?php foreach ($instructors as $instructor): ?>
              <tr>
                <td>
                  <?php echo $instructor->site ?>
                </td>
                <td>
                  <a href="<?php echo getInstructorUrl($instructor); ?>" target="_blank">
                    <?php echo $instructor->name ?>
                  </a>
                </td>
                <td>
                  <?php echo $instructor->instructor_id ?>
                </td>
                <!-- <td>
                  <?php // echo $instructor->data ?>
                </td> -->
              </tr>
            <?php endforeach; ?>

          </table>
        <?php else: ?>
          No location data found, Please run getLocations.js
        <?php endif; ?>
      </div>
    </div>

  </div>

  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="//code.jquery.com/jquery-3.2.1.min.js"></script>
  <!-- Include all compiled plugins (below), or include individual files as needed -->
  <!-- Latest compiled and minified JavaScript -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
  <script src="app.js"></script>

</body>
</html>
