#!/bin/bash
source config.sh
cat $LIST | sort -n | uniq > "$LIST.cleaner"
mv "$LIST.cleaner" $LIST
