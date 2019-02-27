<?php
print('Script Started'."\r\n");

/*
	Accepts argument of:
		(1) Start date M j, Y 
		(2) Optional end date (for a range) M j, Y ... Jan 1, 2018
		(3) No argument (today)
*/
$start = null;
$end = null;
	
if (defined('STDIN')) {
	$start = isset($argv[1])? $argv[1] : null;
	$end = isset($argv[2])? $argv[2] : null;
} else {
	$start = isset($_GET['start'])? $_GET['start'] : null;
	$end = isset($_GET['end'])? $_GET['end'] : null;
}

summaryWriter($start,$end);

function getTitle($rows){
	try {
	  $count = count($rows);
	  $half = (int)$count/2;
	  $firstRow = reset($rows);
	  $middleRow = $rows[$half];
	  $lastRow = end($rows);
	  $randomRow = $rows[rand(0,$count-1)];
	  $nameArray = [];
	  if(isset(rowIntoArray($firstRow)[2])){
		  $nameArray[] = rowIntoArray($firstRow)[2];
	  }
	  if(isset(rowIntoArray($middleRow)[2])){
		  $nameArray[] = rowIntoArray($middleRow)[2];
	  }
	  if(isset(rowIntoArray($lastRow)[2])){
		  $nameArray[] = rowIntoArray($lastRow)[2];
	  }
	  if(isset(rowIntoArray($randomRow)[2])){
		  $nameArray[] = rowIntoArray($randomRow)[2];
	  }
	  $c = array_count_values($nameArray);
	  $name = array_search(max($c), $c);
	  return $name;
	}  catch (Exception $e) {
		echo 'Caught exception: ',  $e->getMessage(), "\n";
	}
}

