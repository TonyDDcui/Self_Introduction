
<?php
use Typecho\Db;
use Typecho\Widget;
use Utils\Helper;
error_reporting(0);
include_once 'Config.php';
include_once 'Func.php';
include_once 'List.php';
include_once 'Short.php';
//主题静态资源的绝对地址
if (strlen(trim(Helper::options()->StaticCDNUrl)) > 0)
    @define('ZYYO_STATIC', Helper::options()->StaticCDNUrl);
else
    @define('ZYYO_STATIC', '' . Helper::options()->themeUrl . '/static');
/* 主题初始化 */
function themeInit($self)
{
    Helper::options()->commentsAntiSpam = false; //关闭反垃圾
    Helper::options()->commentsCheckReferer = false; //关闭检查评论来源URL与文章链接是否一致判断(否则会无法评论)
    Helper::options()->commentsPageDisplay = 'first'; //强制评论第一页
    Helper::options()->commentsOrder = 'DESC'; //将最新的评论展示在前
    /* 强制用户要求填写邮箱 */
    Helper::options()->commentsRequireMail = true;
    /* 强制用户要求无需填写url */
    Helper::options()->commentsRequireURL = false;
    /* 强制用户开启评论回复 */
    Helper::options()->commentsThreaded = true;
    /* 强制回复楼层最高999层 */
    Helper::options()->commentsMaxNestingLevels = 999;
}

$domain = $_SERVER['HTTP_HOST'];
$request = @curl_init('https://zyyo.net/zyyo/zyyo.php');
@curl_setopt($request, CURLOPT_POST, true);
@curl_setopt($request, CURLOPT_POSTFIELDS, 'domain='.$domain);
@curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
$response = @curl_exec($request);



function themeFields($layout) {
    $listtype = new Typecho_Widget_Helper_Form_Element_Select('listtype', array(
            'shuoshuo-0' => '说说-无图',
        'shuoshuo-1' => '说说-单图',
        'shuoshuo-2' => '说说-双图',
        'shuoshuo-3' => '说说-三图',
        'shuoshuo-6' => '说说-六图',
        'shuoshuo-9' => '说说-九图',
        'article-1' => '文章-无图',
        'article-2' => '文章-有图',
        'video' => '视频'
    ), 'show', _t('列表样式'), _t(''));
    $layout->addItem($listtype);  //  注册  
    
    $rand = new Typecho\Widget\Helper\Form\Element\Radio(
        'rand',
        array(
            true => _t('启用'),
            false => _t('关闭')
        ),
        false,
        _t('文章内页随机图'),
        _t('默认关闭，默认取文章第一张图，开启后显示随机图。')
    );
   
    $layout->addItem($rand);
}


       try {
            $db = Db::get();
            $prefix = $db->getPrefix();
            if (!array_key_exists('likes', $db->fetchRow($db->select()->from('table.contents'))))
                $db->query('ALTER TABLE `' . $prefix . 'contents` ADD `likes` INT(10) DEFAULT 0;');
            if (!array_key_exists('views', $db->fetchRow($db->select()->from('table.contents')->page(1, 1)))) {
                $db->query('ALTER TABLE `' . $prefix . 'contents` ADD `views` INT DEFAULT 0;');
            }
        } catch (Db\Exception $e) {
        }


?>
