<?php

namespace vinyl;

class helper {
	static $model = array("file");
	static $controller = array("play");

	static $logfile = "/var/www/html/commands/log.json";
	static $commandfile = "/var/www/html/commands/command.json";

	function __construct($view = false) {
		self::initialize();

		$view = $view?$view:$_REQUEST['view'];
		foreach(self::$controller as $controller) {
			if(method_exists("\\vinyl\\controller\\".$controller, $view)) {
				$controller = "\\vinyl\\controller\\".$controller;
				$controller = new $controller;
				echo $controller->$view();
			}
		}
	}

	static function initialize() {
		foreach(self::$model as $model) {
			include_once("models/".$model.".php");
			$model = "\\vinyl\\model\\".$model;
			new $model();
		}

		foreach(self::$controller as $controller) {
			include_once("controllers/".$controller.".php");
		}
	}

	static function render($folder, $file, $content, $id = false) {
		include("views/".$folder."/".$file.".php");
	}

	static function url($id, $view, $type = "one") {
		return "/?view=".$type.$view.($id?"&id=".$id:"");
	}
}