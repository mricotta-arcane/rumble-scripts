<?php
function getCurlJson($url)
{
  //  Initiate curl
  $ch = curl_init();
  // Disable SSL verification
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  // Will return the response, if false it print the response
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  // Set the url
  curl_setopt($ch, CURLOPT_URL,$url);
  // Execute
  $result=curl_exec($ch);
  // Closing
  curl_close($ch);

  // Will dump a beauty json :3
  return json_decode($result);
}
function rowIntoArray($row){
  return explode(';',trim($row));
}
function checkByStudioId($id,$site,$conn)
{
  $check = $conn->prepare('SELECT * FROM studios WHERE studio_id = :studio_id AND site = :site');
  $check->bindParam(':studio_id',$id);
  $check->bindParam(':site',$site);
  $check->execute();
  if ($check->rowCount() > 0) {
    return $check;
  }
  return false;
}
function getStates(){
  return $states = array(
	'NA'=>'NotApplicable',
    'AL'=>'Alabama',
    'AK'=>'Alaska',
    'AZ'=>'Arizona',
    'AR'=>'Arkansas',
    'CA'=>'California',
    'CO'=>'Colorado',
    'CT'=>'Connecticut',
    'DE'=>'Delaware',
    'DC'=>'District of Columbia',
    'FL'=>'Florida',
    'GA'=>'Georgia',
    'HI'=>'Hawaii',
    'ID'=>'Idaho',
    'IL'=>'Illinois',
    'IN'=>'Indiana',
    'IA'=>'Iowa',
    'KS'=>'Kansas',
    'KY'=>'Kentucky',
    'LA'=>'Louisiana',
    'ME'=>'Maine',
    'MD'=>'Maryland',
    'MA'=>'Massachusetts',
    'MI'=>'Michigan',
    'MN'=>'Minnesota',
    'MS'=>'Mississippi',
    'MO'=>'Missouri',
    'MT'=>'Montana',
    'NE'=>'Nebraska',
    'NV'=>'Nevada',
    'NH'=>'New Hampshire',
    'NJ'=>'New Jersey',
    'NM'=>'New Mexico',
    'NY'=>'New York',
    'NC'=>'North Carolina',
    'ND'=>'North Dakota',
    'OH'=>'Ohio',
    'OK'=>'Oklahoma',
    'OR'=>'Oregon',
    'PA'=>'Pennsylvania',
    'RI'=>'Rhode Island',
    'SC'=>'South Carolina',
    'SD'=>'South Dakota',
    'TN'=>'Tennessee',
    'TX'=>'Texas',
    'UT'=>'Utah',
    'VT'=>'Vermont',
    'VA'=>'Virginia',
    'WA'=>'Washington',
    'WV'=>'West Virginia',
    'WI'=>'Wisconsin',
    'WY'=>'Wyoming',
);
}
function checkById($id,$conn)
{
  $check = $conn->prepare('SELECT * FROM studios WHERE id = :id');
  $check->bindParam(':id',$id,PDO::PARAM_INT);
  $check->execute();
  if ($check->rowCount() > 0) {
    return $check;
  }
  return false;
}

function createSlug($string){
  $slug=preg_replace('/[^A-Za-z0-9-]+/', '-', $string);
  return strtolower($slug);
}

function getUrl($studio){
  switch ($studio->site) {
    case 'Barrys':
      $url = 'https://www.barrysbootcamp.com/schedule/'.createSlug($studio->name);
      break;
    case 'BarrysInternational':
      $url = 'https://international.barrysbootcamp.com/reserve/index.cfm?action=Reserve.chooseClass&site='.$studio->studio_id;
      break;
    case 'Flywheel':
      $url = 'https://www.flywheelsports.com/reserve/2017-06-21?classRoom='.$studio->studio_id.'&classType=flywheel';
      break;
    case 'SoulCycle':
      $url = 'https://www.soul-cycle.com/find-a-class/studio/'.$studio->studio_id;
      break;
    default:
      $url = '#';
      break;
  }
  return $url;
}
function getInstructorUrl($instructor){
  switch ($instructor->site) {
    case 'flywheel':
      $url = 'https://www.flywheelsports.com/instructor/'.$instructor->instructor_id;
      break;
    default:
      $url = '#';
      break;
  }
  return $url;
}
function getSite($studio){
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
    case 'Sbxboxing':
      $site = 'sbxboxing';
      break;
    default:
      $site = '_';
      break;
  }
  return $site;
}
function getSiteOption(){
  return[
    'BarrysInternational'=>'Barrys International',
    'Barrys'=>'Barrys',
    'Flywheel'=>'Flywheel',
    'SoulCycle'=>'SoulCycle',
  ];
}
function getTimezoneOption(){
  $timezones = DateTimeZone::listIdentifiers(DateTimeZone::ALL);
  $timezoneOptions = [];
  foreach ($timezones as $key => $value) {
    $timezoneOptions[$value]=$value;
  }
  return $timezoneOptions;
  return[
    'America/New_York'=>'America/New_York',
    'America/Los_Angeles'=>'America/Los_Angeles',
    'America/Chicago'=>'America/Chicago',
    'America/Phoenix'=>'America/Phoenix',
    'America/Toronto'=>'America/Toronto',
  ];
}
function mailer($to,$subject,$content,$cc=null){
  // if (!empty($cc)){
  //   "cc": [
  //       {
  //         "email": "jane.doe@example.com",
  //         "name": "Jane Doe"
  //       }
  //     ],
  //   $cc = 'support@doyourumble.com';
  // }
  if (is_array($to)){
    foreach ($to as $t) {
      $toBlock[]=[
        "email"=>$t
      ];
    }
  } else {
    $toBlock[]=[
      "email"=>$to
    ];
  }
  $data = [
    "personalizations"=>[
      [
        "to"=> $toBlock
      ]
    ],
    "from"=> [
      "email"=> "rumble@doyourumble.com",
      "name"=> "Arcane Strategies | Rumble"
    ],
    "subject"=> $subject,
    "content"=> [
      [
        "type"=> "text/html",
        "value"=> "<html>$content</html>"
      ]
    ]
  ];
  $data = json_encode($data);
  $sendGridApiKey = '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';

  $curl = curl_init();
  curl_setopt_array($curl, array(
    CURLOPT_URL => "https://api.sendgrid.com/v3/mail/send",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => array(
      "authorization: Bearer ".$sendGridApiKey,
      "content-type: application/json"
    ),
  ));

  $response = curl_exec($curl);
  $err = curl_error($curl);

  curl_close($curl);
  if($err){
    $mailSent = false;
  } else {
    $mailSent = true;
  }
  return [
    'mailSent'=>$mailSent,
    'err'=>$err
  ];
}
function getDateFromTime($time){
  return date("F d Y H:i",$time);
}
?>
