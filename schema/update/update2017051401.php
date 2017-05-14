<?php
require_once '../../db.php';

$sqls = array();
//
$sqls[] = "alter table xxt_enroll_record_data add like_log longtext";
$sqls[] = "alter table xxt_enroll_record_data add like_num int not null default 0";
$sqls[] = "alter table xxt_enroll_record_remark add like_log longtext";
$sqls[] = "alter table xxt_enroll_record_remark add like_num int not null default 0";
//
foreach ($sqls as $sql) {
	if (!$mysqli->query($sql)) {
		header('HTTP/1.0 500 Internal Server Error');
		echo 'database error: ' . $mysqli->error;
	}
}

echo "end update " . __FILE__ . PHP_EOL;