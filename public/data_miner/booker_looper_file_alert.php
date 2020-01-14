<?php
include_once("helper.php");
function bookerLooperFileAlert(){
  $dir = '/var/www/html2/rumble-scripts/public/booker_looper/';
  $filename = 'booker_looper.txt';
  $file = $dir.$filename;
  $filemtime = filemtime($file);
  $current = time();
  $checkHour = $current-2*60*60;
  // $checkHour = $current-15*60;
  $check = false;
  $lastRow = $successtime = '';
  $lastRowArray = [];
  if($filemtime<$checkHour){
    $check = true;
    $contents = file($file);
    $lastRow = trim(end($contents));
    if(strpos($lastRow, 'Mail') !== false){
      $lastRow = trim($contents[count($contents)-2]);
    }
    $lastRowArray = explode(' | ',$lastRow);
    if(count($lastRowArray)>1){
      $successtime = current($lastRowArray);
      $content = "<p>Last successful run at: $successtime</p>";
      // $content .= "
      // <p>Check: ".getDateFromTime($checkHour)."</p>
      // <p>Ran: ".getDateFromTime($current)."</p>
      // <p>File: ".getDateFromTime($filemtime)."</p>
      // ";
      mailer(
        ['support@arcanestrategies.com'],'Medium Priority: Rumble Class Reopener Failing',$content);
    }
  }
}

function attendanceTodayAlert(){
  $dir = '/var/www/html2/rumble-scripts/zflogs/attendance/';
  $locations = ['FlatironChelsea','NoHo','UESStudio4','FiDi','WeHo','RumbleDC','CenterCity','Brooklyn',
		'TribecaBoxing',
		'PaloAltoBoxing',
		'FlatironChelseaTraining',
		'MarinaTraining',
		//'MarinaBoxing',
		//'UESTraining',
		//'TribecaBoxingPrivate',
		//'FlatironChelseaTrainingPrivate',
		//'PaloAltoBoxingPrivate',
		//'MarinaTrainingPrivate',
		];
  foreach($locations as $location){
	$filename = 'attendance_'.$location.'_today.csv';
	  $file = $dir.$filename;
	  $filemtime = filemtime($file);
	  $current = time();
	  $checkHour = $current-30**60;
	  $check = false;
	  $successtime = '';
	  if($filemtime<$checkHour){
		$check = true;
		$content = "<p>ZingFit threw an error attempting to export the daily attendance report for $location.  This means that the Class Map/Calendar might have outdated enrollment numbers.  The last successful run was at: $filemtime.  The next run is within 15 minutes</p>";
		//mailer(['support@arcanestrategies.com','chris.merritt-lish@rumble-boxing.com'],'WARNING: ZingFit Error on '.$location.' Daily Attendance Report',$content);
		mailer(['support@arcanestrategies.com'],'WARNING: ZingFit Error on '.$location.' Daily Attendance Report',$content);
	  }
  }
}
?>
<pre>
<?php
bookerLooperFileAlert(); 
attendanceTodayAlert();
?>
</pre>
