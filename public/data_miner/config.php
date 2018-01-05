<?php
  $db = [
    'host'=>'localhost',
    'user'=>'data_miner',
    'name'=>'data_miner',
    'pass'=>'JlAMI8UruIKwG8vp'
  ];
  $conn = new PDO("mysql:host=".$db['host'].";dbname=".$db['name']."", $db['user'], $db['pass']);
  $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  // always disable emulated prepared statement when using the MySQL driver
  $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
  // GRANT ALL PRIVILEGES ON data_miner.* TO 'data_miner'@'localhost' IDENTIFIED BY 'JlAMI8UruIKwG8vp';
?>
