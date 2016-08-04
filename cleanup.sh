#!/bin/bash
source config.sh
cat $IP_TIME_LIST | sort -n | uniq | strings > "$IP_TIME_LIST.cleaner"
mv "$IP_TIME_LIST.cleaner" $IP_TIME_LIST
