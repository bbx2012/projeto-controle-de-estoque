const DB = {
    init: function() {
        if (!localStorage.getItem('saep_db')) {
            const initialData = {
                usuarios: [
                    { id_usuario: 1, nome: 'Abel', email: 'abel@empresa.com', senha: 'senha123', data_cadastro: new Date().toISOString() }
                ],
                produtos: [
                    { id_produto: 1, nome: 'Martelo de Unha 16 oz', marca: 'MASTER', modelo: 'Perfil Reto', tipo_material: 'Aço', tamanho: '16 oz', peso: 0.45, tensao_eletrica: null, estoque_atual: 15, estoque_minimo: 5, data_cadastro: new Date().toISOString() },
                    { id_produto: 2, nome: 'Furadeira Impacto', marca: 'BOSCH', modelo: 'GSB 550', tipo_material: 'Metal/Plástico', tamanho: 'Standard', peso: 1.8, tensao_eletrica: '220V', estoque_atual: 8, estoque_minimo: 3, data_cadastro: new Date().toISOString() },
                    { id_produto: 3, nome: 'Chave de Fenda', marca: 'TRAMONTINA', modelo: 'Profissional', tipo_material: 'Cromo Vanádio', tamanho: '8x150mm', peso: 0.15, tensao_eletrica: null, estoque_atual: 25, estoque_minimo: 10, data_cadastro: new Date().toISOString() }
                ],
                movimentacoes: [
                    { id_movimentacao: 1, id_produto: 1, id_usuario: 1, tipo_movimentacao: 'entrada', quantidade: 20, data_movimentacao: '2024-01-15 10:00:00', observacao: '' },
                    { id_movimentacao: 2, id_produto: 1, id_usuario: 1, tipo_movimentacao: 'saida', quantidade: 5, data_movimentacao: '2024-01-16 14:30:00', observacao: '' },
                    { id_movimentacao: 3, id_produto: 2, id_usuario: 1, tipo_movimentacao: 'entrada', quantidade: 10, data_movimentacao: '2024-01-15 11:00:00', observacao: '' }
                ]
            };
            localStorage.setItem('saep_db', JSON.stringify(initialData));
        }
        return JSON.parse(localStorage.getItem('saep_db'));
    },
    
    save: function(data) {
        localStorage.setItem('saep_db', JSON.stringify(data));
    },
    
    getData: function() {
        return JSON.parse(localStorage.getItem('saep_db'));
    }
};

const AppState = {
    currentUser: null,
    currentPage: 'main',
    editingProduct: null,
    selectedProduct: null,
    editingUser: null
};

document.addEventListener('DOMContentLoaded', function() {
    DB.init();
    setupEventListeners();
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showLogin();
    }
});

function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('nav-main').addEventListener('click', () => showPage('main'));
    document.getElementById('nav-products').addEventListener('click', () => showPage('products'));
    document.getElementById('nav-stock').addEventListener('click', () => showPage('stock'));
    document.getElementById('nav-users').addEventListener('click', () => showPage('users'));
    document.getElementById('add-product-btn').addEventListener('click', showAddProductForm);
    document.getElementById('close-product-modal').addEventListener('click', hideProductModal);
    document.getElementById('cancel-product').addEventListener('click', hideProductModal);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('search-product').addEventListener('input', filterProducts);
    document.getElementById('close-stock-modal').addEventListener('click', hideStockModal);
    document.getElementById('cancel-stock').addEventListener('click', hideStockModal);
    document.getElementById('stock-form').addEventListener('submit', handleStockMovement);
    document.getElementById('show-register').addEventListener('click', showRegister);
    document.getElementById('show-login').addEventListener('click', showLoginPage);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('add-user-btn').addEventListener('click', showAddUserForm);
    document.getElementById('close-user-modal').addEventListener('click', hideUserModal);
    document.getElementById('cancel-user').addEventListener('click', hideUserModal);
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    const data = DB.getData();
    const user = data.usuarios.find(u => u.email === email && u.senha === password);
    
    if (user) {
        AppState.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showApp();
    } else {
        errorDiv.textContent = 'Email ou senha incorretos';
        errorDiv.classList.remove('hidden');
    }
}

function handleLogout() {
    AppState.currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

function showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showLoginPage() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('register-page').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.remove('hidden');
}

function showApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('user-name').textContent = AppState.currentUser.nome;
    showPage('main');
}

