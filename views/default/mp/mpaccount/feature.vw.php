<?php
include_once dirname(__FILE__) . '/wrap.vw.php';

$view['params']['global_js'] = array('tinymce/tinymce.min', 'xxt.ui');
$view['params']['angular-modules'] = "'ui.xxt'";
$view['params']['js'][] = array('/mp/mpaccount', 'feature');
$view['params']['sub-view'] = 'feature';