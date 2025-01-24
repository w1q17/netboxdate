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
    const currentDate = vm.date_expiry || '-';
    
    tr.innerHTML = `
        <td>${vm.id}</td>
        <td>${vm.name}</td>
        <td>
            <div class="date-display">
                <button class="edit-date-btn" type="button">
                    <i class="fas fa-calendar-alt"></i>
                </button>
                <span class="date-text">${currentDate}</span>
                <input type="date" class="date-input" value="${vm.date_expiry || ''}" 
                       style="display: none;">
            </div>
        </td>
        <td>
            <button class="btn btn-update" style="display: none;">
                <i class="fas fa-save"></i>
            </button>
        </td>
    `;
    
    // Добавляем обработчики событий после создания элементов
    const editBtn = tr.querySelector('.edit-date-btn');
    const dateInput = tr.querySelector('.date-input');
    const dateText = tr.querySelector('.date-text');
    const saveBtn = tr.querySelector('.btn-update');
    
    editBtn.addEventListener('click', () => {
        if (dateInput.style.display === 'none') {
            dateInput.style.display = 'inline-block';
            dateText.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        } else {
            dateInput.style.display = 'none';
            dateText.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        }
    });
    
    saveBtn.addEventListener('click', () => {
        const newDate = dateInput.value;
        
        if (!newDate) {
            showNotification('Выберите дату', 'error');
            return;
        }
        
        fetch(`/api/vms/${vm.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date_expiry: newDate
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            dateText.textContent = newDate || '-';
            dateInput.style.display = 'none';
            dateText.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            showNotification('Дата обновлена', 'success');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showNotification('Ошибка обновления', 'error');
        });
    });
    
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

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
} 