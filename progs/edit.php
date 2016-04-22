<?php
/*
 *  PourWiki [https://github.com/abarth500/PourWiki]
 *  Copyright (c) 2013 Shohei Yokoyama
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
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
	$source .= $conf["indexFileName"].".txt";
}elseif(preg_match("/\.[a-zA-Z0-9]+$/",$source)){
	$source = preg_replace("/\.[a-zA-Z0-9]+$/",'.txt',$source);
}else{
	$source .= "/"+$conf["indexFileName"].".txt";
}

//Check and load pourables
if(count($error)==0){
	$dirPath   = pathinfo($source,PATHINFO_DIRNAME);
	$dirName   = explode("/",$dirPath);
	$dirName   = array_pop($dirName);
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
				"title"=>"$dirName",
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
		if(false === file_put_contents($dirSource,$_REQUEST["contents"])){
			array_push($error,"The directory file permission denied! Make <b>".$dirSource."</b> writable!");
		}else{
			$save = array(
				"title"=>$_REQUEST["dirTitle"],
				"pourables"=>array()
			);
			foreach($_REQUEST as $key => $val){
				if(stripos($key,$conf["prefix"]."-d-") === 0){
					list($p,$P,$pourable) = explode("-",$key,3);
					$save["pourables"][$pourable] = $val;
				}
			}
			if(false==file_put_contents($dirSource,json_encode($save))){
				array_push($error,"Cannot create a directory file! I don't know why!");
			}else{
				array_push($info,'Update the direcotry successfully!');
			}
		}
		if(false === file_put_contents($source,$_REQUEST["contents"])){
			array_push($error,"The source file permission denied! Make <b>".$source."</b> writable!");
		}else{
			$save = array(
				"title"=>$_REQUEST["title"],
				"contents"=>$_REQUEST["contents"],
				"hidden"=>isset($_REQUEST["hidden"])?$_REQUEST["hidden"]:array(),
				"pourables"=>array()
			);
			if(isset($_REQUEST['parent']) and $_REQUEST['parent'] != ""){
				$parent_row = explode('/',$_REQUEST['parent']);
				$parent = array();
				foreach($parent_row as $p) {
					$matches = array();
					$result = preg_match('/^([\w]+)(\[([\w\,]+)\])?$/', $p, $matches);
					if(isset($matches[1])) {
						$in = array("page" => $matches[1]);
						if(isset($matches[3])){
							$in['querystring'] = explode(',', $matches[3]);
						}
						array_push($parent,$in);
					}
					if(!$result){
						array_push($error,'The format of additional parent is wrong! Please see the document!');
						break;
					}
				}
				if(count($error)==0) {
					$save['parent'] = $parent;
				}

			}
			foreach($_REQUEST as $key => $val){
				if(stripos($key,$conf["prefix"]."-p-") === 0){
					list($p,$P,$pourable) = explode("-",$key,3);
					$save["pourables"][$pourable] = $val;
				}
			}
			if(false==file_put_contents($source,json_encode($save))){
				array_push($error,"Cannot create the source file! I don't know why!");
			}else{
				array_push($info,'Update the page successfully!');
			}
		}
	}
	$src = json_decode(file_get_contents($source),true);
	if(count($error)==0 and isset($_REQUEST["action"]) and$_REQUEST["action"]=="delete"){
		if(false==unlink($source)){
			array_push($error,"Cannot delete the source file! I don't know why!");
		}else{
			array_push($info,'Delete the page successfully! If you want to exhume the page, click [Pour] immediately!');
		}

	}
	
	$srcDir = json_decode(file_get_contents($dirSource),true);
	$vTitle = $src["title"];
	$vDirTitle = $srcDir["title"];
	$vContents = $src["contents"];
	$vPage = $src["pourables"];
	$vHidden = $src["hidden"];
	$vDir = $srcDir["pourables"];
	$vParent = array();
	if(isset($src['parent'])){
		foreach($src['parent'] as $p){
			$vP = $p['page'];
			if(isset($p['querystring'])){
				$vP .= '['.implode(',',$p['querystring']).']';
			}
			array_push($vParent,$vP);
		}
	}
	$vParent = implode(',',$vParent);
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
	<div class="alert alert-success">
		<strong>Error!</strong><ul><li><?php echo implode("<li>",$error); ?></ul>
	</div>
<?php
}else{
	if(count($info)>0){
?>
	<div class="alert alert-success">
		<strong>Well Done!</strong><ul><li><?php echo implode("<li>",$info); ?></ul><a href="<?php echo $target; ?>" class="alert-link">Back to the page!</a>
	</div>

<?php
	}
?>
	<h2>Pour out!</h2>
	<div>
		Source:<b><?php echo $source; ?></b><br>
		Target:<b><?php echo '<a href="'.$target.'">'.$target."</a>"; ?></b>
	</div>
	<form class="form-horizontal" role="form" id="formEdit" method="POST">
		<input type="hidden" name="action" value="edit">
		<input type="hidden" name="target" value="<?php echo $target; ?>">
		<input type="hidden" name="c" value="<?php echo $_REQUEST["c"]; ?>">
		<div class="form-group">
			<label for="inputEmail3" class="col-sm-2 control-label">Page Title</label>
			<div class="col-sm-10">
				<input type="text" name="title" value="<?php echo $vTitle; ?>" class="form-control" placeholder="Title">
			</div>
		</div>
		
		<div class="form-group">
			<label for="contents" class="col-sm-2 control-label">Page Contents</label>
			<div class="col-sm-10">
				<textarea name="contents" rows="20" class="form-control"><?php echo $vContents; ?></textarea>
			</div>
		</div>
		
		<div class="form-group">
			<label class="col-sm-2 control-label">Hidden Containers</label>
			<div class="col-sm-10">
			
				<?php 
foreach ($containerIDs as $id){
	echo '<div class="checkbox"><label><input type="checkbox" name="hidden[]" value="'.$id.'"'.((array_search($id,$vHidden)===false)?"":" checked").'>'.$id."</label></div>";
}
				?>
			</div>
		</div>
		
		<div class="form-group">
			<label class="col-sm-2 control-label">Page Pourables</label>
			<div class="col-sm-10">
				<?php 
if(count($containers["page"] )>0){
	foreach($containers["page"] as $pourable){
		$v = isset($vPage[$pourable])?$vPage[$pourable]:"";
		echo '<div class="col-sm-2 control-label"><b>'.$pourable.'</b></div><div class="col-sm-10"><input type="text" name="'.$conf["prefix"].'-p-'.$pourable.'" value="'.$v.'" class="form-control"></div>';
	}
}else{
	echo "none";
}
				?>
			</div>
		</div>
		
		<div class="form-group">
			<label for="dirTitle" class="col-sm-2 control-label">Directory Title</label>
			<div class="col-sm-10">
				<input type="text" name="dirTitle" value="<?php echo $vDirTitle; ?>" class="form-control" placeholder="Directory Title">
			</div>
		</div>

		<div class="form-group">
			<label for="parent" class="col-sm-2 control-label">Addition Parent (if exists)</label>
			<div class="col-sm-10">
				<input type="text" name="parent" value="<?php echo $vParent; ?>" class="form-control" placeholder="filename.php[qs-key1,qs-key2]">
			</div>
		</div>

		<div class="form-group">
			<label for="inputEmail3" class="col-sm-2 control-label">Directory Pourables</label>
			<div class="col-sm-10">
				<?php echo json_encode($vDir); ?>
			</div>
		</div>
		
		<div class="form-group">
			<label for="inputEmail3" class="col-sm-2 control-label">Grobal Pourables (Static)</label>
			<div class="col-sm-10">
				<?php echo implode("<br>",$vGStatic); ?>
			</div>
		</div>
		
		<div class="form-group">
			<label for="inputEmail3" class="col-sm-2 control-label">Grobal Pourables (Dynamic)</label>
			<div class="col-sm-10">
				<?php echo implode("<br>",$vGDynamic); ?>
			</div>
		</div>
		<div class="form-group">
			<div class="col-sm-offset-2 col-sm-10">
				<button type="submit" class="btn btn-primary" name="btnPour" id="btnPour" >Pour</button>
				<button type="submit" class="btn btn-default" name="btnPreview" id="btnPreview">Preview</button>
			</div>
		</div>
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
	<hr>
	<div class="alert alert-danger"><strong>Danger Zone!</strong><br>
		<form class="form-horizontal" role="form" id="formEdit" method="POST">
		<div class="form-group">
			<label for="inputEmail3" class="col-sm-2 control-label">Are you sure to</label>
			<input type="hidden" name="action" value="delete">
			<input type="hidden" name="target" value="<?php echo $target; ?>">
			<button type="submit" class="btn btn-danger">delete this page?...YES!</button>
		</div>
		</form>
	</div>
<?php
}
printFooter();
?>
