<?php
$currentDate = date("Y-m-d");
$file = 'NY'.$currentDate;
$dir = '/home/ubuntu/';
$filename = $dir.$file;

function readCSV($var){
	$time = time();
	$array = array_map('str_getcsv', file($var));
	foreach($array[0] as $url){
		$locationPos = strpos($url,'location=');
		$locationPos = $locationPos+9;
		$locationID = substr($url,$locationPos,4);
		$newfile = $locationID.'-'.$time;
		print($newfile);
		//exec("wget -O ".$newfile." ".$url."");
		exec("curl -o ".$newfile." ".$url."");
	}
}

readCSV($filename);

?>