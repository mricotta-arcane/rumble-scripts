<?php
// CREATE TABLE `data_miner`.`instructors` ( `id` INT NOT NULL , `site` VARCHAR(255) NOT NULL , `instructor_id` VARCHAR(255) NOT NULL , `name` VARCHAR(255) NOT NULL , `data` TEXT NOT NULL ) ENGINE = InnoDB;
include_once("config.php");
include_once("helper.php");

/**
* Instructor Class, retrieves instructors and puts them into database and replaces csv data
* TODO
*/
class Instructor
{
  public $conn;
  public $dir;
  function __construct($conn,$dir)
  {
    $this->conn = $conn;
    $this->dir = $dir;
  }
}


function getInstructor($site,$instructor,$conn){
  switch ($site) {
    case 'flywheel':
    $url = 'https://new-york.flywheelsports.com/api/v2/instructor/'.$instructor.'.json';
    $json = getCurlJson($url);
    $name = $json->instructor_schedule_name;
    // Sometimes names can be empty or contains znull
    if(empty($name) || strpos($name, 'znull') !== false){
      $name = $json->instructor_first_name.' '.$json->instructor_last_name;
      if(empty(trim($name))){
        $name = 'NONAME '.$instructor;
      }
    }
    $data = json_encode($json);
    break;
    default:
    # code...
    break;
  }
  $i = $conn->prepare('INSERT INTO instructors (site,instructor_id,name,data) VALUES (:site,:instructor_id,:name,:data) ');
  $i->bindParam(':site',$site);
  $i->bindParam(':instructor_id',$instructor);
  $i->bindParam(':name',$name);
  $i->bindParam(':data',$data);
  $i->execute();
}

function getInstructorArray($file){
  $return = $groups = [];
  if (strpos($file, 'class_summary.csv') !== false) {
    $instructorIndex = 5;
  } else {
    $instructorIndex = 3;
  }
  $contents = file($file);
  foreach ($contents as $key => $row) {
    $row = rowIntoArray($row);
    if(!empty($row[$instructorIndex]) && is_numeric($row[$instructorIndex])){
      if($instructorIndex == 5){
        $groups[$row[1]][] = $row[$instructorIndex];
      } else {
        $fileNameArray = explode('_',$file);
        if(!empty($fileNameArray[3])){
          $groups[$fileNameArray[3]][] = $row[$instructorIndex];
        }
      }
    }
  }
  foreach ($groups as $key => $group) {
    $return[$key] = array_unique($group);
  }
  return $return;
}

function getInstructorArrayAll(){
  $return = $groups = [];
  $files = getFiles();
  foreach ($files as $file) {
    $instructorArrays = getInstructorArray($file);
    if(!empty($instructorArrays)){
      $groups = array_merge_recursive($groups,$instructorArrays);
    }
  }
  foreach ($groups as $key => $group) {
    $return[$key] = array_unique($group);
  }
  return $return;
}

function checkInstructors($instructorGroups,$conn){
  $return = [];
  foreach ($instructorGroups as $site => $group) {
    $instructor_id_list = implode(',',$group);
    $select = $conn->prepare('SELECT * FROM instructors WHERE site = :site AND instructor_id IN ('.$instructor_id_list.')');
    $select->bindParam(':site',$site);
    $select->execute();
    $select->setFetchMode(PDO::FETCH_OBJ);
    $existing = $select->fetchAll();
    if(!empty($existing)){
      foreach ($existing as $instructor) {
        if(($key = array_search($instructor->instructor_id, $group)) !== false) {
          unset($group[$key]);
        }
      }
    }
    $return[$site] = $group;
  }
  return $return;
}

function getInstructorData($instructorGroups,$conn){
  foreach ($instructorGroups as $site => $group) {
    foreach($group as $instructor){
      getInstructor($site,$instructor,$conn);
    }
  }
}

function getReplaceArray($conn){
  $select = $conn->prepare('SELECT id,site,instructor_id,name FROM instructors');
  $select->setFetchMode(PDO::FETCH_OBJ);
  $select->execute();
  $instructors = $select->fetchAll();
  $search = $replace = [];
  foreach($instructors as $instructor){
    $search[] = ';'.$instructor->instructor_id.';';
    $replace[] = ';'.$instructor->name.';';
  }
  return [
  'search'=>$search,
  'replace'=>$replace
  ];
}

function replaceInstructors($replaceArray,$file){
  $fileNameArray = explode('_',$file);
  // TODO add other sites only for flywheel for now
  if((!empty($fileNameArray[3]) && $fileNameArray[3] == 'flywheel') || strpos($file, 'class_summary.csv') !== false){
    $file_contents = file_get_contents($file);
    foreach($replaceArray['search'] as $search){
      if(strpos($file_contents, $search)){
        var_dump($file);
        $file_contents = str_replace($replaceArray['search'],$replaceArray['replace'],$file_contents);
        file_put_contents($file,$file_contents);
        break;
      }
    }
  }
}

function getFiles(){
  $return = [];
  $dir = '/var/www/html2/rumble-scripts/public/data_miner/log/';
  $logs = scandir($dir,1);
  foreach ($logs as $log) {
    $nameArray = explode('.',$log);
    $extension = end($nameArray);
    if($extension == 'csv' || $extension == 'CSV'){
      $return[]=$dir.$log;
    }
  }
  return $return;
}

function replaceInstructorsAllFile($conn){
  $dir = '/var/www/html2/rumble-scripts/public/data_miner/log/';
  $files = getFiles();
  $replaceArray = getReplaceArray($conn);
  foreach($files as $file){
    replaceInstructors($replaceArray,$file);
  }
}
?>
<pre>
  <?php
  // $instructorGroups = getInstructorArray();
  $instructorGroups = getInstructorArrayAll();
  $cleanInstructorGroups = checkInstructors($instructorGroups,$conn);
  getInstructorData($cleanInstructorGroups,$conn);
  replaceInstructorsAllFile($conn);
  ?>
</pre>
