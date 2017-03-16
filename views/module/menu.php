<?php
$menu = array(
	"vanster"=>array("play", "pause", "speed-45", "speed-33"),
	"hoger"=>array("tune-up", "tune-down")
);
?>
<ul class="app-style">
	<?php
		foreach($menu[$id] as $action):
			?>
				<li class="item-<?=$action?>">
					<a class="action <?=$action?>"></a>
				</li>
			<?php
		endforeach;
	?>
</ul>