<?php
    require_once "config_loader.php";
    $conf = get_config();
    $data_dir = $conf["DATA_DIRECTORY"];

    $result = array();

    if(isset($_GET["CHUNK"])){
        $chunk_id = $_GET["CHUNK"];
    }
    else {
        $result["error"] = "Which chunk do you want mate?";
        print_and_exit($result);
    }
    
    $chunk_path = "$data_dir/$chunk_id";

    if(file_exists($chunk_path)){
        $lines = read_file_in_reverse($chunk_path);
        print_and_exit($lines);
    }
    else {
        $result["error"] = "Sorry, chunk not found";
        print_and_exit($result);
    }

    function print_and_exit($result){
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }

    function read_file_in_reverse($chunk_path){
        $fh = fopen($chunk_path,"r");
        $pos = -2;
        $lines = array();
        $current_line = "";
        while (-1 !== fseek($fh, $pos, SEEK_END)) {
            $char = fgetc($fh);
            
            if (PHP_EOL == $char){
                $lines[] = $current_line;
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
