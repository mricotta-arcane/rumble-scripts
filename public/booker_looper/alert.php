<?php
// get the HTTP method, path and body of the request
// $class = $datetime = $key = null;
// $method = $_SERVER['REQUEST_METHOD'];
// $url = $_SERVER['REQUEST_URI'];
// $queries = parse_url($url, PHP_URL_QUERY);
// $params = array();
// if(isset($queries)){
//   $queries = explode('&',$queries);
//   foreach($queries as $param){
//     $val = substr($param,strpos($param,'=')+1);
//     $val = str_replace('%27','',$val);
//     $val = str_replace('%20',' ',$val);
//     $val = str_replace('"','',$val);
//     $key = strtok($param,'=');
//     $params[$key] = $val;
//   }
// }
// var_dump($params);
// $input = json_decode(file_get_contents('php://input'),true);
// if (isset($params['class'])) {
//   $class = $params['class'];
// }
// if (isset($params['datetime'])) {
//   $datetime = $params['datetime'];
// }
// if (isset($params['key'])) {
//   $key = $params['key'];
// }

/**
 * Mailer Class
 */
class Mailer
{
  public $class;
  public $datetime;
  public $key;
  public $sendGridApiKey;
  public $to;

  public function __construct(Type $foo = null)
  {
    $this->sendGridApiKey = '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';
    $this->to = 'contact@rumble-boxing.com';
    // $this->to = 'michael.ricotta@gmail.com';
    $this->class = $this->datetime = $this->key = false;
    if(isset($_GET['class'])){
      $this->class = $_GET['class'];
    }
    if(isset($_GET['datetime'])){
      $this->datetime = $_GET['datetime'];
    }
    if(isset($_GET['key'])){
      $this->key = $_GET['key'];
    };
  }

  public function check(){
    $return = false;
    if($this->class != false && $this->datetime != false && $this->key != false && $this->key =='AV5Zsslka'){
      $return = true;
    }
    return $return;
  }

  public function report($check,$report=null)
  {
    if($check==true){
      return '<p class="report success">Mail Sent to "'.$this->to.' '.$report.'"</p>';
    } else {
      return '<p class="report failed">Mail Failed "'.$this->to.' '.$report.'"</p>';
    }
  }

  function alertrumble(){
    $check = $this->check();
    if(!$check){
      return '<p class="report failed">Missing Required Param</p>';
    }
    //$to = 'contact@rumble-boxing.com';
    // $to = 'michael.ricotta@gmail.com';
    $to = 'alert@doyourumble.com';
    $subject = 'URGENT - '.$this->class.' ON '.$this->datetime.' REOPENED';
    $body = 'Please check this class to ensure the waitlist is added if outside of 12 hours from the class time.';
    $headers =  'MIME-Version: 1.0' . "\r\n";
    $headers .= 'From: Arcane Strategies rumble@doyourumble.com' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

    // $headers = 'From: rumble@doyourumble.com' . "\r\n" .
    // 'Reply-To: rumble@doyourumble.com' . "\r\n" .
    // 'X-Mailer: PHP/' . phpversion();
    return $this->report(mail($this->to,$subject,$body,$headers));
  }

  function alertRumbleSendgrid(){
    $check = $this->check();
    if(!$check){
      return '<p class="report failed">Missing Required Param</p>';
    }
    $curl = curl_init();

    $data = [
      "personalizations"=>[
        [
          "to"=> [
            [
              "email"=> $this->to
            ]
          ]
        ]
      ],
      "from"=> [
        "email"=> "rumble@doyourumble.com",
        "name"=> "Arcane Strategies | Rumble"
      ],
      "subject"=> 'URGENT - '.$this->class.' ON '.$this->datetime.' REOPENED',
      "content"=> [
        [
          "type"=> "text/html",
          "value"=> "<html><p>Please check this class to ensure the waitlist is added if outside of 12 hours from the class time.</p></html>"
        ]
      ]
    ];
    $data = json_encode($data);
    // var_dump($data);
    // die();

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
        "authorization: Bearer ".$this->sendGridApiKey,
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
    return $this->report($mailSent,$err);

  }
}
$mailer = new Mailer;
echo $mailer->alertRumbleSendgrid();

?>
