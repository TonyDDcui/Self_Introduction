<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
<?php if($this->allow('comment')): ?>
            <div class="comment-title"><?php _e('添加新评论'); ?></div>
        <div class="newcomment">
                <form method="post"action="<?php $this->commentUrl() ?>" id="comment_form">
                
                
                <?php if($this->user->hasLogin()): ?>
                <p>您以登录-   <a href="<?php $this->options->profileUrl(); ?>"><?php $this->user->screenName(); ?></a>.<a no-pjax
                 style="color:#0060ff"href="<?php $this->options->logoutUrl(); ?>" title="Logout">退出 </a></p>
                
                <?php else: ?>
                
                
                
                <input class="input2" type="text" placeholder="邮箱..." name="mail" size="35" value="<?php $this->remember('mail');?>" >
                <div class="newcomment-1"><input class="input3" type="text" name="author" size="35" value="<?php $this->remember('author'); ?>" placeholder="昵称...">                        <input class="input3" type="text" name="url" size="35" value="<?php $this->remember('url'); ?>" placeholder="网址...">
                 </div>
                   <?php endif; ?>

       <input class="input1" type="text" name="text" value="<?php $this->remember('text'); ?>" placeholder="说出你要评论的内容...">
       <button type="submit" class="submit">点击评论</button>
    </div>
<form>


                    <div style="margin-top:30px" class="comment-title"><?php $this->commentsNum(_t('暂无评论'), _t('仅有一条评论'), _t('已有 %d 条评论')); ?></div>
<?php function threadedComments($comments, $options) {
    $commentClass = '';
    if ($comments->authorId) {
        if ($comments->authorId == $comments->ownerId) {
            $commentClass .= ' comment-by-author';
        } else {
            $commentClass .= ' comment-by-user';
        }
    }
 
    $commentLevelClass = $comments->levels > 0 ? ' comment-child' : ' comment-parent';
?>









<div class="comment">

<div class="comment-content">

    
        <div class="comment-left">
           <?php $email=$comments->mail; $imgUrl = Func::AuthorAvatar($email); echo '<img src="'.$imgUrl.'" width="35px" height="35px" style="border-radius: 20px;" >'; ?>
        </div>
                <div class="comment-right">
               <span class="comment-author"><?php $comments->author(); ?></span>
                   <span>  <?php $comments->content(); ?></span>
                   <?php $comments->reply('<i class="mdi mdi-reply"></i>回复'); ?>
<?php $comments->cancelReply('<i class="mdi mdi-reply"></i>取消'); ?>
                       </div>
                       
                       </div>
  <?php if ($comments->children) { ?>
    <div class="comment-children">
        <?php $comments->threadedComments($options); ?>
    </div>
<?php } ?>
    </div>

 
<?php } ?>
<?php $this->comments()->to($comments); ?>
<?php $comments->listComments(); ?>
  <?php endif; ?>








