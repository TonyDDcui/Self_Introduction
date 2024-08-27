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

function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}

function pop(imageURL) {
    var tcMainElement = document.querySelector(".tc-img");
    if (imageURL) {
        tcMainElement.src = imageURL;
    }
    toggleClass(".tc-main", "active");
    toggleClass(".tc", "active");
}

function viewcert() {
    toggleClass(".o-tc-main", "active");
    toggleClass(".o-tc", "active");
}

function showMail(){
    alert("This is my email: <someometony@outlook.com>");
}

var tc = document.getElementsByClassName('tc');
var o_tc = document.getElementsByClassName('o-tc');
var tc_main = document.getElementsByClassName('tc-main');
var o_tc_main = document.getElementsByClassName('o-tc-main');

tc[0].addEventListener('click', function (event) {
    pop();
});

o_tc[0].addEventListener('click', function (event) {
    viewcert();
});

tc_main[0].addEventListener('click', function (event) {
    event.stopPropagation();
});

o_tc_main[0].addEventListener('click', function (event) {
    event.stopPropagation()
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















document.addEventListener('DOMContentLoaded', function () {






    var html = document.querySelector('html');
    var themeState = getCookie("themeState") || "Light";
    var tanChiShe = document.getElementById("tanChiShe");






    function changeTheme(theme) {
        tanChiShe.src = "./static/svg/snake-" + theme + ".svg";
        html.dataset.theme = theme;
        setCookie("themeState", theme, 365);
        themeState = theme;
    }







    var Checkbox = document.getElementById('myonoffswitch')
    Checkbox.addEventListener('change', function () {
        if (themeState == "Dark") {
            changeTheme("Light");
        } else if (themeState == "Light") {
            changeTheme("Dark");
        } else {
            changeTheme("Dark");
        }
    });



    if (themeState == "Dark") {
        Checkbox.checked = false;
    }

    changeTheme(themeState);

















   

    var fpsElement = document.createElement('div');
    fpsElement.id = 'fps';
    fpsElement.style.zIndex = '10000';
    fpsElement.style.position = 'fixed';
    fpsElement.style.left = '0';
    document.body.insertBefore(fpsElement, document.body.firstChild);

    var showFPS = (function () {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        var fps = 0,
            last = Date.now(),
            offset, step, appendFps;

        step = function () {
            offset = Date.now() - last;
            fps += 1;

            if (offset >= 1000) {
                last += offset;
                appendFps(fps);
                fps = 0;
            }

            requestAnimationFrame(step);
        };

        appendFps = function (fpsValue) {
            fpsElement.textContent = 'FPS: ' + fpsValue;
        };

        step();
    })();
    
    
    
    //pop('./static/img/tz.jpg')
    
    
    
});




var pageLoading = document.querySelector("#loading");
window.addEventListener('load', function() {
    setTimeout(function () {
        pageLoading.style.opacity = '0';
    }, 100);
});



window.onload = function () {
    miaovSlide('miaovSlide');
};

function miaovSlide(o) {
    //获取操作对象容器
    var obj = document.getElementById(o);
    if (!obj) return;
    //获取对象下面所有的div
    var aDiv = obj.getElementsByTagName('div');
    //获取向上箭头
    var oUp = getClass('up');
    //获取向下箭头
    var oDown = getClass('down');
    //获取图片容器
    var oWrap = getClass('wrap');
    //获取图片列表
    var oUl = oWrap.getElementsByTagName('ul')[0];
    //获取图片列表项
    var oLi = oUl.getElementsByTagName('li');

    var oTime = null;
    var iMs = 30;
    var i = 0;
    var iNum = 5;
    var toggle = -1;

    oUl.innerHTML += oUl.innerHTML;

    // 点击向上时，向上走
    oUp.onclick = function () {

        toggle = -1;

        autoPlay(toggle);
    };

    // 点击向下时，向走走
    oDown.onclick = function () {
        toggle = 1;
        autoPlay(toggle);
    };

    // 向上与向下箭头鼠标移入时，修改其透明度为1
    oUp.onmouseover = oDown.onmouseover = function () {
        this.style.filter = 'alpha(opacity:100)';
        this.style.opacity = 1;
    };

    // 向上与向下箭头鼠标移入时，修改其透明度为0.6
    oUp.onmouseout = oDown.onmouseout = function () {
        this.style.filter = 'alpha(opacity:60)';
        this.style.opacity = 0.6;
    };

    // 图片运动方法,toggle代表向下或是向上的值
    function autoPlay(toggle) {
        // 清除原有定时器
        if (oTime) {
            clearInterval(oTime);
        }
        // 重新开启定时器
        oTime = setInterval(function () {
            // 第次增量
            iNum += 2 * toggle;
            // UL向下走,当top值大于0时
            if (iNum > 0) {
                // 设定top值为负的UL高度的一半(向上拉)
                iNum = -oLi.length * oLi[0].offsetHeight / 2;
            }
            // UL向上走，当top值的绝对值大于UL自身宽度的一半时
            if (Math.abs(iNum) > oLi.length * oLi[0].offsetHeight / 2) {
                // 设定top的值为0(向下拉)
                iNum = 0;
            }
            // 赋值给top值
            oUl.style.top = iNum + 'px';

        }, iMs);
    };

    autoPlay(toggle);

    // 获取拥有当前样式的元素
    function getClass(sName) {
        for (i = 0; i < aDiv.length; i++) {
            if (aDiv[i].className == sName) {
                return aDiv[i];
            }
        }
    }
}
