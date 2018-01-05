<?php

//$dir = 'C:/xampp/rumble-scripts/public/data_miner/log/';
$dir = '/var/www/html2/rumble-scripts/public/data_miner/log/';
$scraper = $dir.'scraper_summary.csv';
$class = $dir.'class_summary.csv';
$scraper2 = $dir.'scraper_summary2.csv';
$class2 = $dir.'class_summary2.csv';
$twofiles = array($scraper2,$class2);
$onefiles = array($scraper2,$class2);

copy($scraper,$scraper2);
copy($class,$class2);

foreach($twofiles as $f){
	$new = [];
	$file = file($f,FILE_IGNORE_NEW_LINES);
	$fopen = fopen($f, "a+");
	$patterns = '/^(.)|(.)$/';
	foreach($file as $row){
		$row = '"'.$row.'"';
		$row = preg_replace($patterns,'"',$row);
		$new[] = str_replace(';','","',$row);
	}
	if ($fopen !== false) {
		ftruncate($fopen, 0);
	}
	foreach($new as $q){
		fwrite($fopen,$q."\r\n");
	}
	fclose($fopen);
}

print('CSV line replacement done');
exit();

?>