function showPage(page) {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('products-page').classList.add('hidden');
    document.getElementById('stock-page').classList.add('hidden');
    document.getElementById('users-page').classList.add('hidden');
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    switch(page) {
        case 'main':
            document.getElementById('main-page').classList.remove('hidden');
            document.getElementById('nav-main').classList.add('active');
            updateStockSummary();
            break;
        case 'products':
            document.getElementById('products-page').classList.remove('hidden');
            document.getElementById('nav-products').classList.add('active');
            loadProductsTable();
            break;
        case 'stock':
            document.getElementById('stock-page').classList.remove('hidden');
            document.getElementById('nav-stock').classList.add('active');
            loadStockTable();
            checkStockAlerts();
            break;
        case 'users':
            document.getElementById('users-page').classList.remove('hidden');
            document.getElementById('nav-users').classList.add('active');
            loadUsersTable();
            break;
    }
    
    AppState.currentPage = page;
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'As senhas não coincidem';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'A senha deve ter pelo menos 6 caracteres';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    const data = DB.getData();
    
    const existingUser = data.usuarios.find(u => u.email === email);
    if (existingUser) {
        errorDiv.textContent = 'Já existe um usuário com este email';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    const newUserId = data.usuarios.length > 0 ? Math.max(...data.usuarios.map(u => u.id_usuario)) + 1 : 1;
    
    data.usuarios.push({
        id_usuario: newUserId,
        nome: name,
        email: email,
        senha: password,
        data_cadastro: new Date().toISOString()
    });
    
    DB.save(data);
    
    successDiv.textContent = 'Usuário cadastrado com sucesso! Redirecionando para login...';
    successDiv.classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('register-form').reset();
        showLoginPage();
    }, 2000);
}

function loadProductsTable(filter = '') {
    const data = DB.getData();
    const tbody = document.getElementById('products-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    let products = data.produtos;
    
    if (filter) {
        const lowerFilter = filter.toLowerCase();
        products = products.filter(p => 
            p.nome.toLowerCase().includes(lowerFilter) ||
            p.marca.toLowerCase().includes(lowerFilter) ||
            p.modelo.toLowerCase().includes(lowerFilter) ||
            p.tipo_material.toLowerCase().includes(lowerFilter)
        );
    }
    
    products.sort((a, b) => a.nome.localeCompare(b.nome));
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nome}</td>
            <td>${product.marca || '-'}</td>
            <td>${product.modelo || '-'}</td>
            <td>${product.tipo_material || '-'}</td>
            <td>${product.estoque_atual}</td>
            <td>${product.estoque_minimo}</td>
            <td class="actions">
                <button class="edit-product" data-id="${product.id_produto}">Editar</button>
                <button class="danger delete-product" data-id="${product.id_produto}">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            showEditProductForm(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

function filterProducts() {
    const filter = document.getElementById('search-product').value;
    loadProductsTable(filter);
}

function showAddProductForm() {
    AppState.editingProduct = null;
    document.getElementById('product-modal-title').textContent = 'Novo Produto';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').classList.remove('hidden');
}

function showEditProductForm(productId) {
    const data = DB.getData();
    const product = data.produtos.find(p => p.id_produto === productId);
    
    if (product) {
        AppState.editingProduct = product;
        document.getElementById('product-modal-title').textContent = 'Editar Produto';
        document.getElementById('product-id').value = product.id_produto;
        document.getElementById('product-name').value = product.nome;
        document.getElementById('product-brand').value = product.marca || '';
        document.getElementById('product-model').value = product.modelo || '';
        document.getElementById('product-material').value = product.tipo_material || '';
        document.getElementById('product-size').value = product.tamanho || '';
        document.getElementById('product-weight').value = product.peso || '';
        document.getElementById('product-voltage').value = product.tensao_eletrica || '';
        document.getElementById('product-min-stock').value = product.estoque_minimo;
        document.getElementById('product-modal').classList.remove('hidden');
    }
}

function hideProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const data = DB.getData();
    const productId = document.getElementById('product-id').value;
    const productData = {
        nome: document.getElementById('product-name').value,
        marca: document.getElementById('product-brand').value,
        modelo: document.getElementById('product-model').value,
        tipo_material: document.getElementById('product-material').value,
        tamanho: document.getElementById('product-size').value,
        peso: parseFloat(document.getElementById('product-weight').value) || 0,
        tensao_eletrica: document.getElementById('product-voltage').value,
        estoque_minimo: parseInt(document.getElementById('product-min-stock').value)
    };
    
    if (!productData.nome || productData.estoque_minimo < 0) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
    }
    
    if (productId) {
        const index = data.produtos.findIndex(p => p.id_produto === parseInt(productId));
        if (index !== -1) {
            productData.estoque_atual = data.produtos[index].estoque_atual;
            productData.data_cadastro = data.produtos[index].data_cadastro;
            data.produtos[index] = { ...data.produtos[index], ...productData };
        }
    } else {
        const newId = data.produtos.length > 0 ? Math.max(...data.produtos.map(p => p.id_produto)) + 1 : 1;
        data.produtos.push({
            id_produto: newId,
            ...productData,
            estoque_atual: 0,
            data_cadastro: new Date().toISOString()
        });
    }
    
    DB.save(data);
    hideProductModal();
    loadProductsTable();
}

