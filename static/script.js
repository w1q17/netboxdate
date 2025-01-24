document.addEventListener('DOMContentLoaded', function() {
    console.log("Загрузка страницы...");
    loadVMs();
    
    // Обработчик поиска
    document.getElementById('search-input').addEventListener('input', filterVMs);
    
    // Обработчик кнопки обновления
    document.getElementById('refresh-btn').addEventListener('click', loadVMs);
});

function loadVMs() {
    const loading = document.getElementById('loading');
    const vmTable = document.getElementById('vm-table');
    
    loading.style.display = 'block';
    vmTable.style.display = 'none';
    
    fetch('/api/vms')
        .then(response => response.json())
        .then(vms => {
            const vmList = document.getElementById('vm-list');
            vmList.innerHTML = '';
            
            document.getElementById('vm-count').textContent = vms.length;
            
            let expiringSoon = 0;
            const today = new Date();
            
            vms.forEach(vm => {
                const row = createVMRow(vm);
                vmList.appendChild(row);
                
                // Подсчет скоро истекающих VM (30 дней)
                if (vm.date_expiry) {
                    const expiryDate = new Date(vm.date_expiry);
                    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
                    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                        expiringSoon++;
                    }
                }
            });
            
            document.getElementById('expiring-soon').textContent = expiringSoon;
            
            loading.style.display = 'none';
            vmTable.style.display = 'table';
        })
        .catch(error => {
            console.error('Ошибка:', error);
            loading.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Ошибка загрузки данных</div>`;
        });
}

function createVMRow(vm) {
    const tr = document.createElement('tr');
    const currentDate = vm.date_expiry || '';
    
    tr.innerHTML = `
        <td>${vm.id}</td>
        <td>${vm.name}</td>
        <td>
            <input type="date" class="date-input" value="${currentDate}" id="date-${vm.id}">
        </td>
        <td>
            <button class="btn btn-update" onclick="updateDate(${vm.id})">
                <i class="fas fa-save"></i> Сохранить
            </button>
        </td>
    `;
    
    return tr;
}

function updateDate(vmId) {
    const dateInput = document.getElementById(`date-${vmId}`);
    const newDate = dateInput.value;
    
    fetch(`/api/vms/${vmId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date_expiry: newDate
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Дата успешно обновлена', 'success');
        loadVMs();
    })
    .catch(error => {
        showNotification('Ошибка при обновлении даты', 'error');
        console.error('Ошибка:', error);
    });
}

function filterVMs() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const rows = document.getElementById('vm-list').getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const vmName = row.getElementsByTagName('td')[1].textContent.toLowerCase();
        row.style.display = vmName.includes(searchText) ? '' : 'none';
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 