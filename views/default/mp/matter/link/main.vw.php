<?php
include_once dirname(dirname(dirname(__FILE__))).'/inmp.vw.php';

$view['params']['layout-body'] = '/mp/matter/link/frame';
$view['params']['menu'] = '/page/mp/matter';
$view['params']['css'] = array(array('/mp/matter/link','main'));
$view['params']['global_js'] = array('matters-xxt');
$view['params']['js'] = array(array('/mp','channel'), array('/mp/matter/link','main'));
$view['params']['angular-modules'] = "'channel.matter.mp','matters.xxt'"; 
