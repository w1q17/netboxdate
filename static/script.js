document.addEventListener('DOMContentLoaded', function() {
    console.log("Загрузка страницы...");
    loadVMs();
    
    document.getElementById('search-input').addEventListener('input', filterVMs);
    document.getElementById('refresh-btn').addEventListener('click', function() {
        this.classList.add('rotating');
        loadVMs();
        setTimeout(() => this.classList.remove('rotating'), 1000);
    });
});

function loadVMs() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
    
    fetch('/api/vms')
        .then(response => response.json())
        .then(vms => {
            updateStats(vms);
            renderVMTable(vms);
            loading.style.display = 'none';
            showNotification('Данные успешно загружены', 'success');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            loading.style.display = 'none';
            showNotification('Ошибка при загрузке данных', 'error');
        });
}

function updateStats(vms) {
    const today = new Date();
    let expiringSoon = 0;
    
    vms.forEach(vm => {
        if (vm.date_expiry) {
            const expiryDate = new Date(vm.date_expiry);
            const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                expiringSoon++;
            }
        }
    });
    
    document.getElementById('vm-count').textContent = vms.length;
    document.getElementById('expiring-soon').textContent = expiringSoon;
}

function renderVMTable(vms) {
    const vmList = document.getElementById('vm-list');
    vmList.innerHTML = '';
    
    vms.forEach(vm => {
        const row = createVMRow(vm);
        vmList.appendChild(row);
    });
}

function createVMRow(vm) {
    const tr = document.createElement('tr');
    const currentDate = vm.date_expiry || '-';
    const status = getVMStatus(vm.date_expiry);
    
    tr.innerHTML = `
        <td>${vm.id}</td>
        <td>${vm.name}</td>
        <td>
            <div class="date-display">
                <span class="date-text">${currentDate}</span>
                <button class="edit-date-btn" type="button">
                    <i class="fas fa-calendar-alt"></i>
                </button>
            </div>
        </td>
        <td>
            <span class="status-badge ${status.class}">${status.text}</span>
        </td>
    `;
    
    const dateBtn = tr.querySelector('.edit-date-btn');
    const dateText = tr.querySelector('.date-text');
    
    // Удаляем старый input, если он есть
    const oldInput = tr.querySelector('.date-input');
    if (oldInput) {
        oldInput.remove();
    }
    
    // Инициализируем flatpickr
    flatpickr(dateBtn, {
        locale: 'ru',
        dateFormat: 'Y-m-d',
        defaultDate: vm.date_expiry || '',
        allowInput: false,
        clickOpens: true,
        onChange: function(selectedDates, dateStr) {
            if (!dateStr) return;
            
            fetch(`/api/vms/${vm.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date_expiry: dateStr
                })
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                dateText.textContent = dateStr || '-';
                showNotification('Дата обновлена', 'success');
                const newStatus = getVMStatus(dateStr);
                tr.querySelector('.status-badge').className = `status-badge ${newStatus.class}`;
                tr.querySelector('.status-badge').textContent = newStatus.text;
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showNotification('Ошибка обновления', 'error');
            });
        }
    });
    
    return tr;
}

function getVMStatus(dateExpiry) {
    if (!dateExpiry) return { text: 'Нет даты', class: 'status-expired' };
    
    const today = new Date();
    const expiryDate = new Date(dateExpiry);
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return { text: 'Истек', class: 'status-expired' };
    } else if (daysUntilExpiry <= 30) {
        return { text: 'Истекает скоро', class: 'status-expiring' };
    } else {
        return { text: 'Активен', class: 'status-active' };
    }
}

function filterVMs() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const rows = document.getElementById('vm-list').getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const vmName = row.cells[1].textContent.toLowerCase();
        row.style.display = vmName.includes(searchText) ? '' : 'none';
    });
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
} 