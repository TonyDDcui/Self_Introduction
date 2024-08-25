<?php if(!defined( '__TYPECHO_ROOT_DIR__'))exit;?>



                <div class="footer">
<span style="font-size: 16.5px;margin-top: 10px;">
&copy; 2022 - 2023 🔅 <?php $this->options->title(); ?></span>
<span style="font-size: 16.5px;margin-top: 10px;">
<a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">         🌸<?=Func::footerbeian() ?></a>
</span>
<span style="font-size: 16.5px;margin-top: 10px; ">🌸Theme is <a href="https://zyyo.net" target="_blank">ZYYO</a>🌸
</span><!--这里主题的版权信息可以改，但是我求你留下来,真的求求你了，咱是免费主题，给我点流量吧-->
     
    </div>
    </div>
    <!--主页内容-->
        



<!--右边内容-->
    <div  class="right">
       <div class="right-main">
  

    <div  class="right-close">
    <div onclick="rightclose()" class="right-close-icon"><svg t="1694447029505" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16649" width="25px" height="25px"><path d="M589.704 501.674L998.27 93.107c20.652-20.653 20.652-54.556 0-75.209l-2.237-2.237c-20.652-20.652-54.556-20.652-75.208 0L512.258 424.745 103.691 15.489c-20.652-20.652-54.556-20.652-75.208 0l-2.238 2.237c-21.168 20.652-21.168 54.556 0 75.208l408.568 408.74L26.245 910.24c-20.652 20.652-20.652 54.556 0 75.208l2.238 2.238c20.652 20.652 54.556 20.652 75.208 0l408.567-408.568 408.568 408.568c20.652 20.652 54.556 20.652 75.208 0l2.237-2.238c20.652-20.652 20.652-54.556 0-75.208L589.704 501.674z" fill="#2C2C2C" p-id="16650"></path></svg>
    
    </div>
    </div>
<div class="right-yiyan">


        
    <p>好好相遇，慢慢生活</p>
        
        
        
                </div>
         
             
                     <div class="right-content" style="padding-bottom:0;">
<div class="right-head">
<svg style="margin-right:10px;" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path d="M864.801 895.471h-33.56v-96.859c0-126.081-73.017-235.093-179.062-287.102 106.046-52.01 179.062-161.022 179.062-287.102v-96.859h33.56c17.301 0 31.325-14.327 31.325-32 0-17.673-14.024-32-31.325-32H159.018c-17.3 0-31.325 14.327-31.325 32 0 17.673 14.025 32 31.325 32h33.02v96.859c0 126.08 73.016 235.092 179.061 287.102-106.046 52.009-179.062 161.02-179.062 287.101v96.859h-33.02c-17.3 0-31.325 14.326-31.325 32s14.025 32 31.325 32H864.8c17.301 0 31.325-14.326 31.325-32s-14.023-31.999-31.324-31.999zM256.05 222.427v-94.878h513.046v94.878c0 141.674-114.85 256.522-256.523 256.522-141.674 0-256.523-114.848-256.523-256.522zm513.046 673.044H256.05v-94.879c0-141.674 114.849-256.521 256.523-256.521 141.673 0 256.523 114.848 256.523 256.521v94.879z"></path>
          <path d="M544.141 384c0-17.69-14.341-32.031-32.031-32.031-71.694 0-127.854-56.161-127.854-127.855 0-17.69-14.341-32.032-32.031-32.032s-32.032 14.341-32.032 32.032c0 107.617 84.3 191.918 191.917 191.918 17.69 0 32.031-14.342 32.031-32.032z"></path>
        </svg>网站统计
<div class="rand-article-yuan" style="right:23px;background-color:#fcb906;"></div>
<div class="rand-article-yuan" style="right:36px;background-color:#ed687d;"></div>
<div class="rand-article-yuan" style="right:49px;background-color:#1bbc9b;"></div></div>

<div class="right-tj">
                  <div class="right-tj-box">
<div class="right-tj-box-text">运行天数</div>
<div class="right-tj-box-a" style="background:#1bbc9b;"><?php echo Func::yxtime(); ?>天</div>
     </div>
                       <div class="right-tj-box">
              <div class="right-tj-box-text">  文章总数</div>  <div class="right-tj-box-a" style="background:#ed687d;" ><?= Func::GetPostNum()?>篇</div>
     </div>
                       <div class="right-tj-box">
              <div class="right-tj-box-text"> 评论总数 </div> <div class="right-tj-box-a" style="background:#0060ff;" > <?= Func::GetCommentsNum()?>个</div>
     </div>
                       <div class="right-tj-box">
                 <div class="right-tj-box-text">  标签总数</div><div class="right-tj-box-a" style="background:#fcb906;" > <?= Func::GetTagNum()?>个</div>
     </div>
     
     </div>
     
        </div>



     <div class="right-content">
