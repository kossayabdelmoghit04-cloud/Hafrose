#!/bin/sh
set -eu
export MYSQL_PWD=$MYSQL_ROOT_PASSWORD
exec mysqladmin ping --host=127.0.0.1 --user=root --silent
