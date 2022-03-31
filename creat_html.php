<?php
define('IN_ECS', true);
define('INIT_NO_USERS', true);
define('INIT_NO_SMARTY', true);
require(dirname(__FILE__) . '/includes/init.php');
$site_url = rtrim($ecs->url(),'/');
$index_file = ROOT_PATH . 'index.html';
$source_url = $site_url . '/index.php';
ini_set('user_agent','Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; GreenBrowser)');
file_put_contents($index_file, file_get_contents($source_url), LOCK_EX);
?>
静态首页已经生成<a href="<?php echo $site_url; ?>" target="_blank">浏览首页…</a>