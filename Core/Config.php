<?php
function themeConfig($form)
{
?>


<?
    $logo = new Typecho_Widget_Helper_Form_Element_Text('logo', NULL, 'https://zyyo.cc/file/img/logo.png', _t('logo'), _t('在这里填入一个logo URL 地址'));
    $form->addInput($logo);
    
    $ico = new Typecho_Widget_Helper_Form_Element_Text('ico', NULL, '/usr/https://zyyo.cc/file/img/ico.png', _t('网站ico'), _t(''));
    $form->addInput($ico);
    
    
    
    
    $AuthorLogo = new Typecho_Widget_Helper_Form_Element_Text('AuthorLogo', NULL, 'https://q1.qlogo.cn/g?b=qq&nk=3509679579&s=5', _t('头像'), _t('在这里填入一个头像 URL 地址'));
    $form->addInput($AuthorLogo);
    
        $banner = new Typecho_Widget_Helper_Form_Element_Text('banner', NULL, 'https://zyyo.net/usr/themes/ZYYO/screenshot.png', _t('banner图'), _t('在这里填入URL 地址'));
    $form->addInput($banner);
    
           
    
    
        $font= new Typecho_Widget_Helper_Form_Element_Text('font', NULL, '', _t('字体'), _t('在这里填入一个 URL 地址'));
    $form->addInput($font);
    
    $AuthorTitle = new Typecho_Widget_Helper_Form_Element_Text('AuthorTitle', NULL, 'ZYYO', _t('主页标题'), _t('在这里写标题'));
    $form->addInput($AuthorTitle);
    
    
    
    $YiYan = new Typecho_Widget_Helper_Form_Element_Textarea('YiYan', NULL, '欲买桂花同载酒，终不似，少年游。', _t('一言'), _t('在这里填入一段话，将会显示在头像底部'));
    $form->addInput($YiYan);
    
    
    
    
    $footerbeian = new Typecho_Widget_Helper_Form_Element_Text('footerbeian', NULL, NULL, _t('备案号'), _t('如果你的网站备案，请在这里填写备案号，否则请空着它。'));
    $form->addInput($footerbeian);
    
    
      $loadimg= new Typecho_Widget_Helper_Form_Element_Textarea('loadimg', NULL, NULL, _t('自定义懒加载图'), _t(''));
    $form->addInput($loadimg);
        
        $randimg= new Typecho_Widget_Helper_Form_Element_Textarea('randimg', NULL, '', _t('自定义封面随机图'), _t(''));
    $form->addInput($randimg);
    
        
    
    
    
        $zdyHeader= new Typecho_Widget_Helper_Form_Element_Textarea('zdyHeader', NULL, '', _t('自定义头部'), _t(''));
    $form->addInput($zdyHeader);
    
    
    
    
    
   $zdyFooter= new Typecho_Widget_Helper_Form_Element_Textarea('zdyFooter', NULL, NULL, _t('自定义底部'), _t(''));
    $form->addInput($zdyFooter);
}
?>