<div class="right-head">
<svg class="icon" style="margin-right:10px;" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path d="M512 938.667A426.667 426.667 0 0 1 85.333 512a421.12 421.12 0 0 1 131.2-306.133 58.88 58.88 0 0 1 42.667-16.64c33.28 1.066 58.027 28.16 84.267 56.96 7.893 8.533 19.626 21.333 28.373 29.013a542.933 542.933 0 0 0 24.533-61.867c18.134-52.266 35.414-101.76 75.307-121.6 55.04-27.733 111.573 37.974 183.253 121.6 16.214 18.774 38.614 44.8 53.547 59.52 1.707-4.48 3.2-8.96 4.48-12.373 8.533-24.32 18.987-54.613 51.2-61.653a57.813 57.813 0 0 1 55.68 20.053A426.667 426.667 0 0 1 512 938.667zM260.693 282.453A336.64 336.64 0 0 0 170.667 512a341.333 341.333 0 1 0 614.826-203.733 90.24 90.24 0 0 1-42.666 50.56 68.267 68.267 0 0 1-53.547 1.706c-25.6-9.173-51.627-38.4-99.2-93.226a826.667 826.667 0 0 0-87.253-91.734 507.733 507.733 0 0 0-26.24 64c-18.134 52.267-35.414 101.76-75.947 119.254-48.853 21.333-88.32-21.334-120.107-56.96-5.76-4.694-13.226-13.014-19.84-19.414z"></path>
          <path d="M512 810.667A298.667 298.667 0 0 1 213.333 512a42.667 42.667 0 0 1 85.334 0A213.333 213.333 0 0 0 512 725.333a42.667 42.667 0 0 1 0 85.334z"></path>
        </svg>随机文章
<div class="rand-article-yuan" style="right:23px;background-color:#fcb906;"></div>
<div class="rand-article-yuan" style="right:36px;background-color:#ed687d;"></div>
<div class="rand-article-yuan" style="right:49px;background-color:#1bbc9b;"></div>
</div>
<?php  Func::theme_random_posts();?>
        </div>
        
             <div class="right-content">
<div class="right-head">
<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18" style="margin-right:10px;">
          <path d="M512 647.239a204.391 204.391 0 0 0 204.391-204.391V204.39a204.391 204.391 0 0 0-408.782 0v238.457A204.391 204.391 0 0 0 512 647.238zM375.74 204.39a136.26 136.26 0 0 1 272.52 0v238.457a136.26 136.26 0 0 1-272.52 0z"></path>
          <path d="M852.652 476.913a34.065 34.065 0 0 0-68.13 0A257.533 257.533 0 0 1 512 715.369a257.533 257.533 0 0 1-272.522-238.456 34.065 34.065 0 0 0-34.065-34.065 34.065 34.065 0 0 0-34.065 34.065 321.576 321.576 0 0 0 307.268 303.861v173.052H307.61a34.065 34.065 0 0 0-34.065 34.065 34.065 34.065 0 0 0 34.065 34.065H716.39a34.065 34.065 0 0 0 34.065-34.065 34.065 34.065 0 0 0-34.065-34.065H546.065V778.73a321.576 321.576 0 0 0 306.587-301.817z"></path>
        </svg>      最新评论
<div class="rand-article-yuan" style="right:23px;background-color:#fcb906;"></div>
<div class="rand-article-yuan" style="right:36px;background-color:#ed687d;"></div>
<div class="rand-article-yuan" style="right:49px;background-color:#1bbc9b;"></div></div>


                  
                <?php $com = null;
                $this->widget('Widget_Comments_Recent', 'ignoreAuthor=false&pageSize=4')->to($com); ?>
                
                    <?php while ($com->next()) : ?>


        <a href=" <?php $com->permalink() ?>">
        <div class="rand-article-list">
        <img src="<?= Func::AuthorAvatar($com->mail) ?>" class="rand-article-list-img">
        <div class="rand-article-list-right"><div>                                    <?=$com->author?> </div><div style="margin-top:5px;color:#444f7c;">                 <?= $com->text?>  </div></div>
        </div>
        </a>
                            


                                       
                               
                    <?php endwhile; ?>

        </div>
        
        
        
        
        
        
        
        
            </div>
    </div>
   <!--右边内容-->
   

   
   
        </div><!--MovableMovable-->
        
    
</div><!--main-->
        <?= Func::Footer() ?>
<?php
$this->need('/include/tool.php');
?>



      
 
</body>
</html>