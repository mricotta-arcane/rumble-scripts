<?php
echo "Script Started";
function dataMerger(){
  $dir = '/var/www/html2/rumble-scripts/public/data_miner/log/';
  $dirImport19 = '/var/www/html2/rumble-scripts/public/data_miner/log_6-19-17/log/';
  $dirImport20 = '/var/www/html2/rumble-scripts/public/data_miner/log_6-20-17/log/';

  $logs = scandir($dir,1);

  foreach($logs as $log){
    if(strpos($log, '_day_') !== false ){
      echo "$log \n\r";
      $temp_file = '';
      // $file = fopen($dir.$log, "a");
      $filenow = file_get_contents($dir.$log);
      $file19 = file_get_contents($dirImport19.$log);
      $file20 = file_get_contents($dirImport20.$log);
      // $fileImport = file_get_contents($dirImport.$log);
      // var_dump($file);
      // var_dump($fileImport);die();
      $file = fopen($dir.$log, "w");
      fwrite($file,$file19.$file20);
      unlink($dirImport19.$log);
      unlink($dirImport20.$log);
      fclose($file);
    }
  }
}
?>
<pre><?php dataMerger(); ?></pre>
