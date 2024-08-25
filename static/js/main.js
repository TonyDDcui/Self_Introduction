
 const styleTitle1 = "background:#000000;font-size: 20px;font-weight: 600;color: rgb(244,167,89);";
  const styleTitle2 = "background:rgb(30,152,255);font-size:30px;color: rgb(244,167,89);";
  const styleContent = "color: rgb(30,152,255);font-size:30px";
  const title1 = "ZYYO主题";
  const title2 = `\n来自牛逼的张扬YO`;
  const content = `\n\n版本: 1.0\n主页: zyyo.net`;
  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent);
function video(){
var video = document.getElementById('Video');

    // 监听滚动事件
    window.addEventListener('scroll', function() {
      // 获取视频容器的位置和可见性状态
      var rect = video.getBoundingClientRect();
      var isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

      // 根据可见性状态控制视频的播放和暂停
      if (isInViewport) {
        video.play();
      } else {
        video.pause();
      }
    });
}
function fixed() {  
    $(".fixed").toggleClass("fixed-open");  
    $(".footbar").toggleClass("footbar-close");  
   $(".Movable").toggleClass("Movable-a");
   //借用一下right的遮罩，懒得再写一个
    $(".fixedzz").toggleClass("fixedzz-open");

}  

function right() {
    $(".right-main").addClass("right-main-open"); 
    $(".right").addClass("right-open");
    $(".right").css("pointer-events", "auto"); 
}
function rightclose() {
    $(".right-main").removeClass("right-main-open");
    $(".right").removeClass("right-open");
    $(".right").css("pointer-events", "none");
}

function share() {
    $(".tc").addClass("active");
    $(".tc-main").addClass("active");
  }

  function shareclose() {
    $(".tc").removeClass("active");
    $(".tc-main").removeClass("active");
  }



function tabgl()
{
      var url = window.location.href;

// 处理 .tab 中的链接
var url = window.location.href;



// 处理 '.tab a' 元素
var tabLinkFound = false;
$('.tab a').each(function () {
    if ($(this).attr('href') == url) {
        $(this).find('div').addClass('option1');
        tabLinkFound = true;
    }
});

// 如果没有找到匹配的链接，为第一个 '.tab div' 添加样式类
if (!tabLinkFound) {
    $('.tab div:first').addClass('option1');
}

// 处理 '.menu a' 元素
var menuLinkFound = false;
$('.menu a').each(function () {
    if ($(this).attr('href') == url) {
        $(this).find('div').addClass('menu-option-a');
          $(this).find('div svg path').attr("fill","#0797df");
        menuLinkFound = true;
    }
});

// 如果没有找到匹配的链接，为第一个 '.menu div' 添加样式类
if (!menuLinkFound) {
    $('.menu div:eq(1)').addClass('menu-option-a');
      $('.menu div svg path:eq(0)').attr("fill","#0797df");
}

}

function next()
{

    //点击下一页
    $('.next').click(function() {
        $this = $(this);
        $('.page-link-text').text('正在努力加载'); 
      
//或者
        var href = $this.attr('href');  
        if (href != undefined) { 
            $.ajax({ 
                url: href,
                type: 'get',
                error: function(request) {
                },
                success: function(data) {
                      $('.page-link-text').text('点击查看更多'); 
                   
                    var $res = $(data).find('.article-list-a'); 
                    var target = $this;
                    var position = target.offset().top -60;
                    $('.article-list').append($res.fadeIn(1000)); 
                                        $('html, body').animate({
                    scrollTop: position
                    }, 500, function() {
                     });
                    lazyload();
                    var newhref = $(data).find('.next').attr('href'); 
                    if (newhref != undefined) {
                        $('.next').attr('href', newhref);
                    } else {
                        $('.next').remove(); 
                    }
                }
            });
            
        }
     return false;
        });
        
}
      
      
      
    
     /*图片灯箱*/
    function dx(){
    window.ViewImage && ViewImage.init('.lazy');
    }
    
/*图片懒加载*/
     function lazyload()
     {
 $(function() {
$("img.lazy").lazyload({
});
});
}
    
    
    
    
    /*顶栏低栏*/
    function aaa(){
      $(window).scroll(function () {
        if ($(window).scrollTop() > 120) { 
          $(".header-bar").addClass("header-bar-1") ;
          $(".icon1 svg path").attr("fill","#000000");
          $(".icon2 svg path").attr("fill","#000000");

      
          
        }else{
          $(".header-bar").removeClass("header-bar-1") ;//消失
          $(".icon1 svg path").attr("fill","#ffffff");
          $(".icon2 svg path").attr("fill","#ffffff");
        }
      });
    
    
    }
    
    
tabgl();
dx();
next();
aaa();
lazyload();
video();