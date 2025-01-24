document.addEventListener('DOMContentLoaded', function() {
    loadVMs();
});

function loadVMs() {
    fetch('/api/vms')
        .then(response => response.json())
        .then(vms => {
            const vmList = document.getElementById('vm-list');
            vmList.innerHTML = '';
            
            vms.forEach(vm => {
                const vmCard = createVMCard(vm);
                vmList.appendChild(vmCard);
            });
        })
        .catch(error => console.error('Ошибка:', error));
}

function createVMCard(vm) {
    const div = document.createElement('div');
    div.className = 'vm-card';
    
    const currentDate = vm.date_expiry || '';
    
    div.innerHTML = `
        <h3>${vm.name}</h3>
        <div>
            <input type="date" class="date-input" value="${currentDate}" id="date-${vm.id}">
            <button class="update-btn" onclick="updateDate(${vm.id})">Обновить дату</button>
        </div>
    `;
    
    return div;
}

function updateDate(vmId) {
    const newDate = document.getElementById(`date-${vmId}`).value;
    
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
        alert('Дата успешно обновлена');
        loadVMs();
    })
    .catch(error => console.error('Ошибка:', error));
} 