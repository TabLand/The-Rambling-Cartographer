#/bin/bash
source /etc/the-rambling-cartographer.conf
cd $LOG_LOCATION

FILES=$(find . -mmin -$MINUTES_AGO -exec ls {} \; | grep access | sed 's/.\///g' | sort | uniq )
START=$(($(date +%s) - ($MINUTES_AGO * 60)))
PATTERN=$(date -d @$START "+%d/%b/%Y:%H:")

cat $FILES | awk '{print $1,$4,$5}' | grep "$PATTERN" | sed 's/\[//g' | sed 's/\]//g' > $TEMPFILE

php $SCRIPT_ROOT/parse_ip_time.php $TEMPFILE | sort -n | uniq >> $LIST

rm $TEMPFILE
