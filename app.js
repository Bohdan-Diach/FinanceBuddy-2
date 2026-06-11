// Завантажуємо дані з LocalStorage або створюємо порожні
let transactions = JSON.parse(localStorage.getItem('fb_transactions')) || [];
let goal = JSON.parse(localStorage.getItem('fb_goal')) || null;

// Елементи сповіщення (Toast)
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Запуск програми
function init() {
    updateGoalUI();
    updateTransactionsUI();
}

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.className = `fixed top-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${isError ? 'bg-rose-500' : 'bg-emerald-500'}`;
    
    setTimeout(() => toast.classList.remove('translate-x-full', 'opacity-0'), 10);
    
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

function formatMoney(amount) {
    return parseFloat(amount).toFixed(2);
}

// Логіка Фінансової Цілі
document.getElementById('goal-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const name = document.getElementById('g-name').value;
    const amount = parseFloat(document.getElementById('g-amount').value);

    goal = { name, amount };
    localStorage.setItem('fb_goal', JSON.stringify(goal));
    
    showToast('Ціль успішно оновлено!');
    document.getElementById('goal-form').reset();
    updateGoalUI();
});

document.getElementById('delete-goal-btn').addEventListener('click', function() {
    goal = null;
    localStorage.removeItem('fb_goal');
    showToast('Ціль прибрано.', true);
    updateGoalUI();
});

function updateGoalUI() {
    const emptyState = document.getElementById('empty-goal-state');
    const activeState = document.getElementById('active-goal-state');

    if (!goal) {
        emptyState.style.display = 'block';
        activeState.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        activeState.style.display = 'block';

        document.getElementById('display-goal-name').textContent = goal.name;
        document.getElementById('display-goal-amount').textContent = `₴${formatMoney(goal.amount)}`;

        const balance = calculateBalance();
        const saved = balance > 0 ? balance : 0; 
        
        let percent = (saved / goal.amount) * 100;
        if (percent > 100) percent = 100;
        if (percent < 0) percent = 0;

        const remaining = goal.amount - saved;

        document.getElementById('goal-progress-percent').textContent = `${Math.floor(percent)}%`;
        document.getElementById('goal-progress-bar').style.width = `${percent}%`;
        document.getElementById('goal-remaining').textContent = `₴${formatMoney(remaining > 0 ? remaining : 0)}`;
    }
}

// Логіка Транзакцій
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('t-name').value;
    const amount = parseFloat(document.getElementById('t-amount').value);
    const type = document.getElementById('t-type').value;

    const newTransaction = {
        id: Date.now(),
        name,
        amount,
        type,
        date: new Date().toLocaleDateString('uk-UA')
    };

    transactions.unshift(newTransaction);
    localStorage.setItem('fb_transactions', JSON.stringify(transactions));

    showToast('Транзакцію додано!');
    document.getElementById('transaction-form').reset();
    updateTransactionsUI();
    updateGoalUI();
});

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('fb_transactions', JSON.stringify(transactions));
    showToast('Транзакцію видалено', true);
    updateTransactionsUI();
    updateGoalUI(); 
}

function calculateBalance() {
    return transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
}

function updateTransactionsUI() {
    const list = document.getElementById('transactions-list');
    let income = 0;
    let expense = 0;

    list.innerHTML = '';

    if (transactions.length === 0) {
        list.innerHTML = '<div class="text-slate-400 text-center py-4">Немає транзакцій</div>';
    } else {
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;

            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const colorClass = isIncome ? 'text-emerald-400' : 'text-rose-400';
            const bgClass = isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10';

            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors';
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${bgClass} ${colorClass}">
                        <i class="fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                    </div>
                    <div>
                        <div class="font-bold">${t.name}</div>
                        <div class="text-xs text-slate-400">${t.date}</div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="font-bold ${colorClass}">${sign}₴${formatMoney(t.amount)}</div>
                    <button onclick="deleteTransaction(${t.id})" class="text-slate-500 hover:text-rose-500 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    }

    const balance = income - expense;
    document.getElementById('total-balance').textContent = `₴${formatMoney(balance)}`;
    document.getElementById('total-income').textContent = `+₴${formatMoney(income)}`;
    document.getElementById('total-expense').textContent = `-₴${formatMoney(expense)}`;
}

// Запускаємо додаток при завантаженні
init();
