<?php
require_once '../../db.php';

$sqls = array();
//
$sqls[] = 'alter table xxt_enroll_record_data add score float not null default 0 after last_remark_at';

foreach ($sqls as $sql) {
	if (!$mysqli->query($sql)) {
		header('HTTP/1.0 500 Internal Server Error');
		echo 'database error: ' . $mysqli->error;
	}
}

echo "end update " . __FILE__ . PHP_EOL;