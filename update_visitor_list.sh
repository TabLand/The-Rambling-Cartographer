#/bin/bash
source /etc/the-rambling-cartographer.conf
cd $LOG_LOCATION

FILES=$(find . -mmin -$MINUTES_AGO -exec ls {} \; | grep access | grep -v gz | sed 's/.\///g' | sort | uniq )
START=$(($(date +%s) - ($MINUTES_AGO * 60)))
PATTERN=$(date -d @$START "+%d/%b/%Y:%H:")

cat $FILES | awk '{print $1,$4,$5}' | grep "$PATTERN" | sed 's/\[//g' | sed 's/\]//g' > $TEMPFILE

cd $SCRIPT_ROOT
php parse_ip_time.php $TEMPFILE | sort -n | uniq >> $IP_TIME_LIST

rm $TEMPFILE

cd $DATA_DIRECTORY
echo "About to split $IP_TIME_LIST"
split --verbose --numeric-suffixes --lines=5000 $IP_TIME_LIST ""
