document.addEventListener('DOMContentLoaded', () => {
    
    // 1. MOBILNÍ MENU (Hamburger)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Animace ikony (volitelné: změna z barů na křížek)
            const icon = hamburger.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }

    // 2. AKORDEONY (Pro stránku materiály)
    // Funguje to tak, že hledá všechny hlavičky, na které se dá kliknout
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            
            // Zavře ostatní otevřené sekce (volitelné - pokud chceš mít vždy jen jednu otevřenou)
            /*
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            */

            item.classList.toggle('active');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // 1. Najdeme si okno a tlačítko v kódu
    const okno = document.getElementById('welcome-modal');
    const tlacitko = document.getElementById('close-modal-btn');

    // 2. Kontrola: Pokud uživatel už tlačítko jednou zmáčkl, okno se vůbec neukáže
    if (sessionStorage.getItem('uzivatelVidelUpozorneni')) {
        if (okno) {
            okno.style.display = 'none';
        }
    }

    // 3. Co se má stát, když se na tlačítko klikne
    if (tlacitko) {
        tlacitko.addEventListener('click', function() {
            // Skryje okno
            if (okno) {
                okno.style.display = 'none';
            }
            // Zapamatuje si, že uživatel kliknul
            sessionStorage.setItem('uzivatelVidelUpozorneni', 'true');
        });
    }
});