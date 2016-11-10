<?php 
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $req = $_SERVER['QUERY_STRING'];
    $index = strpos($req,"&");
    $req = substr($req,$index);
    $link = "http://congress.api.sunlightfoundation.com/".$_GET['operation']."?".$req;
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo file_get_contents($link);
}
?>
