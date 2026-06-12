let transactions = JSON.parse(localStorage.getItem('fb_bento_data')) || [];

const categoryConfig = {
    'income': { name: 'Дохід', icon: 'fa-arrow-down', color: 'text-emerald-500', bg: 'bg-emerald-100' },
    'products': { name: 'Продукти', icon: 'fa-apple-alt', color: 'text-slate-700', bg: 'bg-slate-100' },
    'transport': { name: 'Транспорт', icon: 'fa-car', color: 'text-slate-700', bg: 'bg-slate-100' },
    'entertainment': { name: 'Розваги', icon: 'fa-film', color: 'text-slate-700', bg: 'bg-slate-100' },
    'shopping': { name: 'Покупки', icon: 'fa-shopping-bag', color: 'text-slate-700', bg: 'bg-slate-100' },
    'other': { name: 'Інше', icon: 'fa-box', color: 'text-slate-700', bg: 'bg-slate-100' }
};

function formatMoney(amount) {
    return Math.floor(amount).toLocaleString('uk-UA');
}

// Запуск потрібних функцій залежно від сторінки
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('transaction-form')) {
        initDashboard();
    }
    if (document.getElementById('analyticsChart')) {
        initStatistics();
    }
    {if (document.getElementById('full-history-list')) initHistory();}
});

/* ================= ЛОГІКА ГОЛОВНОЇ СТОРІНКИ ================= */
function initDashboard() {
    updateDashboardUI();

    document.getElementById('transaction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        let name = document.getElementById('t-name').value;
        const amount = parseFloat(document.getElementById('t-amount').value);
        const category = document.getElementById('t-category').value;
        const type = category === 'income' ? 'income' : 'expense';

        // Якщо назву не ввели, беремо назву категорії
        if (!name.trim()) {
            name = categoryConfig[category].name;
        }

        const newTransaction = {
            id: Date.now(),
            name: name,
            amount: amount,
            category: category,
            type: type,
            date: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })
        };

        transactions.unshift(newTransaction);
        localStorage.setItem('fb_bento_data', JSON.stringify(transactions));

        document.getElementById('t-name').value = '';
        document.getElementById('t-amount').value = '';
        
        updateDashboardUI();
    });
}

function updateDashboardUI() {
    let income = 0;
    let expense = 0;
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';

    transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });

    // Виводимо тільки 4 останні транзакції на головній
    const recentTransactions = transactions.slice(0, 4);

    if (recentTransactions.length === 0) {
        list.innerHTML = '<div class="text-slate-400 text-sm text-center py-4">Немає операцій</div>';
    } else {
        recentTransactions.forEach(t => {
            const conf = categoryConfig[t.category];
            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const amountColor = isIncome ? 'text-emerald-600' : 'text-slate-800';

            const item = document.createElement('div');
            item.className = 'flex justify-between items-center p-2 rounded-xl bg-slate-50 mb-2';
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${conf.bg} ${conf.color}">
                        <i class="fas ${conf.icon}"></i>
                    </div>
                    <div>
                        <div class="font-bold text-sm text-slate-800">${t.name}</div>
                        <div class="text-xs text-slate-400">${t.date}</div>
                    </div>
                </div>
                <div class="font-bold text-sm ${amountColor}">${sign}₴${formatMoney(t.amount)}</div>
            `;
            list.appendChild(item);
        });
    }

    const balance = income - expense;
    document.getElementById('total-balance').textContent = balance >= 0 ? formatMoney(balance) : '0';
    
    // Кільце прогресу
    const ring = document.getElementById('balance-ring');
    const percentText = document.getElementById('balance-percent');
    let percent = 0;
    if (income > 0) percent = Math.max(0, Math.round(((income - expense) / income) * 100));
    
    if (ring && percentText) {
        const circumference = 251.2;
        ring.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        percentText.textContent = `${percent}%`;
    }
}

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
