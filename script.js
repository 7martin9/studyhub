// ==========================================
// TMAVÝ / SVĚTLÝ REŽIM
// ==========================================
// Téma se aplikuje okamžitě přes inline <script> v <head> každé stránky.
// Zde jen obsluhujeme kliknutí na tlačítko přepínače.

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});

// ==========================================
// DROPDOWN MENU V NAVBARU
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButtons = document.querySelectorAll('.nav-dropdown > button');

    dropdownButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = btn.closest('.nav-dropdown');
            const isActive = btn.classList.toggle('active');

            // Zavři ostatní dropdowny
            dropdownButtons.forEach(otherBtn => {
                if (otherBtn !== btn) otherBtn.classList.remove('active');
            });
        });
    });

    // Zavři dropdown když se klikne mimo něj
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            dropdownButtons.forEach(btn => btn.classList.remove('active'));
        }
    });

    // Zavři dropdown když se klikne na odkaz v něm
    document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
        link.addEventListener('click', () => {
            dropdownButtons.forEach(btn => btn.classList.remove('active'));
        });
    });
});

// ==========================================

// ==========================================
// VYHLEDÁVÁNÍ V MATERIÁLECH
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('material-search');
    const clearBtn = document.getElementById('search-clear');
    const noResults = document.getElementById('search-no-results');
    if (!input) return;

    const categories = Array.from(document.querySelectorAll('.subject-category'));
    const originals = categories.map(c => c.innerHTML);

    function highlight(text, query) {
        if (!query) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(`(${escaped})`, 'gi'),
            '<mark class="search-highlight">$1</mark>');
    }

    function doSearch(query) {
        const q = query.trim().toLowerCase();
        clearBtn.classList.toggle('visible', q.length > 0);
        let anyVisible = false;

        categories.forEach((cat, i) => {
            cat.innerHTML = originals[i];

            if (!q) {
                cat.style.display = '';
                anyVisible = true;
                return;
            }

            const summarySpan = cat.querySelector('.summary-content span');
            const fileSpans = Array.from(cat.querySelectorAll('.file-list span, .sub-category h4'));
            const summaryText = summarySpan ? summarySpan.textContent.toLowerCase() : '';
            const fileTexts = fileSpans.map(s => s.textContent.toLowerCase());
            const matches = summaryText.includes(q) || fileTexts.some(t => t.includes(q));

            if (matches) {
                cat.style.display = '';
                anyVisible = true;
                if (summarySpan) summarySpan.innerHTML = highlight(summarySpan.textContent, query.trim());
                fileSpans.forEach(s => { s.innerHTML = highlight(s.textContent, query.trim()); });
                const details = cat.querySelector('details');
                if (details) details.open = true;
            } else {
                cat.style.display = 'none';
            }
        });

        noResults.style.display = (!anyVisible && q.length > 0) ? 'block' : 'none';
    }

    input.addEventListener('input', () => doSearch(input.value));
    clearBtn.addEventListener('click', () => { input.value = ''; doSearch(''); input.focus(); });
});

// ==========================================

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

document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentElement;
        
        // Zavře ostatní otevřené bloky (pokud chceš, aby byl otevřen jen jeden)
        document.querySelectorAll('.accordion-item').forEach(item => {
            if (item !== accordionItem) {
                item.classList.remove('active');
            }
        });

        // Přepne aktuální blok
        accordionItem.classList.toggle('active');
    });
});

// --- 2. DYNAMICKÉ VYHLEDÁVÁNÍ OTÁZEK ---
function filterQuestions() {
    const input = document.getElementById('questionSearch');
    if (!input) return; // Pokud na stránce vyhledávač není, nic nedělej

    const filter = input.value.toLowerCase();
    const categories = document.querySelectorAll('.subject-category');

    categories.forEach(cat => {
        let hasVisibleQuestion = false;
        const details = cat.querySelector('details');
        const cards = cat.querySelectorAll('.question-card');

        // Fallback pro pripad, kdy by stranka nebyla preskladana do question-card
        const groups = cards.length
            ? Array.from(cards)
            : Array.from(cat.querySelectorAll('.sub-question-list')).map(list => ({
                list,
                badge: list.previousElementSibling && list.previousElementSibling.classList.contains('question-number-badge')
                    ? list.previousElementSibling
                    : null
            }));

        groups.forEach(group => {
            const list = group.list || group.querySelector('.sub-question-list');
            const badge = group.badge || group.querySelector('.question-number-badge');
            if (!list) return;

            const items = list.querySelectorAll('.sub-question-item');
            let visibleInThisGroup = false;

            items.forEach(item => {
                const text = item.querySelector('.q-text').innerText.toLowerCase();
                const isVisible = text.includes(filter) || filter === '';

                item.style.display = isVisible ? 'flex' : 'none';

                if (isVisible) {
                    visibleInThisGroup = true;
                    hasVisibleQuestion = true;
                }
            });

            if (badge) {
                badge.style.display = visibleInThisGroup ? 'flex' : 'none';
            }

            list.style.display = visibleInThisGroup ? '' : 'none';

            // U noveho layoutu skryj i celou kartu, aby nezustavaly prazdne boxy
            if (group.classList && group.classList.contains('question-card')) {
                group.style.display = visibleInThisGroup ? 'flex' : 'none';
            }
        });

        // Logika rozbalování při hledání
        if (filter !== "") {
            if (hasVisibleQuestion) {
                cat.style.display = "block";
                details.open = true;
            } else {
                cat.style.display = "none";
            }
        } else {
            // Reset do původního stavu, když je pole prázdné
            cat.style.display = "block";
            cat.querySelectorAll('.question-card, .sub-question-list, .question-number-badge, .sub-question-item').forEach(el => {
                el.style.display = '';
            });
            // Tady můžeš nastavit, který blok má být defaultně otevřený
            // details.open = false; 
        }
    });
}

// --- 3. OŠETŘENÍ CHYB (Event Listener) ---
// Tohle zajistí, že se skript spustí až ve chvíli, kdy je HTML připravené
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('questionSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterQuestions);
    }
});

// ==========================================
// MATERIÁLY - VIZUÁLNÍ PŘESKLÁDÁNÍ BLOKŮ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('materials-page')) return;

    const groups = document.querySelectorAll('.question-group');

    groups.forEach(group => {
        const children = Array.from(group.children);
        let currentCard = null;

        children.forEach(node => {
            if (node.classList.contains('question-number-badge')) {
                currentCard = document.createElement('div');
                currentCard.className = 'question-card';
                group.insertBefore(currentCard, node);
                currentCard.appendChild(node);
                return;
            }

            if (node.classList.contains('sub-question-list') && currentCard) {
                currentCard.appendChild(node);
                currentCard = null;
            }
        });
    });

    document.querySelectorAll('.sub-question-item').forEach(item => {
        const qTextEl = item.querySelector('.q-text');
        const btn = item.querySelector('.btn-download-main');
        if (!qTextEl || !btn) return;

        const label = qTextEl.textContent.trim().toLowerCase().startsWith('a)') ? 'Otevřít zpracované téma A' : 'Otevřít zpracované téma B';
        btn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${label}`;
    });

    document.querySelectorAll('.q-author span').forEach(authorSpan => {
        if (authorSpan.textContent.trim() === 'Doplnit') {
            authorSpan.textContent = 'Doplním jméno';
        }
    });
});