function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const data = DB.getData();
        data.produtos = data.produtos.filter(p => p.id_produto !== productId);
        data.movimentacoes = data.movimentacoes.filter(m => m.id_produto !== productId);
        DB.save(data);
        loadProductsTable();
    }
}

function loadStockTable() {
    const data = DB.getData();
    const tbody = document.getElementById('stock-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    const products = [...data.produtos].sort((a, b) => a.nome.localeCompare(b.nome));
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nome}</td>
            <td>${product.marca || '-'}</td>
            <td>${product.modelo || '-'}</td>
            <td>${product.estoque_atual}</td>
            <td>${product.estoque_minimo}</td>
            <td class="actions">
                <button class="stock-movement" data-id="${product.id_produto}">Movimentar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.querySelectorAll('.stock-movement').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            showStockMovementForm(productId);
        });
    });
}

function showStockMovementForm(productId) {
    const data = DB.getData();
    const product = data.produtos.find(p => p.id_produto === productId);
    
    if (product) {
        AppState.selectedProduct = product;
        document.getElementById('stock-product-id').value = product.id_produto;
        document.getElementById('stock-modal-title').textContent = `Movimentação: ${product.nome}`;
        document.getElementById('movement-type').value = '';
        document.getElementById('movement-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('movement-quantity').value = '';
        document.getElementById('movement-observation').value = '';
        document.getElementById('stock-modal').classList.remove('hidden');
    }
}

function hideStockModal() {
    document.getElementById('stock-modal').classList.add('hidden');
}

function handleStockMovement(e) {
    e.preventDefault();
    
    const data = DB.getData();
    const productId = parseInt(document.getElementById('stock-product-id').value);
    const movementType = document.getElementById('movement-type').value;
    const movementDate = document.getElementById('movement-date').value;
    const quantity = parseInt(document.getElementById('movement-quantity').value);
    const observation = document.getElementById('movement-observation').value;
    
    if (!movementType || !movementDate || !quantity || quantity <= 0) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
    }
    
    const productIndex = data.produtos.findIndex(p => p.id_produto === productId);
    if (productIndex === -1) {
        alert('Produto não encontrado.');
        return;
    }
    
    const product = data.produtos[productIndex];
    
    if (movementType === 'saida' && product.estoque_atual < quantity) {
        alert('Estoque insuficiente para realizar esta saída.');
        return;
    }
    
    if (movementType === 'entrada') {
        product.estoque_atual += quantity;
    } else {
        product.estoque_atual -= quantity;
    }
    
    const newMovementId = data.movimentacoes.length > 0 ? 
        Math.max(...data.movimentacoes.map(m => m.id_movimentacao)) + 1 : 1;
    
    data.movimentacoes.push({
        id_movimentacao: newMovementId,
        id_produto: productId,
        id_usuario: AppState.currentUser.id_usuario,
        tipo_movimentacao: movementType,
        quantidade: quantity,
        data_movimentacao: movementDate + ' ' + new Date().toTimeString().split(' ')[0],
        observacao: observation
    });
    
    DB.save(data);
    hideStockModal();
    loadStockTable();
    
    if (movementType === 'saida') {
        checkStockAlert(product);
    }
}

function checkStockAlerts() {
    const data = DB.getData();
    const alertsDiv = document.getElementById('stock-alerts');
    alertsDiv.innerHTML = '';
    
    data.produtos.forEach(product => {
        if (product.estoque_atual < product.estoque_minimo) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning';
            alert.textContent = `ALERTA: ${product.nome} está com estoque baixo (${product.estoque_atual} unidades, mínimo: ${product.estoque_minimo})`;
            alertsDiv.appendChild(alert);
        }
    });
}

