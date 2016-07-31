$loc_dbh = new \IP2Location\Database($LOCATION_DATABASE, \IP2Location\Database::MEMORY_CACHE); 
$records   = $db->lookup($ip, \IP2Location\Database::ALL); 
$latitude = $records['latitude']; 
$longitude = $records['longitude']; 
echo "$ip--$raw_datetime--$unixtime--$latitude--$longitude\n";
