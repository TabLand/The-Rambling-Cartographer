<?php

    require_once "config_loader.php";
    
    $conf = get_config();
    $data_dir = $conf["DATA_DIRECTORY"];
    system("ls $data_dir");

?>
