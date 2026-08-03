// Jeunesse : carrousel du slogan (auto-défilement)
document.addEventListener('DOMContentLoaded', () => {
    const sloganItems = document.querySelectorAll('.slogan-item');
    const bullets = document.querySelectorAll('.slogan-bullets .bullet');
    let currentSloganIndex = 0;
    let sloganInterval;

    const showSlogan = (index) => {
        sloganItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('slogan-active');
                bullets[i].classList.add('active');
            } else {
                item.classList.remove('slogan-active');
                bullets[i].classList.remove('active');
            }
        });
        currentSloganIndex = index;
    };

    const nextSlogan = () => {
        let nextIndex = (currentSloganIndex + 1) % sloganItems.length;
        showSlogan(nextIndex);
    };

    const startSloganCarousel = () => {
        sloganInterval = setInterval(nextSlogan, 4000);
    };

    const stopSloganCarousel = () => {
        clearInterval(sloganInterval);
    };

    bullets.forEach(bullet => {
        bullet.addEventListener('click', (e) => {
            stopSloganCarousel();
            const index = parseInt(e.target.getAttribute('data-index'));
            showSlogan(index);
            startSloganCarousel();
        });
    });

    if (sloganItems.length > 0) {
        startSloganCarousel();
    }
});
