<?php 
$method = $_SERVER['REQUEST_METHOD'];
if(isset($_SERVER['PATH_INFO']))
$request = $_SERVER['PATH_INFO'];

if ($method == 'GET') {
    $link = "http://congress.api.sunlightfoundation.com".$_SERVER['PATH_INFO'].'?'.$_SERVER['QUERY_STRING'];
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo file_get_contents($link);
}
?>