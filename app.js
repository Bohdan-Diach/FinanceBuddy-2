let transactions = JSON.parse(localStorage.getItem('fb_bento_data')) || [];
let userGoal = JSON.parse(localStorage.getItem('fb_goal_data')) || null;

const categoryConfig = {
    'income': { name: 'Дохід', icon: 'fa-arrow-down', color: 'text-emerald-500', bg: 'bg-emerald-100' },
    'products': { name: 'Продукти', icon: 'fa-apple-alt', color: 'text-slate-700', bg: 'bg-slate-100' },
    'transport': { name: 'Транспорт', icon: 'fa-car', color: 'text-slate-700', bg: 'bg-slate-100' },
    'entertainment': { name: 'Розваги', icon: 'fa-film', color: 'text-slate-700', bg: 'bg-slate-100' },
    'shopping': { name: 'Покупки', icon: 'fa-shopping-bag', color: 'text-slate-700', bg: 'bg-slate-100' },
    'other': { name: 'Інше', icon: 'fa-box', color: 'text-slate-700', bg: 'bg-slate-100' }
};

function formatMoney(amount) { return Math.floor(amount).toLocaleString('uk-UA'); }

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('transaction-form')) initDashboard();
    if (document.getElementById('analyticsChart')) initStatistics();
    if (document.getElementById('full-history-list')) initHistory();
});

/* ================= ЛОГІКА ГОЛОВНОЇ СТОРІНКИ ТА ЦІЛІ ================= */
function initDashboard() {
    updateDashboardUI();

    document.getElementById('transaction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        let name = document.getElementById('t-name').value;
        const amount = parseFloat(document.getElementById('t-amount').value);
        const category = document.getElementById('t-category').value;
        const type = category === 'income' ? 'income' : 'expense';

        if (!name.trim()) name = categoryConfig[category].name;

        transactions.unshift({
            id: Date.now(), name: name, amount: amount, category: category, type: type,
            date: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })
        });
        localStorage.setItem('fb_bento_data', JSON.stringify(transactions));

        document.getElementById('t-name').value = '';
        document.getElementById('t-amount').value = '';
        updateDashboardUI();
    });

    // Обробка форми цілі в модальному вікні
    document.getElementById('goal-modal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('modal-g-name').value;
        const amount = parseFloat(document.getElementById('modal-g-amount').value);
        
        userGoal = { name, amount };
        localStorage.setItem('fb_goal_data', JSON.stringify(userGoal));

        // Масив побажань
        const motivations = [
            "Чудова мета! З такою дисципліною ключі будуть твоїми швидше, ніж здається 🚗",
            "Прекрасний вибір! Кожна відкладена гривня наближає тебе до мрії 🎯",
            "Великі цілі вимагають маленьких кроків. Ти точно впораєшся! 🚀",
            "Так тримати! Головне — регулярність, і результат не забариться 💼"
        ];
        const randomMsg = motivations[Math.floor(Math.random() * motivations.length)];

        // Ховаємо форму, показуємо анімацію успіху
        document.getElementById('goal-modal-form').classList.add('hidden');
        document.getElementById('modal-motivation-text').textContent = randomMsg;
        document.getElementById('modal-success').classList.remove('hidden');

        updateDashboardUI(); // Оновлюємо картку на фоні

        // Через 3.5 секунди закриваємо модалку і повертаємо її в початковий стан
        setTimeout(() => {
            closeGoalModal();
            setTimeout(() => {
                document.getElementById('goal-modal-form').classList.remove('hidden');
                document.getElementById('modal-success').classList.add('hidden');
                document.getElementById('modal-g-name').value = '';
                document.getElementById('modal-g-amount').value = '';
            }, 300);
        }, 3500);
    });
}

// Функції відкриття/закриття модалки
function openGoalModal() {
    const modal = document.getElementById('goal-modal');
    const card = document.getElementById('goal-modal-card');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    card.classList.add('modal-enter');
}

