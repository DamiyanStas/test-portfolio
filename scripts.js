/* ======================================== */
/*                DARK MODE                 */
/* ======================================== */

const btnDarkMode = document.querySelector(".dark-mode-btn");
const htmlEl = document.documentElement;
const logoImage = document.getElementById('logo');
// const logoFooterImage = document.getElementById('logo-footer');

// Иконки услуг (массив для удобства масштабирования)
const serviceIcons = [
    document.getElementById('icons-services'),
    document.getElementById('icons-services-2'),
    document.getElementById('icons-services-3'),
    document.getElementById('icons-services-4')
];

// Функция обновления src изображения (защита от лишних перерисовок)
function updateSrcIfNeeded(imgEl, newSrc) {
    try {
        // Получаем только имя файла из текущего URL, игнорируя параметры ?v=...
        const currentFile = new URL(imgEl.src).pathname.split('/').pop();
        const targetFile = new URL(newSrc).pathname.split('/').pop();

        if (currentFile !== targetFile) {
            imgEl.src = newSrc;
        }
    } catch (e) {
        // Если картинка еще не загрузилась или путь некорректен
        imgEl.src = newSrc;
    }
}

/**
 * Единая функция применения темы.
 * Управляет классами, localStorage, цветами скроллбара и изображениями.
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        // 1. Классы и состояние кнопки
        btnDarkMode.classList.add("dark-mode-btn--active");
        htmlEl.classList.add("dark");
        localStorage.setItem("darkMode", "dark");

        // 2. Скроллбар (из первого скрипта)
        htmlEl.style.setProperty('--scrollbar-thumb-bg', '#3a4070');
        htmlEl.style.setProperty('--scrollbar-track-bg', '#13162d');

        // 3. Изображения (из второго скрипта)
        updateSrcIfNeeded(logoImage, './images/PORTFOLIO-logo.png');
        // updateSrcIfNeeded(logoFooterImage, 'images/Footer-dark.png');
        serviceIcons.forEach((icon, index) => {
            const darkNames = ['design-dark.png', 'layout-dark.png', 'seo-dark.png', 'CMS-dark.png'];
            if (icon) updateSrcIfNeeded(icon, `images/icons/${darkNames[index]}`);
        });

    } else {
        // LIGHT THEME
        btnDarkMode.classList.remove("dark-mode-btn--active");
        htmlEl.classList.remove("dark");
        localStorage.setItem("darkMode", "light");

        // 2. Скроллбар (светлые значения)
        htmlEl.style.setProperty('--scrollbar-thumb-bg', '#c30037'); /* Основной цвет ползунка стал светлее для light theme */
        htmlEl.style.setProperty('--scrollbar-track-bg', '#d0d1df');

        // 3. Изображения
        updateSrcIfNeeded(logoImage, './images/PORTFOLIO-logo-light.png');
        // updateSrcIfNeeded(logoFooterImage, 'images/Footer-light.png');
        serviceIcons.forEach((icon, index) => {
            const lightNames = ['design-light.png', 'layout-light.png', 'seo-light.png', 'CMS-light.png'];
            if (icon) updateSrcIfNeeded(icon, `images/icons/${lightNames[index]}`);
        });
    }

    /* ВАЖНО: Если внутри applyTranslation есть вызов updateAccordionButtonText(), 
       он сработает автоматически после смены языка. Здесь мы ничего не трогаем. */
}

/* ======================================== */
/*           ЛОГИКА ИНИЦИАЛИЗАЦИИ           */
/* ======================================== */

