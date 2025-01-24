document.addEventListener('DOMContentLoaded', function() {
    loadVMs();
    
    document.getElementById('search-input').addEventListener('input', filterVMs);
    document.getElementById('refresh-btn').addEventListener('click', loadVMs);
});

function loadVMs() {
    const vmList = document.getElementById('vm-list');
    vmList.innerHTML = '<tr><td colspan="4" style="text-align: center;">Загрузка данных...</td></tr>';
    
    fetch('/api/vms')
        .then(response => response.json())
        .then(vms => {
            vmList.innerHTML = '';
            vms.forEach(vm => {
                const row = createVMRow(vm);
                vmList.appendChild(row);
            });
            showNotification('Данные загружены', 'success');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            vmList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Ошибка загрузки данных</td></tr>';
            showNotification('Ошибка загрузки', 'error');
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

function filterVMs() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const rows = document.getElementById('vm-list').getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const vmName = row.cells[1].textContent.toLowerCase();
        row.style.display = vmName.includes(searchText) ? '' : 'none';
    });
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
        showNotification('Дата обновлена', 'success');
    })
    .catch(error => {
        showNotification('Ошибка обновления', 'error');
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