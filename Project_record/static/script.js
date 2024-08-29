   // 定义变量 
   let chosenSlideNumber = 1; // 当前选择的幻灯片编号 
   let offset = 0; // 幻灯片偏移量 
   let barOffset = 0; // 导航条偏移量 
   let intervalID; // 定时器 ID 
   // 启动幻灯片轮播 
   startSlide();
   // 获取所有抽屉按钮，并为每个按钮添加点击事件监听器 
   const drawerBtns = Array.from(document.querySelectorAll(".drawer-btn"));
   drawerBtns.forEach(btn => {
     btn.addEventListener("click", () => {
       clearInterval(intervalID); // 清除定时器 
       startSlide(); // 重新启动幻灯片轮播 
     })
   })
   // 获取幻灯片区域 
   const slideSection = document.querySelector("#slide-section");
   // 鼠标移入幻灯片区域时清除定时器 
   slideSection.addEventListener("mouseenter", () => {
     clearInterval(intervalID);
   })
   // 鼠标移出幻灯片区域时重新启动幻灯片轮播 
   slideSection.addEventListener("mouseleave", () => {
     startSlide();
   })
   // 切换到指定编号的幻灯片 
   function slideTo(slideNumber) {
     drawerboxToggle(slideNumber); // 切换抽屉面板状态 
     drawerbtnToggle(slideNumber); // 切换抽屉按钮状态 
     // 更新偏移量 
     let previousSlideNumber = chosenSlideNumber;
     chosenSlideNumber = slideNumber;
     offset += (chosenSlideNumber - previousSlideNumber) * (-100); // 计算幻灯片偏移量 
     barOffset += (chosenSlideNumber - previousSlideNumber) * (100); // 计算导航条偏移量 
     barSlide(barOffset); // 移动导航条 
     // 获取所有幻灯片，为每个幻灯片设置偏移量 
     const slides = document.querySelectorAll(".card");
     Array.from(slides).forEach(slide => {
       slide.style.transform = `translateY(${offset}%)`;
     })
   }
   // 切换抽屉面板状态 
   function drawerboxToggle(drawerboxNumber) {
     let prevDrawerboxNumber = chosenSlideNumber;
     const drawerboxes = document.querySelectorAll(".drawerbox");
     drawerboxes[prevDrawerboxNumber - 1].classList.toggle("active"); // 切换前一个抽屉面板的状态 
     drawerboxes[drawerboxNumber - 1].classList.toggle("active"); // 切换当前抽屉面板的状态 
   }
   // 切换抽屉按钮状态 
   function drawerbtnToggle(drawerBtnNumber) {
     let prevDrawerBtnNumber = chosenSlideNumber;
     const drawerBtns = document.querySelectorAll(".drawer-btn");
     drawerBtns[prevDrawerBtnNumber - 1].classList.toggle("active"); // 切换前一个抽屉按钮的状态 
     drawerBtns[drawerBtnNumber - 1].classList.toggle("active"); // 切换当前抽屉按钮的状态 
   }
   // 移动导航条 
   function barSlide(barOffset) {
     const bar = document.querySelector("#bar");
     bar.style.transform = `translateY(${barOffset}%)`;
   }
   // 启动幻灯片轮播 
   function startSlide() {
     intervalID = setInterval(() => {
       slideTo(chosenSlideNumber % 4 + 1); // 每次切换到下一个幻灯片 
     }, 5000); // 每隔 3 秒自动切换幻灯片 
   }


   document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handlePress(event) {
    this.classList.add('pressed');
}

function handleRelease(event) {
    this.classList.remove('pressed');
}

function handleCancel(event) {
    this.classList.remove('pressed');
}

var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function (button) {
    button.addEventListener('mousedown', handlePress);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handlePress);
    button.addEventListener('touchend', handleRelease);
    button.addEventListener('touchcancel', handleCancel);
});

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

var pageLoading = document.querySelector("#loading");
window.addEventListener('load', function() {
    setTimeout(function () {
        pageLoading.style.opacity = '0';
    }, 100);
});


