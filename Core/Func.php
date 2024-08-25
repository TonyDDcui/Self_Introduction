
<?php
use Widget\Archive;
use Typecho\Db;
use Typecho\Widget;
use Utils\Helper;

class Func
{
    //下一篇
public static function timeAgo($timestamp) {
  $current_time = time();
  $time_diff = $current_time - $timestamp;

  if ($time_diff < 60) {
    return '刚刚';
  } elseif ($time_diff < 3600) {
    $minutes = floor($time_diff / 60);
    return $minutes . '分钟前';
  } elseif ($time_diff < 86400) {
    $hours = floor($time_diff / 3600);
    return $hours . '小时前';
  } else {
    $days = floor($time_diff / 86400);
    return $days . '天前';
  }
}



public static function yxtime(){
$currentDate = date('Y-m-d'); // 获取当前日期  
$launchDate = '2022-01-01'; // 假设网站上线日期为2022年1月1日  
  
$currentTimestamp = strtotime($currentDate);  
$launchTimestamp = strtotime($launchDate);  
  
$daysSinceLaunch = ($currentTimestamp - $launchTimestamp) / (60 * 60 * 24);  
  
return round($daysSinceLaunch);  

}
            public static function Title(Archive $archive): string
    {
        if ($archive->is('index')) {
            return Helper::options()->title ;
        } else {
            $archive->archiveTitle(array(
                'category' => '分类 %s 下的文章',
                'search' => '包含关键字 %s 的文章',
                'tag' => '标签 %s 下的文章',
                'author' => '%s 发布的文章'
            ), '', ' - ');
            return Helper::options()->title;
        }
    }
    
    
    
        public static function Header()
    {
return Helper::options()->zdyHeader().'         
 <link rel="icon" href="'.Helper::options()->ico.'" />
<link rel="stylesheet" href="'.ZYYO_STATIC.'/css/nprogress.css">   
 <link rel="stylesheet" href="'.ZYYO_STATIC.'/css/font.css">
     <script src="'.ZYYO_STATIC.'/js/jquery.min.js"></script>
     <script src="'.ZYYO_STATIC.'/js/view-image.min.js"></script>
       <script src="'.ZYYO_STATIC.'/js/jquery.pjax.min.js"></script>
         <link rel="stylesheet" href="'.ZYYO_STATIC.'/css/root.css">
  <link rel="stylesheet" href="'.ZYYO_STATIC.'/css/style.css">
  <style>
  @font-face {
  font-family: "a";
  src: url('.Helper::options()->font.');
  font-display: swap;
}
 @font-face {
  font-family: "b";
  src: url('.ZYYO_STATIC .'/Ubuntu-Regular.ttf);
  font-display: swap;
}
*{
font-family: "b", "a", sans-serif;
}
     </style>';
    }
    
    
        public static function Footer()
    {
    
return Helper::options()->zdyFooter().'
        <script src="'.ZYYO_STATIC.'/js/jquery.lazyload.js"></script>
       <script src="'.ZYYO_STATIC.'/js/nprogress.min.js"></script>

<script src="'.ZYYO_STATIC.'/js/main.js"></script>';

    }
    public static function logo()
    {
        return Helper::options()->logo(); 
    }
    public static function loadimg()
    {
        
        
     if (Helper::options()->loadimg == "")
     {
         return ZYYO_STATIC."/img/load.gif";
     }else {
         return Helper::options()->loadimg;
     }
    }
    public static function ico()
    {
       return Helper::options()->ico();
    }
   
    public static function banner()
    {
        return Helper::options()->banner(); 
    }
    
    public static function footerbeian()
    {
        return Helper::options()->footerbeian(); 
    }
    public static function url()
    {
        return Helper::options()->siteurl(); 
    }
    public static function AuthorTitle()
    {
            Helper::options()->AuthorTitle();
       
       
    }
    public static function AuthorLogo()
    {
        return Helper::options()->AuthorLogo(); 
    }
        public static function YiYan()
    {
        return Helper::options()->YiYan(); 
    }
 public static function viewsCounter()
    {
            $db = Db::get();
            $cid = Widget::widget('Widget_Archive')->cid;
            $row = $db->fetchRow($db->select('views')->from('table.contents')->where('cid = ?', $cid));
            $db->query($db->update('table.contents')->rows(array('views' => (int)$row['views'] + 1))->where('cid = ?', $cid));
      
     }


    
    public static function theNext($widget, $default = NULL)
    {
        $db = Db::get();
        $sql = $db->select()->from('table.contents')
            ->where('table.contents.created > ?', $widget->created)
            ->where('table.contents.status = ?', 'publish')
            ->where('table.contents.type = ?', $widget->type)
            ->where('table.contents.password IS NULL')
            ->order('table.contents.created', Db::SORT_ASC)
            ->limit(1);
        $content = $db->fetchRow($sql);
        if ($content) {
            return $widget->filter($content);
        } else {
            return $default;
        }
    }

