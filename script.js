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
            btn.classList.toggle('active');

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