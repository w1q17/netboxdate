from flask import Flask, request, jsonify
import pynetbox
import os
from datetime import datetime

app = Flask(__name__)

# Инициализация подключения к Netbox
NETBOX_URL = "http://your-netbox-url"
NETBOX_TOKEN = "your-token"

nb = pynetbox.api(
    NETBOX_URL,
    token=NETBOX_TOKEN
)

@app.route('/api/vms', methods=['GET'])
def get_vms():
    try:
        vms = nb.virtualization.virtual_machines.all()
        vm_list = []
        for vm in vms:
            vm_data = {
                'id': vm.id,
                'name': vm.name,
                'date_expiry': vm.custom_fields.get('date_expiry', '')
            }
            vm_list.append(vm_data)
        return jsonify(vm_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vms/<int:vm_id>', methods=['PUT'])
def update_vm_date(vm_id):
    try:
        data = request.json
        new_date = data.get('date_expiry')
        
        vm = nb.virtualization.virtual_machines.get(vm_id)
        vm.custom_fields['date_expiry'] = new_date
        vm.save()
        
        return jsonify({'message': 'Date updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 