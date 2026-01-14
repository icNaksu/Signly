<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = $_POST["name"];
  $email = $_POST["email"];
  $message = $_POST["message"];

  $to = "yourgmail@gmail.com";
  $subject = "New Contact Message";
  $headers = "From: $email";

  mail($to, $subject, $message, $headers);
}
?>
