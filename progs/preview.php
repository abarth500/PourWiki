<?php
require_once("common.php");
if(isset($_REQUEST["action"])){
	$error=array();
	$id = uniqid();
	$path = "preview/".$id;
	if(!isset($_REQUEST["hidden"])){
		$_REQUEST["hidden"] = array();
	}
	$save = array(
		"title"=>$_REQUEST["title"],
		"contents"=>$_REQUEST["contents"],
		"hidden"=>$_REQUEST["hidden"],
		"pourables"=>array()
	);
	foreach($_REQUEST as $key => $val){
		if(stripos($key,$conf["prefix"]."-p-") === 0){
			list($p,$P,$pourable) = explode("-",$key,3);
			$save["pourables"][$pourable] = $val;
		}
	}
	if(false==file_put_contents($path,json_encode($save))){
		array_push($error,"Cannot create a source file for preview! Ckeck the permission!");
	}
	if(count($error)>0){
		printHeader("Preview- PourWiki");
?>
	<h2>ERROR!</h2>
	<div>
<?php echo implode("<br>",$error); ?>
	</dif>
<?php
		printFooter();
	}else{
		header("Location: ".$_REQUEST["target"]."?preview=".$id);
		exit;
	}
}else if(isset($_REQUEST["p"])){
	if(ctype_alnum($_REQUEST["p"])){
		echo file_get_contents("preview/".$_REQUEST["p"]);
		unlink("preview/".$_REQUEST["p"]);
		if ($dh = opendir("preview")) {
			while (($file = readdir($dh)) !== false) {
				//delete abandoned preview file
				if(time()-filectime("preview/".$file)>30){
					unlink("preview/".$file);
				}
			}
			closedir($dh);
		}
	}else{
		echo "Preview";
	}
	exit;
}else{
	echo "Preview";
}
?>