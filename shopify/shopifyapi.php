<?php
/**
/* Get all variants for a product
/* GET /admin/products/#{id}/variants.json
/***********************************
/* Update a variant's inventory
/* PUT /admin/variants/#{id}.json
/* {
/*   "variant": {
/*     "id": 808950810,
/*     "inventory_quantity": 100,
/*     "old_inventory_quantity": 10
/*   }
/* }
/*  https://apikey:password@hostname/admin/resource.json
/*  https://983a5b81ce25faf216f80054b7788714:340135cf3ff48f399b55d9a4f468fbf6@rmbl.myshopify.com/admin/orders.json
***********************************/
class ProductUpdater{

  protected $API_KEY;
  protected $PASSWORD;
  public $SHARED_SECRET;
  public $STORE_URL;
  public $url;
  public $VARIANTS;
  public $csv_file;
  public $temp_array;
  public $total;
  public $i;
  public $all_prods;
  public $cnt;

  public function __construct($sku=NULL){
	$FILE_ID = '1-27POpYPWssIjKOwSz7amOvUCqKGbqQFpv2ioRJ4Oho';
//	file_put_contents('/var/www/html2/rumble-scripts/shopify/inventory_report.csv', fopen("https://docs.google.com/spreadsheets/d/".$FILE_ID."/pub?gid=1399595549&single=true&output=csv",'r'));
	$this->API_KEY = '983a5b81ce25faf216f80054b7788714';
	$this->PASSWORD = '340135cf3ff48f399b55d9a4f468fbf6';
	$this->STORE_URL = 'rmbl.myshopify.com';
	$this->SHARED_SECRET = '7ba4e13548c2760aa4a5f046e2e8523f';
//	$this->csv_file = '/var/www/html2/rumble-scripts/shopify/inventory_report.csv';
	//$this->csv_file = '/home/ubuntu/inventory_report.csv';
	$this->csv_file = '/var/www/html2/rumble-scripts/shopify/inventory_report.csv';
	$this->all_prods = $this->temp_array = array();
	$this->i = 0;
	$this->total = array('products'=>array());
	// read csv
	if(isset($sku)){
		$csv = $sku;
	} else {
		$csv = self::readcsv();
	}
	// loop through products in CSV
//	copy($this->csv_file, '/var/www/html2/rumble-scripts/shopify/inventory_report.csv');
	$results = FALSE;
	$this->cnt = self::getCount(); // total count of products, not variants and not for one-offs.
	foreach($csv as $product){
		// limit products
		//if ((strpos($product[1], 'Jab') !== false)||(strpos($product[1], 'Bella') !== false)){
			// return the variant ID for the SKU
			$sk = reset($product);
			$id = self::getID($sk);
			// grab the quantity for that SKU from the CSV
			$qty = (end($product)!=null)? (int)end($product) :  0;
			if(isset($id)){
				// replace inventory for the corresponding variant on shopify.
				$results = self::putVariants($id,$qty);
				//}
				$str = 'variant ID: '.$product[0].', product ID: '.$id.', quantity: '.$qty.PHP_EOL;
				file_put_contents('shopify_report.txt',$str,FILE_APPEND);
			}
	}
	return $results;
  }

  public function setURL($CALL){
	$url = 'https://' . $this->API_KEY . ':' . $this->PASSWORD . '@' . $this->STORE_URL . $CALL .'.json';
	return $url;
  }

  public function readcsv(){
	$csv = array_map('str_getcsv', file($this->csv_file));
	return $csv;
  }

  /**
  /*	getID returns the variation ID by SKU as closely as possible
  **/
  public function getID_old($sku){
	  $METHOD = 'POST';
	  $CALL = '/admin/products/search';
	  //$CALL = '/admin/products/'.$PRODUCT_ID.'/variants';
	  //$this->API_KEY = 'mricotta@arcanestrategies.com';
	  //$this->PASSWORD = 'Rumbl3';
	  $url = self::setURL($CALL);
	  $url = $url.'?query=sku:'.$sku;
	  try{
		$id = self::getAPI($METHOD,$url);
		return $id;
	  } catch(\Exception $e) {
		print('Caught exception: '.$e->getMessage()."\n");
		return FALSE;
	  }
  }

  /**
  /*	recursiveIterateKeyMatch traverses a multi-dimensional array for a value key value pair
  **/
  public function recursiveIterateKeyMatch(array $products,$keymatch,$valuematch=NULL){
		if (!isset($valuematch)){
			foreach($products as $value){
				if (is_array($value)&&array_key_exists($keymatch,$value)){
					$this->temp_array[] = $value[$keymatch];
				} elseif(is_array($value)&&count($value)>0){
					self::recursiveIterateKeyMatch($value,$keymatch,$valuematch);
				}
			}
			return $this->temp_array;
		} else {
			foreach($products as $value){
				if (is_array($value)){
					if(array_key_exists($keymatch,$value)&&strtolower($value[$keymatch])==strtolower($valuematch)){
				//	if(array_key_exists($keymatch,$value)){
						$this->temp_array = $value;
						break;
					}
					self::recursiveIterateKeyMatch($value,$keymatch,$valuematch);
				}
			}
			return $this->temp_array;
		}
  }

  /**
  /*	getID returns the variation ID by SKU as closely as possible
  **/
  public function getID($sku){
	  try{
		if(isset($this->total['products'])&&count($this->total['products'])>=($this->cnt - 10)){  // I only do - 10for a bit of flexibility in failure
			// do nothing
		} else {
			self::getVariants();
		}
		$products = (array)$this->total;
		$this->temp_array = array();
		$variant = self::recursiveIterateKeyMatch($products,'sku',$sku);
		if(array_key_exists('id',$variant)){
			$id = $variant['id'];
			return $id;
		}
	  } catch(\Exception $e) {
		print('Caught exception: '.$e->getMessage()."\n");
		return FALSE;
	  }
  }