function closeGoalModal() {
    const modal = document.getElementById('goal-modal');
    const card = document.getElementById('goal-modal-card');
    card.classList.remove('modal-enter');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function updateDashboardUI() {
    let income = 0; let expense = 0;
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';

    transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });

    const recentTransactions = transactions.slice(0, 3);
    if (recentTransactions.length === 0) {
        list.innerHTML = '<div class="text-slate-400 text-sm py-4">Немає операцій</div>';
    } else {
        recentTransactions.forEach(t => {
            const conf = categoryConfig[t.category];
            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const amountColor = isIncome ? 'text-emerald-600' : 'text-slate-800';

            list.innerHTML += `
                <div class="flex justify-between items-center p-2 rounded-xl bg-slate-50 mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center ${conf.bg} ${conf.color} text-xs"><i class="fas ${conf.icon}"></i></div>
                        <div>
                            <div class="font-bold text-sm text-slate-800 truncate w-24">${t.name}</div>
                            <div class="text-[10px] text-slate-400">${t.date}</div>
                        </div>
                    </div>
                    <div class="font-bold text-sm ${amountColor}">${sign}₴${formatMoney(t.amount)}</div>
                </div>`;
        });
    }

    const balance = income - expense;
    document.getElementById('total-balance').textContent = balance >= 0 ? formatMoney(balance) : '0';
    
    // Оновлення кільця балансу
    const ring = document.getElementById('balance-ring');
    const percentText = document.getElementById('balance-percent');
    let percent = 0;
    if (income > 0) percent = Math.max(0, Math.round(((income - expense) / income) * 100));
    if (ring && percentText) {
        ring.style.strokeDashoffset = 251.2 - (percent / 100) * 251.2;
        percentText.textContent = `${percent}%`;
    }

    // Оновлення картки Цілі
    const goalBox = document.getElementById('goal-ui-content');
    if (!userGoal) {
        goalBox.innerHTML = `
            <div class="text-center opacity-50">
                <i class="fas fa-crosshairs text-3xl mb-2"></i>
                <p class="text-sm font-medium">Ціль не встановлено</p>
            </div>`;
    } else {
        const saved = balance > 0 ? balance : 0;
        let goalPercent = (saved / userGoal.amount) * 100;
        if (goalPercent > 100) goalPercent = 100;
        
        goalBox.innerHTML = `
            <div>
                <p class="text-sm text-slate-400 mb-1">Збираємо на:</p>
                <h4 class="font-bold text-xl text-slate-800 truncate">${userGoal.name}</h4>
                <div class="flex justify-between items-end mt-4 mb-2">
                    <span class="text-emerald-500 font-bold text-lg">${Math.floor(goalPercent)}%</span>
                    <span class="text-sm text-slate-400">з ₴${formatMoney(userGoal.amount)}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000" style="width: ${goalPercent}%"></div>
                </div>
            </div>`;
    }
}
//... ТУТ ЗАЛИШАЄТЬСЯ ТВОЯ ЛОГІКА ДЛЯ СТАТИСТИКИ ТА ІСТОРІЇ ...
/* ================= ЛОГІКА СТОРІНКИ СТАТИСТИКИ ================= */
/* ================= ЛОГІКА СТОРІНКИ ІСТОРІЇ ================= */
function initHistory() {
    const searchInput = document.getElementById('search-input');
    const typeButtons = document.querySelectorAll('.type-filter');
    let currentTypeFilter = 'all';
    let searchQuery = '';

    // Функція рендеру списку з урахуванням фільтрів
    function renderHistory() {
        const list = document.getElementById('full-history-list');
        list.innerHTML = '';

        // Фільтруємо масив транзакцій
        let filtered = transactions.filter(t => {
            const matchType = currentTypeFilter === 'all' || t.type === currentTypeFilter;
            const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                categoryConfig[t.category].name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchType && matchSearch;
        });

        if (filtered.length === 0) {
            list.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                    <i class="fas fa-search text-4xl mb-4 opacity-50"></i>
                    <p class="font-medium">Записів не знайдено</p>
                </div>`;
            return;
        }

        // Відмальовуємо красиві рядки
        filtered.forEach(t => {
            const conf = categoryConfig[t.category];
            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const amountColor = isIncome ? 'text-emerald-600' : 'text-slate-800';

            const item = document.createElement('div');
            item.className = 'flex justify-between items-center p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 group';
            item.innerHTML = `
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center ${conf.bg} ${conf.color} shadow-inner">
                        <i class="fas ${conf.icon} text-lg"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 text-base">${t.name}</div>
                        <div class="text-xs text-slate-400 font-medium mt-0.5">${conf.name} • ${t.date}</div>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="font-bold text-lg tracking-tight ${amountColor}">${sign}₴${formatMoney(t.amount)}</div>
                    <button onclick="deleteTransaction(${t.id}); setTimeout(()=>renderHistory(), 10);" class="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    // Слухач для живого пошуку
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderHistory();
    });

    // Слухачі для кнопок-фільтрів (Всі / Доходи / Витрати)
    typeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            typeButtons.forEach(b => {
                b.classList.remove('bg-white', 'shadow-sm', 'text-slate-800');
                b.classList.add('text-slate-400');
                b.classList.remove('active');
            });
            e.target.classList.add('bg-white', 'shadow-sm', 'text-slate-800', 'active');
            e.target.classList.remove('text-slate-400');
            
            currentTypeFilter = e.target.getAttribute('data-type');
            renderHistory();
        });
    });

    // Перший запуск
    renderHistory();
}
