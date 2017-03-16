<?php

namespace vinyl\controller;

use vinyl\helper, vinyl\model;

class play {
	function oneplay() {
		helper::render("play", "one", false);
	}

	function saveplay() {
		$error = 0;

		//If vinyl hasn't deleted the file
		while(file_exists(helper::$commandfile)) {
			sleep(6);
			//return error
			if($error++>10) die('{"error":{"vinyl": {"message": "vinyl not active"}}}');
		}

		//Save command
		if($_REQUEST['json']) file_put_contents(helper::$commandfile, urldecode($_REQUEST['json']), LOCK_EX);

		echo file_get_contents(helper::$logfile);
		unlink(helper::$logfile);
	}
}