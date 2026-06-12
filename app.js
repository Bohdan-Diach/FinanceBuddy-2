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
let currentChart = null; // Змінна для зберігання графіка, щоб ми могли його перемальовувати

function initStatistics() {
    // 1. Знаходимо всі кнопки фільтрів
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Знімаємо зелений колір з усіх кнопок
            buttons.forEach(b => {
                b.classList.remove('bg-emerald-500', 'shadow-lg');
                b.classList.add('bg-white/10');
            });
            // Робимо натиснуту кнопку зеленою
            e.target.classList.remove('bg-white/10');
            e.target.classList.add('bg-emerald-500', 'shadow-lg');

            // Отримуємо тип фільтра (day, week, month, year, all) і малюємо графік
            const filterType = e.target.getAttribute('data-filter');
            renderChart(filterType);
        });
    });

    // 2. Малюємо графік за замовчуванням ("Всі дані") при завантаженні
    renderChart('all');
}

function renderChart(timeFilter) {
    const now = Date.now();
    const DAY_IN_MS = 24 * 60 * 60 * 1000; // Кількість мілісекунд у дні

    // Відфільтровуємо лише витрати
    let filteredTransactions = transactions.filter(t => t.type === 'expense');

    // Відрізаємо старі транзакції залежно від обраного фільтра
    if (timeFilter === 'day') {
        filteredTransactions = filteredTransactions.filter(t => (now - t.id) <= DAY_IN_MS);
    } else if (timeFilter === 'week') {
        filteredTransactions = filteredTransactions.filter(t => (now - t.id) <= DAY_IN_MS * 7);
    } else if (timeFilter === 'month') {
        filteredTransactions = filteredTransactions.filter(t => (now - t.id) <= DAY_IN_MS * 30);
    } else if (timeFilter === 'year') {
        filteredTransactions = filteredTransactions.filter(t => (now - t.id) <= DAY_IN_MS * 365);
    }

    const expensesByCat = {};
    let totalExpense = 0;

    // Рахуємо суми по категоріях для відфільтрованих даних
    filteredTransactions.forEach(t => {
        expensesByCat[t.category] = (expensesByCat[t.category] || 0) + t.amount;
        totalExpense += t.amount;
    });

    // Оновлюємо велику цифру на екрані
    document.getElementById('total-expense-stat').textContent = `₴${formatMoney(totalExpense)}`;

    // Підготовка даних для Chart.js
    const labels = Object.keys(expensesByCat).map(k => categoryConfig[k].name);
    const data = Object.values(expensesByCat);
    
    // Кастомні кольори для рухливого графіка
    const categoryColors = {
        'products': '#10b981',      // Смарагдовий
        'transport': '#ff5722',     // Помаранчевий
        'entertainment': '#8b5cf6', // Фіолетовий
        'shopping': '#3b82f6',      // Синій
        'other': '#94a3b8'          // Сірий
    };
    const bgColors = Object.keys(expensesByCat).map(k => categoryColors[k] || '#10b981');

    const ctx = document.getElementById('analyticsChart').getContext('2d');

    // Якщо графік вже існує — знищуємо його перед тим як намалювати новий
    if (currentChart) {
        currentChart.destroy();
    }

    // Створюємо нову рухливу кругову діаграму (Doughnut)
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                // Якщо даних немає, малюємо сіре пусте кільце
                data: data.length ? data : [1],
                backgroundColor: data.length ? bgColors : ['rgba(255, 255, 255, 0.05)'],
                borderWidth: 0,
                hoverOffset: data.length ? 15 : 0 // Ефект висування при наведенні
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Робить графік тонким кільцем
            plugins: {
                legend: {
                    position: 'right', // Легенда справа
                    labels: { 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        font: { family: 'Inter', size: 14 }, 
                        padding: 24, 
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 14, family: 'Inter' },
                    bodyFont: { size: 16, family: 'Inter', weight: 'bold' },
                    padding: 16,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) {
                            if (!data.length) return ' Немає даних за цей період';
                            return ` ₴${formatMoney(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}
