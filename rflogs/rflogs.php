<?php
$rflogs_dir = '/var/www/html2/rumble-scripts/rflogs/';

function canRun($condition){
    if($condition == 'attendance'){
        return (date('G') == 4 && intval(date('i')) == 0);
    }else if($condition == 'sales' || $condition == 'revenue'){
        return (date('j') == 1 && date('G') == 4 && intval(date('i')) == 30);
    }else if($condition == 'notes'){
        return false; // Disable notes log.
    }

    return false; // If log type has a condition that's not defined, don't run it.
}

function saveAttendanceData($log, $data, $url, $curl, $same_file = false){
    global $rflogs_dir;

    $data = json_decode($data);
    $path = $rflogs_dir . 'attendance/attendance_';
    $saveFiles = [];
    $date = date('D-M-d-Y', strtotime('yesterday'));
    foreach($data->data as $attendance){
        $room = str_replace([
                '/', ' ', 'Studio4', 'UpperEastSide', 'WestHollywood'
            ], [
                '', '', '4', 'UES2', 'WeHo'
            ], $attendance->room);
        
        if(!array_key_exists($room, $saveFiles))
            $saveFiles[$room] = [];
        
        $saveFiles[$room][] = $attendance;
    }
    
    foreach($saveFiles as $name => $saveData){
        $savePath = $path . $name . '_' . $date . '.csv';
        $handle = fopen($savePath, $same_file ? 'a' : 'w');
        if(!$same_file){
            fputcsv($handle, ['spotId', 'spotLabel', 'status', 'customerId', 'name']);
        }
        foreach($saveData as $sd){
            fputcsv($handle, [
                'spotId' => $sd->spotId,
                'spotLabel' => (($sd->spotId > 30) ? (($sd->spotId - 30) . 'F') : ($sd->spotId . 'B')),
                'status' => $sd->status,
                'customerId' => (string)$sd->customerId,
                'name' => $sd->first_name . ' ' . $sd->last_name
            ]);
        }
        fclose($handle);
    }
    if(!empty($data->meta) && $data->meta->current_page != $data->meta->last_page && $same_file === false){
        $next_page = intval($data->meta->current_page);
        do{
            $next_page++;
            $log['params']['page'] = $next_page;
            $post = empty($log['json']) ? http_build_query($log['params']) : json_encode($log['params']);
            curl_setopt($curl, CURLOPT_HTTPGET, true);
            curl_setopt($curl, CURLOPT_URL, $url . '?' . $post);
            $log['saveFn']($log, curl_exec($curl), $url, $curl, true);
        }while($next_page < intval($data->meta->last_page));
    }
}

function saveSalesData($log, $data, $url, $curl, $same_file = false){
    global $rflogs_dir;

    $data = json_decode($data);
    $path = $rflogs_dir . 'sales/sales_';
    $saveResources = [];
    $date = date('m-Y', strtotime('last month'));
    
    foreach($data->data as $order){
        $region = '';
        $region_parts = explode(' ', $order->region->name);
        foreach($region_parts as $part)
            $region .= $part[0];
        
        if(!array_key_exists($region, $saveResources)){
            $saveResources[$region] = fopen($path . $region . '_' . $date . '.csv', $same_file ? 'a' : 'w');
            if(!$same_file){
                fputcsv($saveResources[$region], [
                    'date', 'order_id', 'customer_id', 'payment_type', 'price',
                    'quantity', 'discount', 'tax', 'total', 'revenue',
                    'itemid', 'item', 'type', 'firstname', 'lastname',
                    'site_id', 'site', 'cost', 'gateway_id', 'gateway'
                ]);
            }
        }
        
        fputcsv($saveResources[$region], [
            'date' => date('Y-m-d H:i:s', strtotime(str_replace(' - ', ' ', $order->dateClosed))),
            'order_id' => (string)$order->id,
            'customer_id' => (string)$order->customer->id,
            'payment_type' => '',
            'price' => $order->subtotal->amount,
            'quantity' => $order->orderDetails[0]->quantity,
            'discount' => '',
            'tax' => $order->tax->amount,
            'total' => $order->total->amount,
            'revenue' => $order->total->amount,
            'itemid' => trim(explode(': ', explode('-', $order->orderDetails[0]->details)[0])[1]),
            'item' => trim(explode(': ', explode('-', $order->orderDetails[0]->details)[1])[1]),
            'type' => stristr($order->orderDetails[0]->details, 'series') ? 'series' : 'product',
            'firstname' => $order->customer->firstName,
            'lastname' => $order->customer->lastName,
            'site_id' => $order->site->id,
            'site' => $order->site->name,
            'cost' => (int)$order->total->amount,
            'gateway_id' => $order->gatewayId,
            'gateway' => ''
        ]);
    }

    foreach($saveResources as $handle)
        fclose($handle); // Clean up.
    
    if(!empty($data->meta) && $data->meta->current_page != $data->meta->last_page && $same_file === false){
        $next_page = intval($data->meta->current_page);
        do{
            $next_page++;
            $log['params']['page'] = $next_page;
            $post = empty($log['json']) ? http_build_query($log['params']) : json_encode($log['params']);
            curl_setopt($curl, CURLOPT_HTTPGET, true);
            curl_setopt($curl, CURLOPT_URL, $url . '?' . $post);
            $log['saveFn']($log, curl_exec($curl), $url, $curl, true);
        }while($next_page < intval($data->meta->last_page));
    }
}

