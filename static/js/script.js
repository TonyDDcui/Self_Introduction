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
    //��ȡ������������
    var obj = document.getElementById(o);
    if (!obj) return;
    //��ȡ�����������е�div
    var aDiv = obj.getElementsByTagName('div');
    //��ȡ���ϼ�ͷ
    var oUp = getClass('up');
    //��ȡ���¼�ͷ
    var oDown = getClass('down');
    //��ȡͼƬ����
    var oWrap = getClass('wrap');
    //��ȡͼƬ�б�
    var oUl = oWrap.getElementsByTagName('ul')[0];
    //��ȡͼƬ�б���
    var oLi = oUl.getElementsByTagName('li');

    var oTime = null;
    var iMs = 30;
    var i = 0;
    var iNum = 5;
    var toggle = -1;

    oUl.innerHTML += oUl.innerHTML;

    // �������ʱ��������
    oUp.onclick = function () {

        toggle = -1;

        autoPlay(toggle);
    };

    // �������ʱ��������
    oDown.onclick = function () {
        toggle = 1;
        autoPlay(toggle);
    };

    // ���������¼�ͷ�������ʱ���޸���͸����Ϊ1
    oUp.onmouseover = oDown.onmouseover = function () {
        this.style.filter = 'alpha(opacity:100)';
        this.style.opacity = 1;
    };

    // ���������¼�ͷ�������ʱ���޸���͸����Ϊ0.6
    oUp.onmouseout = oDown.onmouseout = function () {
        this.style.filter = 'alpha(opacity:60)';
        this.style.opacity = 0.6;
    };

    // ͼƬ�˶�����,toggle�������»������ϵ�ֵ
    function autoPlay(toggle) {
        // ���ԭ�ж�ʱ��
        if (oTime) {
            clearInterval(oTime);
        }
        // ���¿�����ʱ��
        oTime = setInterval(function () {
            // �ڴ�����
            iNum += 2 * toggle;
            // UL������,��topֵ����0ʱ
            if (iNum > 0) {
                // �趨topֵΪ����UL�߶ȵ�һ��(������)
                iNum = -oLi.length * oLi[0].offsetHeight / 2;
            }
            // UL�����ߣ���topֵ�ľ���ֵ����UL�����ȵ�һ��ʱ
            if (Math.abs(iNum) > oLi.length * oLi[0].offsetHeight / 2) {
                // �趨top��ֵΪ0(������)
                iNum = 0;
            }
            // ��ֵ��topֵ
            oUl.style.top = iNum + 'px';

        }, iMs);
    };

    autoPlay(toggle);

    // ��ȡӵ�е�ǰ��ʽ��Ԫ��
    function getClass(sName) {
        for (i = 0; i < aDiv.length; i++) {
            if (aDiv[i].className == sName) {
                return aDiv[i];
            }
        }
    }
}
