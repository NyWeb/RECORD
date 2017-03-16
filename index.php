<?php
	include("helper.php");
	if($_REQUEST['format']=="raw"):
		new vinyl\helper();
	else:
		if(!$_REQUEST['view']) $_REQUEST['view'] = "oneplay";
		$lang = "en-GB";
		class JText{static $file;function __construct($lang){self::$file = parse_ini_file("languages/".$lang.".ini");}static function _($name){return self::$file[strtoupper($name)]?self::$file[strtoupper($name)]:$name;}} new JText($lang);

		?>
			<!DOCTYPE html>
			<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?=$lang?>" lang="<?=$lang?>" dir="ltr" >
				<head>
					<title>&nbsp;</title>
					<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
					<link href="assets/css.css" rel="stylesheet" />
					<script src="assets/library.js"></script>
					<script src="assets/js.js"></script>
				</head>
				<body>
					<script>loader.initialize('listen')</script>
					<div id="bg"></div>
					<div id="wrapper">
						<div id="header">
							<?=vinyl\helper::render("module", "header", false)?>
						</div>
						<div id="vanster">
							<?=vinyl\helper::render("module", "menu", $_REQUEST['view'], "vanster")?>
						</div>
						<div id="innehall">
							<?php
								new vinyl\helper();
							?>
						</div>
						<div id="hoger">
							<?=vinyl\helper::render("module", "menu", $_REQUEST['view'], "hoger")?>
						</div>
					</div>

					<div id="sidfotholder">
						<div id="sidfot">
							Copyright &copy; 2014 - 2016 Vinyl community. All rights assigned to the public domain
						</div>
					</div>
					<script>loader.initialize('dom')</script>
				</body>
			</html>
		<?php
	endif;
?>