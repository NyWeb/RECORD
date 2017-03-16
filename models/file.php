<?php

namespace vinyl\model;

class file {
	static function getfilebyfolder($folder) {
		$array = array();
		foreach(glob($folder."/*") as $file) {
			$file = end(explode("/", $file));
			$array[$file] = is_dir($file);
		}

		return $array;
	}

	static function getfilebyname($name, $folder) {
		return file_get_contents($folder."/".$name);
	}

	static function savefile($name, $content, $folder, $type = 0) {
		if($type==0) {
			file_put_contents($folder."/".$name, $content);
		}
	}
}