function saveRevenueData($log, $data, $url, $curl, $same_file = false){
    global $rflogs_dir;

    $data = json_decode($data);
    $path = $rflogs_dir . 'revenue/RevenueReport_';
    $saveResources = [];
    $date = date('m-Y', strtotime('last month'));
    
    foreach($data->data as $order){
        if(empty($order->orderDetails) || empty($order->orderDetails[0]->seriesItem))
            continue;
        
        $order->orderDetails = $order->orderDetails[0];
        $productParts = explode('-', $order->orderDetails->seriesItem->seriesName);
        $product = str_ireplace(' ', '-', trim($productParts[0]));
        if(!empty($productParts[1]))
            $product .=  ('_' . str_ireplace(' ', '-', trim($productParts[1])));
        
        if(!array_key_exists($product, $saveResources)){
            $add = '_' . $order->orderDetails->seriesItem->seriesId;
            $saveResources[$product] = fopen($path . $product . $add . '.csv', $same_file ? 'a' : 'w');
            if(!$same_file){
                fputcsv($saveResources[$product], [
                    'customer', 'activated', 'expired', 'count',
                    'remaining', 'revenue', 'total_cost'
                ]);
            }
        }
        
        fputcsv($saveResources[$product], [
            'customer' => !empty($order->customer) ? ucwords($order->customer->firstName . ' ' . $order->customer->lastName) : 'UNKNOWN',
            'activated' => date('Y-m-d H:i:s', strtotime($order->orderDetails->seriesItem->activationDate)),
            'expired' => date('Y-m-d H:i:s', strtotime($order->orderDetails->seriesItem->expiringDate)),
            'count' => $order->orderDetails->seriesItem->classCount,
            'remaining' => $order->orderDetails->seriesItem->classesRemaining,
            'revenue' => '$' . $order->subtotal->amount,
            'total_cost' => '$' . $order->subtotal->amount
        ]);
    }

    foreach($saveResources as $handle)
        fclose($handle); // Clean up.
    
    if(!empty($data->meta) && $data->meta->current_page != $data->meta->last_page && $same_file === false){
        $next_page = intval($data->meta->current_page);
        do{
            $next_page++;
            $log['params']['page'] = $next_page;
            $post = empty($log['json']) ? http_build_query($log['params']) : json_encode($log['params']);
            curl_setopt($curl, CURLOPT_HTTPGET, true);
            curl_setopt($curl, CURLOPT_URL, $url . '?' . $post);
            $log['saveFn']($log, curl_exec($curl), $url, $curl, true);
        }while($next_page < intval($data->meta->last_page));
    }
}