function summaryWriter($start=null,$end=null){
  include_once("config.php");
  include_once("helper.php");
  $studios = $conn->prepare('SELECT * FROM studios order by site asc, studio_id asc ');
  $studios->execute();
  $studios->setFetchMode(PDO::FETCH_OBJ);

  $studiotemp = [];
  foreach ($studios as $studio) {
    switch ($studio->site) {
      case 'Barrys':
        $site = 'barrysbootcamp';
        break;
			case 'BarrysInternational':
				$site = 'barrysbootcampInternational';
				break;
      case 'Flywheel':
        $site = 'flywheel';
        break;
      case 'SoulCycle':
        $site = 'soulcycle';
        break;

      default:
        # code...
        break;
    }
    $studiotemp[$site][$studio->studio_id] = $studio;
  }
  $studios = $studiotemp;
  $dir = '/var/www/html2/rumble-scripts/public/data_miner/log/';
  $flag = false;
  $title = '';
  $logs = scandir($dir,1);
  date_default_timezone_set("America/New_York");
  if(!isset($start)){
	$yesterday = date("M j, Y ", time() - 60 * 60 * 24);
  } else {
	$yesterday = date("M j, Y", strtotime($start));
  }
  $classes = [];

  if (!file_exists($dir.'scraper_summary.csv')) {
    $file = fopen($dir.'scraper_summary.csv', "a");
    $headers = 'Date;Website;Location ID;Location Name;Number Classes;Number Spots;Enrolled Spots;Open Spots;Full Classes;City;State;Zipcode';
    fwrite($file,$headers."\r\n");
  } else {
    $file = fopen($dir.'scraper_summary.csv', "a");
  }

  if (!file_exists($dir.'class_summary.csv')) {
    $fileClass = fopen($dir.'class_summary.csv', "a");
	$headersClass = 'Date;Website;Location ID;Location Name;Class Name;Instructor;Datetime;Spots;Enrolled Spots;Open Spots;City;State;Zipcode';
    fwrite($fileClass,$headersClass."\r\n");
  } else {
    $fileClass = fopen($dir.'class_summary.csv', "a");
  }

  
	$dates = [];
	if(isset($end)){
		$datediff = strtotime($end) - strtotime($start);
		$num_days = round($datediff / (60 * 60 * 24));
		for($i=0; $i<=$num_days; $i++){
			// In the first iteration, $yesterday = $start, so we want to add (i) # days to $start
			$add = $i*(60 * 60 * 24);
			$today = date("M j, Y", strtotime($yesterday)+$add);
			$dd = date("M j, Y", strtotime($today));
			$dates[] = $dd;
		}
	} else {
		$dates[] = $yesterday;
	}
	foreach($logs as $log){
		if($log=='.'||$log=='..'){
			continue;
		}
		$classes = [];
		// If it's a day log, we'll use it
		$name = basename($log, ".csv").PHP_EOL;
		if(strpos($name, 'scraper_day') !== false){
			// find all data for yesterday.  we reverse the array for faster execution
			$contents = null;
			if(($contents = file($dir.$log))===FALSE||empty($contents)){
				continue;
			}			
			//foreach($dates as $yesterday){
				$rows = array_reverse($contents);
				$parts = explode('_',$name);
				$length = $parts[1];
				$website = $parts[2];
				$locationID = $parts[3];
				$title = getTitle($rows);
				foreach($rows as $k=>$row){
					if(strlen($row)==0||empty($row)){
						continue;
					}
					if(strpos($row,';;;')!==false){
						continue;
					}
					$r = explode(';',$row);
					$true = null;
					$full = 0;
					$yes2 = date('M d, Y',strtotime($yesterday));
					if(count($r)>=10 && (strpos($r[4],$yesterday)!==false||strpos($r[4],$yes2)!==false)) {
					  $time = $r[4];
					  if(validateDate($time)){
						if (trim($r[7]) == 'na') {
						  $r[7] = $r[6];
						}
						if (trim($r[8]) == 'na') {
						  $r[8] = 0;
						}
						if ($website == 'soulcycle') {
						  if (trim($r[1])=="COMMUNITY RIDE") {
							continue;
						  }
						}
						if ($website == 'barrysbootcamp' || $website == 'barrysbootcampInternational') {
						  if(!empty($r[12])){
							//$class_id = strtotime($r[12]); 
							$class_id = $r[12];
						  } else {
							$class_id = strtotime($r[4]);
						  }
						  if(!empty($class_id)&&$class_id!==null){
							if (trim($r[10]) == 'na') {
							  $r[10] = $r[9];
							}
							if (trim($r[11]) == 'na') {
							  $r[11] = 0;
							}
							$spots = (int)$r[6]+(int)$r[9];
							$enrolled = (int)$r[7]+(int)$r[10];
							//$open = (int)$r[8]+(int)$r[11];
							$open = $spots-$enrolled;
							if($open<0){
								$enrolled = $spots;
								$open = 0;
							}
							if(!empty($r[13])){
							  $true = $r[13];
							}
						  }
						} else {
						  $class_id = trim($r[9]);
						  $spots = (int)$r[6];
						  $enrolled = (int)$r[7];
						  $open = (int)$r[8];
						  $open = $spots-$enrolled;
						  if(!empty($r[10])){
							$true = $r[10];
						  }
						}
						if ($spots == $enrolled) {
						  $full = 1;
						}
						if($class_id != null && $title == $r[2]){
							$flag = TRUE;
							$class_data = [
								'date'=>trim($yesterday),
								'website'=>trim($website),
								'locationID'=>trim($locationID),
								'locationName'=>trim($title),
								'name'=>$r[1],
								'instructor'=>trim($r[3]),
								'datetime'=>trim($r[4]),
								'spots'=>$spots,
								'enrolled'=>$enrolled,
								'open'=>$open,
								'true'=>trim($true),
								'full'=>$full,
						  ];
						  $classes[$class_id][] = $class_data;
						}
					  }
					}
				}
				$tempClass = [];
				foreach ($classes as $k=>$class) {
					$tempClass[$k]=reset($class);
				}
				$classes = $tempClass;
				if($flag == TRUE){
					$num = count($classes);
					$spots = array_column($classes, 'spots');
					$spots = array_sum($spots);
					$enrolled = array_column($classes, 'enrolled');
					$enrolled = array_sum($enrolled);
					$open = array_column($classes, 'open');
					$fullColumn = array_column($classes, 'full');
					$fullCount = array_sum($fullColumn);
					// $open = array_sum($open);
					$open = (int)$spots - (int)$enrolled;

					$locationID = (int)$locationID;

					$city=$state=$zipcode = '';
					if(!empty($studios[$website][$locationID])){
					  $studio = $studios[$website][$locationID];
					  if (!empty($studio->city)) {
						$city = $studio->city;
					  }
					  if (!empty($studio->state)) {
						$state = $studio->state;
					  }
					  if (!empty($studio->zipcode)) {
						$zipcode = $studio->zipcode;
					  }
					}
					foreach($classes as $class){
						unset($class['true']);
						unset($class['full']);
						array_push($class,$city,$state,$zipcode);
						$str = implode(';',$class);
						$str = str_replace('NONAME','',$str);
						fwrite($fileClass,$str."\r\n");
					}

					// $headers = 'Date;Website;Location ID;Location Name;Number Classes;Number Spots;Enrolled Spots;Open Spots \n\r';
					$csv_array = [
						trim($yesterday),
						trim($website),
						$locationID,
						trim($title),
						(int)$num,
						(int)$spots,
						(int)$enrolled,
						(int)$open,
						(int)$fullCount,
						$city,
						$state,
						$zipcode,
					];
					$string = implode(';',$csv_array);
					// var_dump($string);
					fwrite($file,$string."\r\n");
				  }
			//}
		}
		$flag = FALSE;
	}
	print('Script Finished '.$dir.$log."\r\n");
	fclose($file);
}

function validateDate($date) {
  // Tue, Jun 20, 2017 1:02 PM
  // Wed, Jun 14, 2017 5:00 AM
  $format = 'D, M d, Y g:i A'; // Eg : 2014-09-24 10:19 PM
  $dateTime = DateTime::createFromFormat($format, $date);
  if ($dateTime instanceof DateTime) {
    return true;
  }
  return false;
}
?>
