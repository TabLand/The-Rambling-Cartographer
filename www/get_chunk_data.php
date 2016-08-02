<?php
    require_once "config_loader.php";
    require_once "IP2LOCATION-API/IP2Location.php";

    $loc_db = new \IP2Location\Database('IP2LOCATION-LITE-DB5.BIN/IP2LOCATION-LITE-DB5.BIN', \IP2Location\Database::MEMORY_CACHE);
    
    $conf = get_config();
    $data_dir = $conf["DATA_DIRECTORY"];

    $result = array();

    if(isset($_GET["CHUNK"])){
        $chunk_id = $_GET["CHUNK"];
    }
    else {
        $result["error"] = "Which chunk did you want mate?";
        print_and_exit($result);
    }
    
    $chunk_path = "$data_dir/$chunk_id";

    if(file_exists($chunk_path)){
        $entries = read_file_in_reverse($chunk_path, $loc_db);
        print_and_exit($entries);
    }
    else {
        $result["error"] = "Sorry, chunk not found";
        print_and_exit($result);
    }

    function print_and_exit($result){
        echo json_encode($result);
        exit;
    }

    function read_file_in_reverse($chunk_path, $loc_db){
        $fh = fopen($chunk_path,"r");
        $pos = -2;
        $lines = array();
        $current_line = "";
        while (-1 !== fseek($fh, $pos, SEEK_END)) {
            $char = fgetc($fh);
            
            if (PHP_EOL == $char){
                $parts        = explode("\t", $current_line, 2);
                $unixtime     = $parts[0];
                $ip_address   = $parts[1];
                $location     = $loc_db->lookup($ip_address, \IP2Location\Database::ALL);

                $lines[]      = array("time" => $unixtime, "latitude" => $location["latitude"], "longitude" => $location["longitude"]);
                $current_line = '';
            } 
            else {
                $current_line = $char . $current_line;
            }
            $pos--;
        }
        fclose($fh);
        return $lines;
    }
?> 