function saveNotesData($log, $data, $url, $curl, $same_file = false){
    global $rflogs_dir;

    $data = json_decode($data);
    $path = $rflogs_dir . 'notes/';
    $saveFiles = [];
    $date = date('D-M-d-Y', strtotime('yesterday'));
    foreach($data->data as $note){
        $file = str_replace([
                '/', ' ', 'Studio4', 'UpperEastSide', 'WestHollywood'
            ], [
                '', '', '4', 'UES2', 'WeHo'
            ], $note->room->name) . date('D-M-j---g-i-A', strtotime($note->class->classDate));
        
        if(!array_key_exists($file, $saveFiles))
            $saveFiles[$file] = [];
        
        $saveFiles[$file][] = $note;
    }
    
    foreach($saveFiles as $name => $saveData){
        $savePath = $path . $name . '.txt';
        $handle = fopen($savePath, $same_file ? 'a' : 'w');
        foreach($saveData as $sd){
            fwrite($handle, $sd->note . ' -');
            fwrite($handle, strtolower($sd->user->firstName) . strtolower($sd->user->lastName[0]));
            fwrite($handle, PHP_EOL);
        }
        fclose($handle);
    }
    if(!empty($data->meta) && $data->meta->current_page != $data->meta->last_page && $same_file === false){
        $next_page = intval($data->meta->current_page);
        do{
            $next_page++;
            $log['params']['page'] = $next_page;
            $post = empty($log['json']) ? http_build_query($log['params']) : json_encode($log['params']);
            curl_setopt($curl, CURLOPT_HTTPGET, true);
            curl_setopt($curl, CURLOPT_URL, $url . '?' . $post);
            $log['saveFn']($log, curl_exec($curl), $url, $curl, true);
        }while($next_page < intval($data->meta->last_page));
    }
}

$api_url = 'https://www.rumble-boxing.com/api';
$user = 'rflogs@arcanestrategies.com'; // Must have admin privileges
$pass = 'OoigH6XAtNw6'; // Eventually replace with oauth
$logging = [
    [
        'path' => '/admin/attendance',
        'method' => 'GET',
        'saveFn' => 'saveAttendanceData',
        'condition' => 'attendance',
        'params' => [
            'minDate' => date('Y-m-d 00:00:00', strtotime("yesterday")),
            'maxDate' => date('Y-m-d 00:00:00')
        ]
    ],
    [
        'path' => '/admin/sites/orders',
        'method' => 'GET',
        'saveFn' => 'saveSalesData',
        'condition' => 'sales', // Once a month.
        'params' => [
            'minDate' => date('Y-m-01 00:00:00', strtotime('last month')),
            'maxDate' => date('Y-m-d 00:00:00')
        ]
    ],
    [
        'path' => '/admin/sites/orders',
        'method' => 'GET',
        'saveFn' => 'saveRevenueData',
        'condition' => 'revenue', // Once a month.
        'params' => [
            'minDate' => date('Y-m-01 00:00:00', strtotime('last month')),
            'maxDate' => date('Y-m-d 00:00:00')
        ]
    ],
    [
        'path' => '/admin/class/notes',
        'method' => 'GET',
        'saveFn' => 'saveNotesData',
        'condition' => 'notes',
        'params' => [
            'minDate' => date('Y-m-d 00:00:00', strtotime("yesterday")),
            'maxDate' => date('Y-m-d 00:00:00')
        ]
    ]
];

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

foreach($logging as $log){
    // Don't check if the function exists. It's easier to debug later if we forget
    // to add a saveFn to a log type if we get an error than if it just skips it.
    if(empty($log['saveFn']))
        continue;
    
    if(!empty($log['condition']) && !canRun($log['condition']))
        continue;

    $headers = ['username: ' . $user, 'password: ' . $pass];
    if(!empty($log['json']))
        $headers[] = 'Content-Type: application/json';
    
    $new_url = $api_url . $log['path'];
    curl_setopt($curl, CURLOPT_URL, $new_url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    if($log['method'] == 'POST'){
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPGET, false);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, null);
    }else{
        curl_setopt($curl, CURLOPT_POST, false);
        if($log['method'] == 'GET'){
            curl_setopt($curl, CURLOPT_HTTPGET, true);
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, null);
        }else{
            curl_setopt($curl, CURLOPT_HTTPGET, false);
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $log['method']);
        }
    }

    if(!empty($log['params'])){
        $post = empty($log['json']) ? http_build_query($log['params']) : json_encode($log['params']);
        if($log['method'] == 'GET')
            curl_setopt($curl, CURLOPT_URL, $new_url . '?' . $post);
        else
            curl_setopt($curl, CURLOPT_POSTFIELDS, $post);
    }
    
    try{
        $log['saveFn']($log, curl_exec($curl), $new_url, $curl);
    }catch(Exception $e){}
}

curl_close($curl);
echo 'Operation Complete' . PHP_EOL;
