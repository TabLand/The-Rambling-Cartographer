#!/bin/bash

source /etc/the-rambling-cartographer.conf
cd $LOG_LOCATION

FILES=$(ls *access* | sed 's/.\///g' | sort | uniq )

echo "About to process log files $FILES"
cat $FILES | awk '{print $1,$4,$5}' | sed 's/\[//g' | sed 's/\]//g' > $TEMPFILE
LINES=$(wc -l $TEMPFILE)
echo "Finished processing logs for ip and times, found $LINES lines"

php $SCRIPT_ROOT/parse_ip_time.php $TEMPFILE | sort -n | uniq > $LIST

#rm $TEMPFILE