    //上一篇
    public static function thePrev($widget, $default = NULL)
    {
        $db = Db::get();
        $sql = $db->select()->from('table.contents')
            ->where('table.contents.created < ?', $widget->created)
            ->where('table.contents.status = ?', 'publish')
            ->where('table.contents.type = ?', $widget->type)
            ->where('table.contents.password IS NULL')
            ->order('table.contents.created', Db::SORT_DESC)
            ->limit(1);
        $content = $db->fetchRow($sql);
        if ($content) {
            return $widget->filter($content);
        } else {
            return $default;
        }
    }
    //已发布文章数量
    public static function GetPostNum()
    {
        $db = Db::get();
        return $db->fetchObject($db->select(array('COUNT(cid)' => 'num'))
            ->from('table.contents')
            ->where('table.contents.type = ?', 'post')
            ->where('table.contents.status = ?', 'publish'))->num;
    }

    //评论总数量，排除自己评论
    public static function GetCommentsNum()
    {
        $db = Db::get();
        return $db->fetchObject($db->select(array('COUNT(authorId)' => 'num'))
            ->from('table.comments')
            ->where('table.comments.authorId = ?', 0)->where('table.comments.type=?', 'comment'))->num;
    }

    //标签数量
    public static function GetTagNum()
    {
        $db = Db::get();
        return $db->fetchObject($db->select(array('COUNT(mid)' => 'num'))
            ->from('table.metas')
            ->where('table.metas.type = ?', 'tag'))->num;
    }
    
    
    public static function AuthorAvatar($email): string
    {
        $b = str_replace('@qq.com', '', $email);
        if (stristr($email, '@qq.com') && is_numeric($b) && strlen($b) < 11 && strlen($b) > 4) {
            return 'https://q1.qlogo.cn/g?b=qq&nk=' . $b . '&s=4';
        } else {
            return ZYYO_STATIC.'/img/author.jpg';
        }
    }

    public static  function GetViews($item)
    {
        $db = Db::get();
        $result = $db->fetchRow($db->select('views')->from('table.contents')->where('cid = ?', $item->cid))['views'];
                $num=$result;
       if ($num >= 100000) {
            $num = round($num / 10000) . 'w';
        } else if ($num >= 10000) {
            $num = round($num / 10000, 1) . 'w';
        } else if ($num >= 1000) {
            $num = round($num / 1000, 1) . 'k';
        }
        echo $num;
    }
    
    
    
    public static function GetLikes($item)
    {
        $db = Db::get();
        $result = $db->fetchRow($db->select('likes')->from('table.contents')->where('cid = ?', $item->cid))['likes'];
                $num=$result;
       if ($num >= 100000) {
            $num = round($num / 10000) . 'w';
        } else if ($num >= 10000) {
            $num = round($num / 10000, 1) . 'w';
        } else if ($num >= 1000) {
            $num = round($num / 1000, 1) . 'k';
        }
        echo $num;
    }



public static function get_randimg()
{


// 假设你的链接变量是$links  
$links = Helper::options()->randimg; 
// 将链接按行分割成数组  
$linksArray = explode("\n", $links);  
  
// 从数组中随机选择一个链接  
$randomLink = $linksArray[array_rand($linksArray)];  
  
// 输出随机选择的链接  
return $randomLink;  
}
public static function article_thumb($zyyo666) {
if($zyyo666->fields->rand == false){


    preg_match_all( "/<[img|IMG].*?src=[\'|\"](.*?)[\'|\"].*?[\/]?>/", $zyyo666->content, $matches ); //通过正则式获取图片地址
   if(isset($matches[1][0])){
        $thumb = $matches[1][0];
    }
    if($thumb==""){
    $thumb= Func::get_randimg();
    }
    
    
    
   }else{
   $thumb= Func::get_randimg();
   }
return $thumb;
}
public static function shuoshuo_thumb($zyyo666,$num) {
    preg_match_all( "/<[img|IMG].*?src=[\'|\"](.*?)[\'|\"].*?[\/]?>/", $zyyo666, $matches ); //通过正则式获取图片地址
        if(isset($matches[1][$num])){
        $thumb = $matches[1][$num];
    }
    if($thumb==""){
   $thumb= Func::get_randimg();
    }

return $thumb;
}

public static function theme_random_posts() {
    $defaults = array(
        'number' => 3,
        'xformat' => '
        <a href="{permalink}">
        <div class="rand-article-list">
        <div class="rand-article-list-right"><div>{title}</div><div style="margin-top:5px;color:#444f7c;">{date}</div></div>
        </div>
        </a>
        '
    );
    $db = Typecho_Db::get();
    $adapterType = 'Mysql';

    if ($adapterType === 'Mysql') {
        $sql = $db->select()->from('table.contents')
            ->where('status = ?', 'publish')
            ->where('type = ?', 'post')
            ->where('created <= unix_timestamp(now())', 'post')
            ->limit($defaults['number'])
            ->order('RAND()');
    } elseif ($adapterType === 'SQLite') {
        $sql = $db->select()->from('table.contents')
            ->where('status = ?', 'publish')
            ->where('type = ?', 'post')
            ->where('created <= strftime("%s", "now")', 'post')
            ->limit($defaults['number'])
            ->order('RANDOM()');
    } else {
        // Handle other database adapters if needed
        return;
    }

    $result = $db->fetchAll($sql);
    foreach ($result as $val) {
        $val = Typecho_Widget::widget('Widget_Abstract_Contents')->filter($val);
        $date = $val['date'];
        $formattedDate = $date->format('Y-m-d');
        echo str_replace(array('{permalink}', '{title}', '{date}'), array($val['permalink'], $val['title'], $formattedDate), $defaults['xformat']);
    }
}







}
?>


