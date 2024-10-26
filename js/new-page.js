/* testimonial Slider JS */
if ($('.testimonial-slider').length) {
    const testimonial_slider = new Swiper('.testimonial-slider .swiper', {
        slidesPerView : 1,
        speed: 1000,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 3000,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            768:{
                  slidesPerView: 2,
            },
            991:{
                  slidesPerView: 3,
            }
        }
    });
}

/* Hero Slider JS */
const hero_slider = new Swiper('.hero-slider .swiper', {
    slidesPerView : 1,
    speed: 1000,
    spaceBetween: 10,
    loop: true,
    autoplay: {
        delay: 4000,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

/* Init Counter */
if ($('.counter').length) {
    $('.counter').counterUp({ delay: 6, time: 3000 });
}