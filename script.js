const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentIndex = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
            slide.classList.remove('prev', 'next');
        } else if (i < index) {
            slide.classList.remove('active', 'next');
            slide.classList.add('prev');
        } else if (i > index) {
            slide.classList.remove('active', 'prev');
            slide.classList.add('next');
        }
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// 初始显示第一个幻灯片
showSlide(currentIndex);

// 添加点击事件来控制图片的放大和缩小
slides.forEach(slide => {
    const img = slide.querySelector('img');
    img.addEventListener('click', () => {
        img.classList.toggle('zoomed');
    });
});