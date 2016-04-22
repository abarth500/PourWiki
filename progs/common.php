<?php
/*
 *  PourWiki [https://github.com/abarth500/PourWiki]
 *  Copyright (c) 2013 Shohei Yokoyama
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
mb_language("ja");
mb_internal_encoding("UTF8");
mb_http_output("UTF8");
date_default_timezone_set("Asia/Tokyo");
function printHeader($title){
?><!DOCTYPE HTML>
<html xml:lang="ja" lang="ja">
<head>
<meta charset="utf-8" />
	<!-- JQuery and Bootstrap -->
	<script src="//code.jquery.com/jquery.min.js"></script>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap-theme.min.css">
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.js"></script>
	<title>Edit - PourWiki</title>
</head>
<body style="">
<div class="col-md-12">
<?php
}
function printFooter(){
?></div></body>
</html>
<?php
}

function getContainers($containerStr){
	global $conf;
	$lowContainers = explode(",",$containerStr);
	$container = array(
		"page"=>array(),
		"dir"=>array(),
		"global"=>array(
			"dynamic"=>array(),
			"static"=>array()
		)
	
	);
	foreach($lowContainers as $lowContainer){
		list($prefix,$id,$name)=explode("-",$lowContainer,3);
		if($id == "p"){
			array_push($container["page"],$name);
		}elseif($id == "d"){
			array_push($container["dir"],$name);
		}elseif($id == "g"){
			array_push($container["global"]["static"],$name);
		}elseif($id == "G"){
			array_push($container["global"]["dynamic"],$name);
		}
	}
	return $container;

}
function auth($user,$password){
	global $conf;
	$md5 = ($conf["passwordType"]=="MD5")?true:false;
	if($conf["userAuth"]=="Postgres"){
		$cstr =  "host=".$conf["userAuthPostgres"]["host"];
		if($conf["userAuthPostgres"]["port"] != ""){
			$cstr.= " port=".$conf["userAuthPostgres"]["port"];
		}
		$cstr.= " dbname=".$conf["userAuthPostgres"]["database"];
		$cstr.= " user=".$conf["userAuthPostgres"]["user"];
		if($conf["userAuthPostgres"]["password"] != ""){
			$cstr.= " password=".$conf["userAuthPostgres"]["password"];
		}
		$cstr.= " options='--client_encoding=UTF8'";
		$conn = pg_connect($cstr);
		$sql = "SELECT ".
			$conf["userAuthPostgres"]["field_id"]." as id,".
			$conf["userAuthPostgres"]["field_password"]." as pwd,".
			$conf["userAuthPostgres"]["field_name"]." as name ".
			"FROM ".$conf["userAuthPostgres"]["table"]." ".
			"WHERE ".$conf["userAuthPostgres"]["field_id"]." = '".$user."'";
		if($conf["userAuthPostgres"]["sql_where"] != ""){
			$sql .= " AND (".$conf["userAuthPostgres"]["sql_where"].")";
		}
		$result = pg_query($conn,$sql);
		$row = pg_fetch_assoc($result);
		if($row === false){
			return array("status"=>false,"code"=>10);
		}else{
			if($row["pwd"] == md5($password)){
				return array("status"=>true,"id"=>$row["id"],"name"=>$row["name"]);
			}else{
				return array("status"=>false,"code"=>11);
			}
		}
	}else{
		if(is_readable($conf["userAuthText"]["path"])){
			$file = file($conf["userAuthText"]["path"]);
			foreach($file as $line){
				$l = explode($conf["userAuthText"]["delimiter"],$line);
				$u = $l[$conf["userAuthText"]["index_id"]];
				$p = $l[$conf["userAuthText"]["index_password"]];
				$n = $l[$conf["userAuthText"]["index_name"]];
				if($u == $user){
					if($md5){
						if (md5($password) == $p){
							return array("status"=>true,"id"=>$u,"name"=>$n);
						}else{
							return array("status"=>false,"code"=>1);
						}
					}else{
						if($p == $password){
							return array("status"=>true);
						}else{
							return array("status"=>false,"code"=>2);
						}
					}
					break;
				}else{
					continue;
				}
			}
		}else{
			return array("status"=>false,"code"=>3);
		}
	}
	return array("status"=>false,"code"=>4);
}


require_once("../pourconf.php");
$confPub = "";
$start = false;
$confjs = file("../pourconf.js");
foreach($confjs as $line){
	if(!$start){
		if(str_replace(array(" ","\n","\r","\t"),array(),$line) == '/*JSON_CONFIGURATION_START*/'){
			$start = true;
		}
		continue;
	}else{
		if(str_replace(array(" ","\n","\r","\t"),array(),$line) == '/*JSON_CONFIGURATION_END*/'){
			break;
		}
		if(stripos(trim($line),"//") !== 0){
			$confPub .= $line;
		}
	}
}
$confPub = json_decode($confPub,true);
$conf = array_merge($conf,$confPub);
$USER = null;
if (!isset($_SERVER['PHP_AUTH_USER'])) {
	header("WWW-Authenticate: Basic realm=\"PourWiki Admin\"");
	header("HTTP/1.0 401 Unauthorized");
	die("Only PourWiki users can login.\n");
    exit;
} else {
	$USER = auth($_SERVER['PHP_AUTH_USER'],$_SERVER['PHP_AUTH_PW']);
	if(!$USER["status"]){
		header("WWW-Authenticate: Basic realm=\"PourWiki Admin".$conf["userAuth"]."\"");
		header("HTTP/1.0 401 Unauthorized");
	    die ("Wrong ID or Password (".$USER["code"].")");
	    exit;
	}
}
?>