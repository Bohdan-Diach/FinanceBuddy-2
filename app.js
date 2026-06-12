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
function initStatistics() {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    const expensesByCat = {};
    let totalExpense = 0;
    
    transactions.forEach(t => {
        if (t.type === 'expense') {
            expensesByCat[t.category] = (expensesByCat[t.category] || 0) + t.amount;
            totalExpense += t.amount;
        }
    });

    document.getElementById('total-expense-stat').textContent = `₴${formatMoney(totalExpense)}`;

    const labels = Object.keys(expensesByCat).map(k => categoryConfig[k].name);
    const data = Object.values(expensesByCat);
    const maxVal = Math.max(...(data.length ? data : [0]));
    const bgColors = data.map(val => val === maxVal ? '#ff5722' : '#10b981');

    new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: bgColors, borderRadius: 8 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });
}