document.addEventListener('DOMContentLoaded', async () => {

    /* --- ПРИОРИТЕТЫ ТЕМЫ (Логика вашего второго скрипта) --- */
    const savedTheme = localStorage.getItem("darkMode");
    let initialTheme;

    if (savedTheme) {
        initialTheme = savedTheme;
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'dark' : 'light';
    }

    // Применяем начальную тему ДО рендера контента, чтобы избежать FOUC
    applyTheme(initialTheme);

    /* --- СЛУШАТЕЛЬ СИСТЕМНЫХ НАСТРОЕК --- */
    let systemListenerActive = !localStorage.getItem('darkMode');

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
        if (systemListenerActive) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });

    /* --- КНОПКА ПЕРЕКЛЮЧЕНИЯ --- */
    if (btnDarkMode) {
        btnDarkMode.onclick = function () {
            const isNowDark = htmlEl.classList.toggle("dark");
            systemListenerActive = false; // Отключаем следование за системой

            // Определяем тему по состоянию DOM (дублируем логику toggle)
            const targetTheme = isNowDark ? 'dark' : 'light';
            applyTheme(targetTheme);
        };
    }

    /* ======================================== */
    /*     ОСТАЛЬНОЙ ФУНКЦИОНАЛ (ЯКОРИ, МЕНЮ,   */
    /*     I18N, АККОРДЕОН)                     */
    /* ======================================== */

    // ЯКОРНЫЕ ССЫЛКИ
    document.querySelectorAll(".header-container a").forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const id = this.getAttribute('href');
            const elem = document.querySelector(id);

            if (!elem) return;

            // Находим элемент шапки
            const headerEl = document.querySelector('header');

            let offsetValue = 0;
            if (headerEl) {
                // Получаем точную высоту блока с учетом внутренних паддингов и границ
                const { height } = headerEl.getBoundingClientRect();

                /* 
                 * Если ширина экрана <= 1200px или высота шапки уменьшилась до 80px, используем меньший отступ.
                 */
                if (window.innerWidth <= 1200 || height <= 80) {
                    offsetValue = 80;
                } else {
                    offsetValue = 120;
                }
            }

            window.scrollTo({
                top: elem.offsetTop - offsetValue,
                behavior: 'smooth'
            });
        });
    });



    // MENU-BURGER
    const menu = document.querySelector('.nav');
    const menuBtn = document.querySelector('.nav-button-burger');
    if (menu && menuBtn) {
        const closeMenu = () => { menu.classList.remove('active'); menuBtn.classList.remove('active'); };
        menuBtn.addEventListener('click', () => { menu.classList.toggle('active'); menuBtn.classList.toggle('active'); });
        menu.addEventListener('click', (e) => { if (e.target.classList.contains('nav')) closeMenu(); });
        menu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu.classList.contains('active')) closeMenu(); });
    }

    // ГЛОБАЛЬНЫЕ ДЛЯ i18n И АККОРДЕОНА
    let currentLang = 'ru';
    const translations = {};
    const accButton = document.getElementById('toggle-Accordion');
    const content = document.getElementById('accordion-Content');

    function updateAccordionButtonText() {
        if (!accButton || !content) return;
        const isOpen = content.classList.contains('content-visible');
        const keySuffix = isOpen ? '.close' : '.open';
        const fullKey = `accordion.button${keySuffix}`;
        let value = translations[currentLang];
        if (value) {
            fullKey.split('.').forEach(k => { value = value && value[k]; });
            const buttonSpan = accButton.querySelector('span[data-i18n-key]');
            if (buttonSpan && value) buttonSpan.textContent = value;
        }
        if (accButton) accButton.setAttribute('aria-expanded', isOpen);
    }

    if (accButton && content) {
        accButton.addEventListener('click', () => {
            content.classList.toggle('content-visible');
            updateAccordionButtonText();
        });
    }

    function applyTranslation(lang) {
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            if (el.closest('#toggle-Accordion')) return; // Пропускаем кнопку аккордеона
            const key = el.getAttribute('data-i18n-key');
            const keys = key.split('.');
            let value = translations[lang];
            keys.forEach(k => { value = value && value[k]; });
            if (value) el.textContent = value;
        });
    }

    async function switchLanguage(lang) {
        if (!translations[lang]) {
            try {
                const response = await fetch(`./languages/${lang}.json`);
                if (!response.ok) throw new Error(`Не удалось загрузить локаль для ${lang}`);
                translations[lang] = await response.json();
            } catch (error) {
                console.error(error);
                return;
            }
        }
        applyTranslation(lang);
        currentLang = lang;
    }

    // ИНИЦИАЛИЗАЦИЯ i18n И ФЛАГА
    const savedLang = localStorage.getItem('userLang');
    const langToLoad = savedLang || 'ru';
    currentLang = langToLoad;

    const flagIcon = document.getElementById('flag-icon');
    if (flagIcon) {
        flagIcon.src = `./images/Flags/${langToLoad.toUpperCase()}.png`;
        flagIcon.alt = langToLoad.toUpperCase();
    }

    await switchLanguage(langToLoad);
    updateAccordionButtonText();

    const languageDisplay = document.getElementById('language-display');
    const languageOptionsContainer = document.getElementById('language-options');

    if (languageDisplay && languageOptionsContainer) {
        languageDisplay.addEventListener('click', (event) => { event.stopPropagation(); languageDisplay.classList.toggle('active'); });
        languageOptionsContainer.addEventListener('click', async (event) => {
            event.stopPropagation();
            const selectedOption = event.target.closest('.option');
            if (selectedOption) {
                const selectedLang = selectedOption.getAttribute('data-lang');
                if (flagIcon) {
                    flagIcon.src = `./images/Flags/${selectedLang.toUpperCase()}.png`;
                    flagIcon.alt = selectedLang.toUpperCase();
                }
                await switchLanguage(selectedLang);
                updateAccordionButtonText();
                localStorage.setItem('userLang', selectedLang);
                languageDisplay.classList.remove('active');
                document.documentElement.lang = selectedLang;
            }
        });
        document.addEventListener('click', () => {
            if (languageDisplay.classList.contains('active')) languageDisplay.classList.remove('active');
        });
    }
});