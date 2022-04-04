#!/bin/bash
echo "Inside the db-scripts"
psql << EOF
DROP DATABASE IF EXISTS $POSTGRES_DB;
CREATE DATABASE $POSTGRES_DB;


EOF