// Contact : formulaire pré-rempli envoyé via WhatsApp
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-whatsapp-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const subject = document.getElementById('form-subject').value;
            const message = document.getElementById('form-message').value.trim();

            const pastorPhone = '22966304937';

            const baseText = `Bonjour Pasteur Constantin KPOGBA,\n\nJe suis *${name}*.\n\nJe vous écris concernant le sujet suivant : *${subject}*.\n\n*Message :*\n"${message}"\n\n(Envoyé depuis le site web MIIFI)`;

            const encodedText = encodeURIComponent(baseText);
            const waUrl = `https://wa.me/${pastorPhone}?text=${encodedText}`;

            window.open(waUrl, '_blank');

            contactForm.reset();
        });
    }
});
