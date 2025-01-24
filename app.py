from flask import Flask, request, jsonify, render_template
import pynetbox
import os
from datetime import datetime
import logging
from config import NETBOX_CONFIG
import urllib3

# Отключаем предупреждения о небезопасном SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Инициализация подключения к Netbox
NETBOX_URL = NETBOX_CONFIG['URL']
NETBOX_TOKEN = NETBOX_CONFIG['TOKEN']

try:
    nb = pynetbox.api(
        NETBOX_URL,
        token=NETBOX_TOKEN,
        verify=False  # Отключаем проверку SSL сертификата
    )
    # Проверка подключения
    nb.status()
    logger.info(f"✅ Успешное подключение к Netbox по адресу: {NETBOX_URL}")
except Exception as e:
    logger.error(f"❌ Ошибка подключения к Netbox: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/vms', methods=['GET'])
def get_vms():
    try:
        logger.info("📥 Получение списка виртуальных машин...")
        vms = nb.virtualization.virtual_machines.all()
        vm_list = []
        for vm in vms:
            vm_data = {
                'id': vm.id,
                'name': vm.name,
                'date_expiry': vm.custom_fields.get('date_expiry', '')
            }
            vm_list.append(vm_data)
        logger.info(f"✅ Успешно получено {len(vm_list)} виртуальных машин")
        return jsonify(vm_list)
    except Exception as e:
        logger.error(f"❌ Ошибка при получении списка VM: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/vms/<int:vm_id>', methods=['PUT'])
def update_vm_date(vm_id):
    try:
        data = request.json
        new_date = data.get('date_expiry')
        logger.info(f"📝 Обновление даты для VM ID {vm_id} на {new_date}")
        
        vm = nb.virtualization.virtual_machines.get(vm_id)
        vm.custom_fields['date_expiry'] = new_date
        vm.save()
        
        logger.info(f"✅ Дата успешно обновлена для VM ID {vm_id}")
        return jsonify({'message': 'Date updated successfully'})
    except Exception as e:
        logger.error(f"❌ Ошибка при обновлении даты для VM ID {vm_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Запуск сервера...")
    app.run(debug=True, port=8000) 