<?php
	$file = file_get_contents("comments.json", true);
    $comments = json_decode($file, true);
   	
   	$newComment = array("author" => $_POST["author"], "text" => $_POST["text"]);

	array_push($comments, $newComment);
	
	file_put_contents("comments.json", json_encode($comments));
?>