function checkStockAlert(product) {
    if (product.estoque_atual < product.estoque_minimo) {
        alert(`ALERTA: ${product.nome} está com estoque baixo (${product.estoque_atual} unidades, mínimo: ${product.estoque_minimo})`);
    }
}

function updateStockSummary() {
    const data = DB.getData();
    const summaryDiv = document.getElementById('stock-summary');
    
    const totalProducts = data.produtos.length;
    const lowStockProducts = data.produtos.filter(p => p.estoque_atual < p.estoque_minimo).length;
    const totalStockValue = data.produtos.reduce((sum, p) => sum + p.estoque_atual, 0);
    
    summaryDiv.innerHTML = `
        <p>Total de produtos cadastrados: ${totalProducts}</p>
        <p>Produtos com estoque baixo: ${lowStockProducts}</p>
        <p>Total de itens em estoque: ${totalStockValue}</p>
    `;
}

function loadUsersTable() {
    const data = DB.getData();
    const tbody = document.getElementById('users-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    data.usuarios.forEach(user => {
        const row = document.createElement('tr');
        const dataCadastro = new Date(user.data_cadastro).toLocaleDateString('pt-BR');
        
        row.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${dataCadastro}</td>
            <td class="actions">
                <button class="edit-user" data-id="${user.id_usuario}">Editar</button>
                ${user.id_usuario !== AppState.currentUser.id_usuario ? 
                  `<button class="danger delete-user" data-id="${user.id_usuario}">Excluir</button>` : 
                  '<button disabled>Excluir</button>'}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.target.getAttribute('data-id'));
            showEditUserForm(userId);
        });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.target.getAttribute('data-id'));
            deleteUser(userId);
        });
    });
}

function showAddUserForm() {
    AppState.editingUser = null;
    document.getElementById('user-modal-title').textContent = 'Novo Usuário';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal').classList.remove('hidden');
}

function showEditUserForm(userId) {
    const data = DB.getData();
    const user = data.usuarios.find(u => u.id_usuario === userId);
    
    if (user) {
        AppState.editingUser = user;
        document.getElementById('user-modal-title').textContent = 'Editar Usuário';
        document.getElementById('user-id').value = user.id_usuario;
        document.getElementById('user-name').value = user.nome;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-password').value = '';
        document.getElementById('user-confirm-password').value = '';
        document.getElementById('user-modal').classList.remove('hidden');
    }
}

function hideUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
}

function handleUserSubmit(e) {
    e.preventDefault();
    
    const data = DB.getData();
    const userId = document.getElementById('user-id').value;
    const userName = document.getElementById('user-name').value;
    const userEmail = document.getElementById('user-email').value;
    const userPassword = document.getElementById('user-password').value;
    const userConfirmPassword = document.getElementById('user-confirm-password').value;
    
    if (!userName || !userEmail) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (userPassword && userPassword !== userConfirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }
    
    if (userPassword && userPassword.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    if (userId) {
        const index = data.usuarios.findIndex(u => u.id_usuario === parseInt(userId));
        if (index !== -1) {
            data.usuarios[index].nome = userName;
            data.usuarios[index].email = userEmail;
            
            if (userPassword) {
                data.usuarios[index].senha = userPassword;
            }
        }
    } else {
        const newId = data.usuarios.length > 0 ? Math.max(...data.usuarios.map(u => u.id_usuario)) + 1 : 1;
        
        const existingUser = data.usuarios.find(u => u.email === userEmail);
        if (existingUser) {
            alert('Já existe um usuário com este email.');
            return;
        }
        
        data.usuarios.push({
            id_usuario: newId,
            nome: userName,
            email: userEmail,
            senha: userPassword,
            data_cadastro: new Date().toISOString()
        });
    }
    
    DB.save(data);
    hideUserModal();
    loadUsersTable();
}

function deleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        const data = DB.getData();
        
        if (userId === AppState.currentUser.id_usuario) {
            alert('Você não pode excluir seu próprio usuário.');
            return;
        }
        
        data.usuarios = data.usuarios.filter(u => u.id_usuario !== userId);
        DB.save(data);
        loadUsersTable();
    }
}