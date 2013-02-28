<?php
require_once("common.php");
if(!isset($_REQUEST["target"])){
	if(!isset($_SERVER["HTTP_REFERER"])){
		echo "No HTTP REFERER!";
		exit;
	}else{
		$target = $_SERVER["HTTP_REFERER"];
	}
}else{
	$target = $_REQUEST["target"];
}
$targetPath = parse_url($target, PHP_URL_PATH);
$source = "../docs/local".parse_url($targetPath, PHP_URL_PATH);
$targetPath = "../..".$targetPath;

$error = array();
$info = array();


$containers = getContainers($_REQUEST["c"]);
$containerIDs = explode(",",$_REQUEST["c"]);


//Check Source file
if(substr( $targetPath, strlen( $targetPath) - strlen( "/" ) ) === "/"){
	$targetPath .= $conf["indexFileName"];
	$source .= $conf["indexFileName"].".txt";
	$exp = $conf["indexExpression"];
	$exist = false;
	foreach($exp as $e){
		if(file_exists($targetPath.".".$e)){
			$targetPath .= ".".$e;
			$exist = true;
		}
	}
	if(!$exist){
		array_push($error,"Target HTML file is missing! Where is <b>".$target."</b>?");
	}
}else{
	$source = preg_replace("/\.[a-zA-Z]{2,4}$/",'.txt',$source);
	if(!file_exists($targetPath)){
		array_push($error,"Target HTML file is missing! Where is <b>".$target."</b>?");
	}
}

//Check and load pourables
if(count($error)==0){
	$dirPath   = pathinfo($source,PATHINFO_DIRNAME);
	$dirSource = $dirPath."/.txt";
	if(!file_exists("../docs/local")){
		array_push($error,"Directory missing! Do you know where the <b>".$conf["baseDir"]."docs/local</b> is?");
	}else if(!is_writable("../docs/local")){
		array_push($error,"Directory permission denied! Make <b>../docs/local</b> writable!");
	}else{
		if(!file_exists($dirPath) and false == mkdir($dirPath,0700)){
			array_push($error,"Cannot create a directory (".$dirPath.") file! I don't know why!");
		}
		if(!file_exists($dirSource)){
			$save = array(
				"title"=>"New Page",
				"pourables"=>array()
			);
			if(false==file_put_contents($dirSource,json_encode($save))){
				array_push($error,"Cannot create a directory source(".$dirSource.") file! I don't know why!");
			}
		}else if(!is_writable($dirSource)){
			array_push($error,"The source file permission denied! Make <b>".$dirSource."</b> writable!");
		}
	}
	if(!file_exists($source)){
		$save = array(
			"title"=>"New Page",
			"contents"=>"It is fine today.",
			"hidden"=>array(),
			"pourables"=>array()
		);
		if(false==file_put_contents($source,json_encode($save))){
			array_push($error,"Cannot create a source file! I don't know why!");
		}
	}else if(!is_writable($source)){
		array_push($error,"The source file permission denied! Make <b>".$source."</b> writable!");
	}
	if(count($error)==0 and isset($_REQUEST["action"]) and$_REQUEST["action"]=="edit"){
		if(false === file_put_contents($source,$_REQUEST["page"])){
			array_push($error,"The source file permission denied! Make <b>".$source."</b> writable!");
		}else{
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
			if(false==file_put_contents($source,json_encode($save))){
				array_push($error,"Cannot create a source file! I don't know why!");
			}else{
				array_push($info,'Update successfully! Go to <a href="'.$target.'">the page</a>!');
			}
		}
	}
	$src = json_decode(file_get_contents($source),true);

	$srcDir = json_decode(file_get_contents($dirSource),true);
	$vTitle = $src["title"];
	$vContents = $src["contents"];
	$vPage = $src["pourables"];
	$vHidden = $src["hidden"];
	$vDir = $srcDir["pourables"];
	$vGStatic = array();
	$vGDynamic = array();
	if ($handle = opendir('../docs/global')) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." && $entry != "..") {
				if (preg_match("/.php$/i", $entry) and is_file('../docs/global/'.$entry)){
					array_push($vGDynamic,$entry);
				}else if(preg_match("/.txt$/i", $entry) and is_file('../docs/global/'.$entry)){
					array_push($vGStatic,$entry);
				}
			}
		}
	}
}
printHeader("Edit - PourWiki");
?>
	<h1>Edit - PourWiki</h1>
<?php
if(count($error)>0){
?>
	<h2>ERROR!</h2>
	<div>
<?php echo implode("<br>",$error); ?>
	</dif>
<?php
}else{
	if(count($info)>0){
?>
	<h2>Infomation</h2>
	<div>
<?php echo implode("<br>",$info); ?>
	</div>
<?php
	}
?>
	<h2>Pour out!</h2>
	<div>
		Source:<b><?php echo $source; ?></b><br>
		Target:<b><?php echo '<a href="'.$target.'">'.$target."</a>"; ?></b>
	</div>
	<form id="formEdit" method="POST">
		<input type="hidden" name="action" value="edit">
		<input type="hidden" name="target" value="<?php echo $target; ?>">
		<input type="hidden" name="c" value="<?php echo $_REQUEST["c"]; ?>">
		<h4>Page Title</h4>
		<input type="text" name="title" value="<?php echo $vTitle; ?>">
		<h4>Page Contents</h4>
		<textarea name="contents"><?php echo $vContents; ?></textarea><br>
		<h4>Visible Control</h4>
		<?php 
foreach ($containerIDs as $id){
	echo '<input type="checkbox" name="hidden[]" value="'.$id.'">'.$id."<br>";
}
		?><br>
		<h4>Page Pourables</h4>
		<?php 
if(count($containers["page"] )>0){
	foreach($containers["page"] as $pourable){
		$v = isset($vPage[$pourable])?$vPage[$pourable]:"";
		echo $pourable.'<input type="text" name="'.$conf["prefix"].'-p-'.$pourable.'" value="'.$v.'"><br>';
	}
}else{
	echo "none";
}
		?><br>
		<h4>Directory Pourables</h3> 
		<?php echo json_encode($vDir); ?><br>
		<h4>Grobal Pourables</h4>
		<h5>Static</h5>
		<?php echo implode("<br>",$vGStatic); ?>
		<h5>Dynamic</h5>
		<?php echo implode("<br>",$vGDynamic); ?>
		<br>
		<input type="button" name="btnPour" id="btnPour" value="Pour">
		<input type="button" name="btnPreview" id="btnPreview" value="Preview"><br>
		<script>
			$(function(){
				$(window).load(function(){
					$("#btnPour").on("click",function(){
						$("#formEdit").attr("action","").attr("target","_self").submit();
					});
					$("#btnPreview").on("click",function(){
						$("#formEdit").attr("action","preview.php").attr("target","_blank").submit();
					});
				});
			});
		</script>

	</form>
<?php
}
printFooter();
?>
