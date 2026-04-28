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
// GLOBÁLNÍ PROGRESS BAR PŘI SCROLLU
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    let progressBar = document.querySelector('.scroll-progress');

    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }

    const updateProgress = () => {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = doc.scrollHeight - doc.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress)).toFixed(2)}%`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
});

// ==========================================
// GLOBÁLNÍ TLAČÍTKO "ZPĚT NAHORU"
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    let backToTop = document.querySelector('.back-to-top');

    if (!backToTop) {
        backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.type = 'button';
        backToTop.setAttribute('aria-label', 'Zpět nahoru');
        backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        document.body.appendChild(backToTop);
    }

    const updateBackToTop = () => {
        if (window.scrollY > 420) {
            backToTop.classList.add('is-visible');
        } else {
            backToTop.classList.remove('is-visible');
        }
    };

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    window.addEventListener('resize', updateBackToTop);
});

// ==========================================
// DROPDOWN MENU V NAVBARU
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButtons = document.querySelectorAll('.nav-dropdown > button');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    // Na desktopu otevirame dropdown uz pri najeti mysi
    if (canHover) {
        dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector(':scope > button');
            if (!btn) return;

            dropdown.addEventListener('mouseenter', () => {
                dropdownButtons.forEach(otherBtn => {
                    if (otherBtn !== btn) otherBtn.classList.remove('active');
                });
                btn.classList.add('active');
            });

            dropdown.addEventListener('mouseleave', () => {
                btn.classList.remove('active');
            });
        });
    }

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

    const studyMenu = Array.from(document.querySelectorAll('.nav-dropdown-menu')).find(menu =>
        menu.querySelector('a[href="/zkouska"]') || menu.querySelector('a[href="../zkouska"]')
    );

    if (studyMenu && !studyMenu.querySelector('a[href="/pojmy"]')) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '/pojmy';
        link.textContent = 'Pojmy';
        item.appendChild(link);

        studyMenu.appendChild(item);
    }
});

// ==========================================

// --- 2. DYNAMICKÉ VYHLEDÁVÁNÍ OTÁZEK ---
function filterQuestions() {
    const input = document.getElementById('questionSearch');
    if (!input) return; // Pokud na stránce vyhledávač není, nic nedělej

    const filter = input.value.toLowerCase();
    const normalizedFilter = filter.replace(/\s+/g, '');
    const categories = document.querySelectorAll('.subject-category');
    let hasAnyVisibleCategory = false;

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

            const badgeText = badge ? badge.innerText.toLowerCase() : '';
            const badgeMatch = badgeText.match(/ot[aá]zka\s*(\d+)/);
            const questionNumber = badgeMatch ? badgeMatch[1] : '';

            items.forEach(item => {
                const qTextEl = item.querySelector('.q-text');
                const text = qTextEl ? qTextEl.innerText.toLowerCase() : '';
                const letterMatch = text.match(/^([ab])\)/);
                const questionLetter = letterMatch ? letterMatch[1] : '';
                const designation = (questionNumber + questionLetter).toLowerCase();

                const isVisible =
                    filter === '' ||
                    text.includes(filter) ||
                    (designation && designation.includes(normalizedFilter));

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
                hasAnyVisibleCategory = true;
            } else {
                cat.style.display = "none";
            }
        } else {
            // Reset do původního stavu, když je pole prázdné
            cat.style.display = "block";
            hasAnyVisibleCategory = true;
            cat.querySelectorAll('.question-card, .sub-question-list, .question-number-badge, .sub-question-item').forEach(el => {
                el.style.display = '';
            });
            // Tady můžeš nastavit, který blok má být defaultně otevřený
            // details.open = false; 
        }
    });

    const materialsContainer = document.querySelector('.materials-list-section > .container');
    if (!materialsContainer) return;

    let emptyState = document.getElementById('materialsNoResults');
    if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'materialsNoResults';
        emptyState.className = 'materials-empty-state';
        emptyState.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i><h3>Nic jsme nenašli</h3><p>Zkuste jiné klíčové slovo nebo zkraťte hledaný výraz.</p>';
        materialsContainer.appendChild(emptyState);
    }

    const showEmptyState = filter !== '' && !hasAnyVisibleCategory;
    emptyState.style.display = showEmptyState ? 'block' : 'none';
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

    document.querySelectorAll('.q-author').forEach(author => {
        const authorSpan = author.querySelector('span');
        if (!authorSpan) return;

        if (authorSpan.textContent.trim() === 'Doplnit') {
            authorSpan.textContent = 'AI - ověřte si správnost';
        }
    });

    const pendingModal = document.getElementById('pendingMaterialModal');
    if (!pendingModal) return;

    const pendingMaterialName = document.getElementById('pendingMaterialName');
    const pendingMaterialMeta = document.getElementById('pendingMaterialMeta');

    const openPendingModal = (itemName, metaText) => {
        pendingMaterialName.textContent = itemName || 'Zkušební materiál';
        pendingMaterialMeta.textContent = metaText || 'PDF bude doplněno';
        pendingModal.classList.add('is-open');
        pendingModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closePendingModal = () => {
        pendingModal.classList.remove('is-open');
        pendingModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    pendingModal.querySelectorAll('[data-close-pending-modal]').forEach(closeEl => {
        closeEl.addEventListener('click', closePendingModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pendingModal.classList.contains('is-open')) {
            closePendingModal();
        }
    });

    const hasPdfTarget = (href) => {
        if (!href) return false;
        const cleanHref = href.trim().toLowerCase();
        if (!cleanHref || cleanHref === '#' || cleanHref.startsWith('javascript:')) return false;
        return cleanHref.includes('.pdf');
    };

    document.querySelectorAll('.btn-download-main').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href') || '';
            if (hasPdfTarget(href)) return;

            e.preventDefault();

            const item = btn.closest('.sub-question-item');
            const questionText = item?.querySelector('.q-text')?.textContent.trim() || 'Zkušební materiál';
            const card = item?.closest('.question-card');
            const badgeText = card?.querySelector('.question-number-badge')?.textContent.trim() || 'Otázka';
            const subjectText = item?.closest('.subject-category')?.querySelector('.summary-content h2')?.textContent.trim() || 'Studijní materiály';

            openPendingModal(questionText, `${subjectText} • ${badgeText}`);
        });
    });
});