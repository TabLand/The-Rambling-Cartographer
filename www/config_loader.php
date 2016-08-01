<?php

    function get_config(){
        exec("bash -c 'source /etc/the-rambling-cartographer.conf; env'", $items);
        $conf = array();
        for($i = 0; $i < count($items); $i++){
            $parts = explode("=",$items[$i],2);
            if(count($parts) == 2) $conf[$parts[0]] = $parts[1];
        }

        return $conf;
    }

?>
