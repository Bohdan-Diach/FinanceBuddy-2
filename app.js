// Ініціалізація даних з LocalStorage
let transactions = JSON.parse(localStorage.getItem('fb_bento_data')) || [];
let analyticsChart = null;

// Налаштування категорій та іконок для дизайну високого рівня
const categoryConfig = {
    'income': { name: 'Дохід', icon: 'fa-arrow-down', color: 'text-emerald-500', bg: 'bg-emerald-100' },
    'products': { name: 'Продукти', icon: 'fa-apple-alt', color: 'text-slate-700', bg: 'bg-slate-100' },
    'transport': { name: 'Транспорт', icon: 'fa-car', color: 'text-slate-700', bg: 'bg-slate-100' },
    'entertainment': { name: 'Розваги', icon: 'fa-film', color: 'text-slate-700', bg: 'bg-slate-100' },
    'shopping': { name: 'Покупки', icon: 'fa-shopping-bag', color: 'text-slate-700', bg: 'bg-slate-100' },
    'other': { name: 'Інше', icon: 'fa-box', color: 'text-slate-700', bg: 'bg-slate-100' }
};

// Запуск програми
function init() {
    initChart();
    updateUI();
}

// Професійна функція сповіщень
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle text-emerald-400';
    } else {
        toastIcon.className = 'fas fa-trash text-rose-400';
    }

    // Анімація виїзду
    toast.classList.remove('-translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-20', 'opacity-0');
    }, 2500);
}

// Форматування валюти (напр. 12 500)
function formatMoney(amount) {
    return Math.floor(amount).toLocaleString('uk-UA');
}

// Обробка форми
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('t-name').value;
    const amount = parseFloat(document.getElementById('t-amount').value);
    const category = document.getElementById('t-category').value;
    const type = category === 'income' ? 'income' : 'expense';

    const newTransaction = {
        id: Date.now(),
        name: name,
        amount: amount,
        category: category,
        type: type,
        date: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute:'2-digit' })
    };

    transactions.unshift(newTransaction);
    localStorage.setItem('fb_bento_data', JSON.stringify(transactions));

    showToast('Транзакцію додано!', 'success');
    
    // Очищення полів
    document.getElementById('t-name').value = '';
    document.getElementById('t-amount').value = '';
    
    updateUI();
});

// Видалення
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('fb_bento_data', JSON.stringify(transactions));
    showToast('Видалено', 'error');
    updateUI();
}

// Головна функція оновлення інтерфейсу
function updateUI() {
    let income = 0;
    let expense = 0;
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';

    if (transactions.length === 0) {
        list.innerHTML = '<div class="text-slate-400 text-sm text-center py-8">Немає операцій</div>';
    } else {
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;

            const conf = categoryConfig[t.category];
            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const amountColor = isIncome ? 'text-emerald-600' : 'text-slate-800';

            const item = document.createElement('div');
            item.className = 'flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors';
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${conf.bg} ${conf.color}">
                        <i class="fas ${conf.icon}"></i>
                    </div>
                    <div>
                        <div class="font-bold text-sm text-slate-800">${t.name}</div>
                        <div class="text-xs text-slate-400">${conf.name} • ${t.date}</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="font-bold text-sm ${amountColor}">${sign}₴${formatMoney(t.amount)}</div>
                    <button onclick="deleteTransaction(${t.id})" class="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    const balance = income - expense;
    document.getElementById('total-balance').textContent = balance >= 0 ? formatMoney(balance) : '0';
    document.getElementById('total-expense').textContent = `₴${formatMoney(expense)}`;

    updateProgressRing(income, expense);
    updateChartData(expense);
}

// Логіка кільця прогресу (SVG)
function updateProgressRing(income, expense) {
    const ring = document.getElementById('balance-ring');
    const percentText = document.getElementById('balance-percent');
    
    // Обчислення відсотка залишку
    let percent = 0;
    if (income > 0) {
        percent = Math.max(0, Math.round(((income - expense) / income) * 100));
    }

    // 251.2 - це довжина кола (circumference) для радіусу 40
    const circumference = 251.2;
    const offset = circumference - (percent / 100) * circumference;
    
    ring.style.strokeDashoffset = offset;
    percentText.textContent = `${percent}%`;
}

// Логіка діаграми Chart.js
function initChart() {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = 'Inter';

    analyticsChart = new Chart(ctx, {
        type: 'bar', // Змінили на стовпчикову діаграму, як на референсі
        data: { labels: [], datasets: [{ data: [], backgroundColor: '#10b981', borderRadius: 8 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, beginAtZero: true },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });
}

function updateChartData(totalExpense) {
    const expensesByCat = {};
    
    transactions.forEach(t => {
        if (t.type === 'expense') {
            expensesByCat[t.category] = (expensesByCat[t.category] || 0) + t.amount;
        }
    });

    const emptyMsg = document.getElementById('empty-chart-msg');
    
    if (totalExpense === 0) {
        analyticsChart.data.labels = [];
        analyticsChart.data.datasets[0].data = [];
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        
        // Підготовка даних для графіка
        const labels = Object.keys(expensesByCat).map(k => categoryConfig[k].name);
        const data = Object.values(expensesByCat);
        
        // Робимо найбільшу витрату помаранчевою (як на референсі)
        const maxVal = Math.max(...data);
        const bgColors = data.map(val => val === maxVal ? '#ff5722' : 'rgba(52, 211, 153, 0.4)');

        analyticsChart.data.labels = labels;
        analyticsChart.data.datasets[0].data = data;
        analyticsChart.data.datasets[0].backgroundColor = bgColors;
    }
    analyticsChart.update();
}

// Старт
init();