  /**
  /*	putVariants changes the inventory quantity of a given set of ID and Quantity as determined by the CSV.
  **/
  public function putVariants($id,$qty){
	  $METHOD = 'PUT';
	  $CALL = '/admin/variants/'.$id;
	  $url = self::setURL($CALL);
	  $ARG = json_encode(array('variant'=>array('id'=>$id, 'inventory_quantity'=>$qty)));
	  try{
		$response = self::getAPI($METHOD,$url,$ARG);
		return true;
	  } catch(\Exception $e) {
		print('Caught exception: '.$e->getMessage()."\n");
		return FALSE;
	  }
  }

  /**
  *	getCount gets the total count of all products
  **/
  public function getCount(){
          $METHOD = 'GET';
          $CALL = '/admin/products/count';
          $url = self::setURL($CALL);
	  $count = json_decode(self::getAPI($METHOD,$url),TRUE);
	  return $count['count'];
  }


  /**
  /*	getProducts gets all products (so we can pair variants with SKU's)
  **/
  public function getVariants($id=NULL){
	  $METHOD = 'GET';
	  $CALL = '/admin/products';
	  $url = self::setURL($CALL);
	  $url = $url.'?limit=250';
	  if(!is_null($id)){
		$url = $url.'&since_id='.$id;
	  }
	  try{
		$products = json_decode(self::getAPI($METHOD,$url),TRUE);
	/*	if($i!=TRUE){
			if(isset($this->all_prods)){
				$products = $this->all_prods;
			} else {
				$products = json_decode(self::getAPI($METHOD,$url),TRUE);
				$this->all_prods = $products;*/
		/*	}
		} else {
			$products = json_decode(self::getAPI($METHOD,$url),TRUE);
		}*/
		if(!is_null($products)&&is_array($products)&&!empty($products)&&isset($products['products'])&&!empty($products['products'])){
			$product_ids = self::recursiveIterateKeyMatch($products,'product_id'); // previously, this was for "id" but that may not be a queryable value as it's for variant only
			asort($product_ids);
			if($this->i==0){
				$id = reset($product_ids);
				if(isset($products['products']) && !empty($products['products'])){
					$first = $products['products'][0];
					$products['products'] = array($first);
        	                        $this->total['products'] = array_merge($this->total['products'],$products['products']);
	                        }
			} else {
				$id = end($product_ids);
                	        if(!empty($products['products'])){
        	                        $this->total['products'] = array_merge($this->total['products'],$products['products']);
	                        }
			}
		} else {
			return true;
		}
		//print(count($this->total['products']).' ');
		file_put_contents('variant_report.txt',serialize($this->total));
	  } catch(\Exception $e) {
		print('Caught exception: '.$e->getMessage()."\n");
		return FALSE;
	  }
	if(count($this->total['products'])>=$this->cnt){
		//return $this->total;
		return true;
	} elseif(!is_null($id)) {
		$this->i++;
		self::getVariants($id);
	} else {
		return true;
		//return $this->total; // this is a half-assed thing... this really should fail at this point
	}
/*	  if(!empty($products['products'])&&isset($products['products'])&&count($products['products'])>1&&!is_null($id)){
		self::getVariants($id);
	  }
	  return $this->total; */
  }

  /**
  /*	getAPI sets up the API and executes it.
  **/
  public function getAPI($METHOD,$url,$ARG=NULL){
	  $session = curl_init();

	  switch ($METHOD)
	  {
		case "POST":
			curl_setopt($session, CURLOPT_POST, 1);
			if ($ARG){
				 curl_setopt($session, CURLOPT_POSTFIELDS, http_build_query($ARG));
			}
			 break;
		case "PUT":
			curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($session, CURLOPT_CUSTOMREQUEST, "PUT");
			if ($ARG){
				 curl_setopt($session, CURLOPT_POSTFIELDS, $ARG);
			}
			break;
		case "GET":
			curl_setopt($session, CURLOPT_HTTPGET, 1);
	  }

	  curl_setopt($session, CURLOPT_URL, $url);
	  curl_setopt($session, CURLOPT_HEADER, false);
	  curl_setopt($session, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json; charset=utf-8', 'X-HTTP-Method-Override: PUT'));
	  //curl_setopt($session, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
	  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
	  //if(ereg("^(https)",$url))
	  curl_setopt($session, CURLOPT_SSL_VERIFYPEER,false);
	  $response = curl_exec($session);
	  curl_close($session);
	  return $response;
  }
}
// If the URL has a string of paramaters, separated by &, explode them to an array and pass them to the product updater.
$url = (isset($_SERVER['REQUEST_URI']))? $_SERVER['REQUEST_URI'] : null;
$sku = array();
$single = array('sku'=>'','name'=>'','variant'=>'','quantity'=>'');
if (null != ($args = parse_url($url, PHP_URL_QUERY))){
	$all = explode('&&',$args); // explodes each individual product
	foreach($all as $item){
		$exploded = explode('&',$item); // explodes each item's values into an array.
		foreach($exploded as $var){
			$key = strtok($var,'=');
			$val = substr($var,strpos($var,'=')+1);
			$single[$key] = $val;
		}
		$sku[] = $single;
	}
} else {
	$sku = NULL;
}

new ProductUpdater($sku);
?>
