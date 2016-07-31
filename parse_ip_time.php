#!/usr/bin/php
<?php
    $TEMPFILE = $argv[1];

    start($TEMPFILE);
    
    function start($TEMPFILE){

        $fh = fopen($TEMPFILE, "r");
        if($fh){
            $i = 0;
            while (($line = fgets($fh)) !== false) {
                process_line($line);
                $i++;
            }
            fclose($fh);
        }
    }
    
    function process_line($line){
        $parts        = explode(" ", $line, 2);
        $ip           = $parts[0];
        $raw_datetime = trim($parts[1]);
        $unixtime     = parse_date($parts[1]);

        echo "$unixtime\t$ip\n";
    }

    function parse_date($datetime){
        return strtotime($datetime);
    }
?>
