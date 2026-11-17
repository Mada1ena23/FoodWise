// Registar o Service Worker para suporte PWA.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const workerPath = window.location.pathname.includes('/pages/') ? '../sw.js' : './sw.js';
    navigator.serviceWorker.register(workerPath)
      .then((registration) => {
        console.log('Service Worker registado com sucesso:', registration.scope);
      })
      .catch((error) => {
        console.error('Falha ao registar o Service Worker:', error);
      });
  });
}

(() => {
  const pageTitles = {
    'setup-family': 'Configurar família',
    dashboard: 'Menu principal',
    inventory: 'Inventário',
    alerts: 'Alertas de validade',
    recipes: 'Receitas',
    'meal-plan': 'Planeamento de refeições',
    'shopping-list': 'Lista de compras',
    'family-management': 'Gestão familiar'
  };
  const navigation = [
    ['dashboard', 'Menu', 'dashboard.html', '⌂'],
    ['inventory', 'Inventário', 'inventory.html', '▦'],
    ['alerts', 'Alertas', 'alerts.html', '!'],
    ['recipes', 'Receitas', 'recipes.html', '♡'],
    ['meal-plan', 'Refeições', 'meal-plan.html', '▤'],
    ['shopping-list', 'Compras', 'shopping-list.html', '＋'],
    ['family-management', 'Família', 'family-management.html', '♧']
  ];

  function getCurrentUser() {
    return window.FoodWiseDB.getCurrentUser();
  }

  function readList(name, user) {
    return window.FoodWiseDB.read(name, user, []);
  }

  function saveList(name, user, value) {
    window.FoodWiseDB.write(name, user, value);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  function formatDate(value) {
    if (!value) return 'Sem data';
    return new Date(`${value}T00:00:00`).toLocaleDateString('pt-PT');
  }

  function renderHeader(page, user) {
    const links = navigation.map(([id, label, href, icon]) => (
      `<a class="nav-link${id === page ? ' is-active' : ''}" href="${href}"${id === page ? ' aria-current="page"' : ''}><span aria-hidden="true">${icon}</span>${label}</a>`
    )).join('');
    return `<header class="app-header">
      <a class="brand" href="dashboard.html" aria-label="FoodWise, menu principal"><span class="brand-mark">f</span><span>foodwise</span></a>
      <nav class="main-nav" aria-label="Navegação principal">${links}</nav>
      <div class="account-area"><span class="user-avatar" aria-hidden="true">${escapeHTML(user.name.charAt(0).toUpperCase())}</span><span class="user-name">${escapeHTML(user.name)}</span><button class="logout-button" type="button" data-action="logout">Terminar sessão</button></div>
    </header>`;
  }

  function pageFrame(page, eyebrow, title, description, content) {
    return `<section class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-description">${description}</p></div></section>${content}`;
  }

  function renderDashboard(user) {
    const inventory = window.FoodWiseInventory.getAll(user);
    const shopping = window.FoodWiseShopping.getAll(user);
    const expiring = window.FoodWiseInventory.expiring(user);
    const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    const cards = [
      ['inventory', 'Inventário', 'Acompanha o que tens em casa.', '▦', inventory.length, 'itens registados'],
      ['alerts', 'Alertas', 'Não deixes nada passar do prazo.', '!', expiring.length, 'a vencer em breve'],
      ['recipes', 'Receitas', 'Ideias para aproveitar os ingredientes.', '♡', window.FoodWiseRecipes.getAll().length, 'receitas para explorar'],
      ['meal-plan', 'Refeições', 'Organiza as refeições da semana.', '▤', '7', 'dias para planear'],
      ['shopping-list', 'Lista de compras', 'Leva só o que realmente precisas.', '＋', shopping.filter((item) => !item.done).length, 'itens por comprar'],
      ['family-management', 'Gestão familiar', 'Partilha a organização da casa.', '♧', (window.FoodWiseFamily.get(user)?.members || []).length, 'membros da família']
    ];
    const cardHTML = cards.map(([id, title, desc, icon, count, label]) => {
      const link = navigation.find((item) => item[0] === id)[2];
      return `<a class="feature-card" href="${link}"><span class="feature-icon">${icon}</span><span class="feature-count">${count}</span><span class="feature-title">${title}</span><span class="feature-description">${desc}</span><span class="feature-meta">${label} <span aria-hidden="true">→</span></span></a>`;
    }).join('');
    return `<section class="welcome-banner"><div><p class="eyebrow">${today}</p><h1>Olá, ${escapeHTML(user.name.split(' ')[0])} 👋</h1><p>Uma cozinha mais organizada começa com pequenas escolhas.</p><a class="button button-light" href="inventory.html">Ver inventário <span aria-hidden="true">→</span></a></div><div class="welcome-art" aria-hidden="true"><span>🥬</span><span>🍅</span><span>🥑</span></div></section>
      <section class="section-block"><div class="section-title"><div><p class="eyebrow">A tua casa</p><h2>O que precisas hoje?</h2></div></div><div class="feature-grid">${cardHTML}</div></section>
      <section class="tip-banner"><span class="tip-icon">✦</span><p><strong>Dica FoodWise</strong><br>Planeia as refeições antes de fazer compras para evitar desperdício.</p><a href="meal-plan.html">Planear refeições <span aria-hidden="true">→</span></a></section>`;
  }

  function renderSetupFamily(user) {
    return pageFrame('PRIMEIRO PASSO', 'Configuração inicial', 'A tua casa, à tua maneira', 'Dá um nome à tua família para começares a organizar as refeições e os alimentos.', `<form id="setupFamilyForm" class="form-card narrow-card">
      <label for="familyName">Nome da família</label><input id="familyName" name="familyName" type="text" placeholder="Ex.: Família Silva" required maxlength="60">
      <label for="memberCount">Quantas pessoas fazem parte?</label><select id="memberCount" name="memberCount"><option value="1">Só eu</option><option value="2">2 pessoas</option><option value="3">3 pessoas</option><option value="4">4 pessoas</option><option value="5">5 ou mais pessoas</option></select>
      <p class="form-message" aria-live="polite"></p><button class="button button-primary" type="submit">Guardar e continuar <span aria-hidden="true">→</span></button>
    </form>`);
  }

  function renderInventory(user) {
    const items = window.FoodWiseInventory.getAll(user);
    const rows = items.length ? items.map((item) => {
      const remaining = item.expiry ? window.FoodWiseInventory.daysUntil(item.expiry) : null;
      const status = remaining === null ? 'Sem validade' : remaining < 0 ? 'Expirado' : remaining === 0 ? 'Expira hoje' : `Validade ${formatDate(item.expiry)}`;
      const statusClass = remaining !== null && remaining <= 3 ? 'status-warning' : 'status-neutral';
      return `<article class="list-row"><span class="food-emoji">${escapeHTML(item.emoji || '🥫')}</span><div class="row-main"><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.quantity)} ${escapeHTML(item.unit)}</span></div><span class="status-pill ${statusClass}">${status}</span><button class="icon-button" type="button" aria-label="Remover ${escapeHTML(item.name)}" data-action="remove-inventory" data-id="${item.id}">×</button></article>`;
    }).join('') : '<div class="empty-state"><span>🥬</span><h3>O teu inventário está vazio</h3><p>Adiciona os alimentos que tens em casa para começares a acompanhar as validades.</p></div>';
    return pageFrame('A TUA COZINHA', 'Organização', 'Inventário', 'Regista os alimentos que tens em casa e acompanha as respetivas validades.', `<div class="content-columns"><form id="inventoryForm" class="form-card"><div class="card-heading"><span class="feature-icon">＋</span><div><h2>Adicionar alimento</h2><p>Regista um novo produto.</p></div></div>
      <label for="foodName">Alimento</label><input id="foodName" name="name" type="text" placeholder="Ex.: Leite" required maxlength="60">
      <div class="form-row"><div><label for="foodQuantity">Quantidade</label><input id="foodQuantity" name="quantity" type="number" min="0.1" step="0.1" value="1" required></div><div><label for="foodUnit">Unidade</label><select id="foodUnit" name="unit"><option>unidade(s)</option><option>kg</option><option>g</option><option>L</option><option>ml</option><option>embalagem(ns)</option></select></div></div>
      <label for="foodExpiry">Data de validade <span class="label-optional">(opcional)</span></label><input id="foodExpiry" name="expiry" type="date">
      <p class="form-message" aria-live="polite"></p><button class="button button-primary" type="submit">Adicionar ao inventário</button></form>
      <section class="list-card"><div class="card-heading"><div><h2>Em casa <span class="count-badge">${items.length}</span></h2><p>Os teus alimentos registados.</p></div></div><div class="list-rows">${rows}</div></section></div>`);
  }

  function renderAlerts(user) {
    const sorted = window.FoodWiseInventory.expiring(user);
    const rows = sorted.length ? sorted.map((item) => {
      const days = window.FoodWiseInventory.daysUntil(item.expiry);
      const message = days < 0 ? `Expirou há ${Math.abs(days)} dia(s)` : days === 0 ? 'Expira hoje' : days === 1 ? 'Expira amanhã' : `Expira dentro de ${days} dias`;
      return `<article class="alert-row"><span class="alert-icon">${days < 0 ? '!' : '◷'}</span><div class="row-main"><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.quantity)} ${escapeHTML(item.unit)} · ${formatDate(item.expiry)}</span></div><span class="status-pill ${days <= 2 ? 'status-warning' : 'status-neutral'}">${message}</span></article>`;
    }).join('') : '<div class="empty-state"><span>✨</span><h3>Tudo em dia!</h3><p>Não há alimentos a expirar nos próximos 7 dias.</p><a class="text-link" href="inventory.html">Ver inventário →</a></div>';
    return pageFrame('CUIDA DOS ALIMENTOS', 'Validades', 'Alertas', 'Consulta os alimentos que já expiraram ou estão prestes a expirar.', `<div class="notice-card"><span>💡</span><p>Usa primeiro os alimentos com validade mais próxima. Assim aproveitas melhor o que já tens.</p></div><section class="list-card"><div class="card-heading"><div><h2>Validade próxima</h2><p>${sorted.length} ${sorted.length === 1 ? 'alimento precisa' : 'alimentos precisam'} da tua atenção.</p></div></div><div class="list-rows">${rows}</div></section>`);
  }

  function renderRecipes() {
    const recipes = window.FoodWiseRecipes.getAll();
    const cards = recipes.map((recipe, index) => `<article class="recipe-card"><div class="recipe-art">${recipe.emoji}<span>${recipe.time}</span></div><div class="recipe-body"><div class="recipe-tags"><span>${recipe.type}</span><span>Anti-desperdício</span></div><h2>${recipe.name}</h2><p>${recipe.description}</p><div class="ingredient-chips">${recipe.ingredients.map((item) => `<span>${item}</span>`).join('')}</div><button class="button button-outline" type="button" data-action="add-recipe" data-index="${index}">Adicionar à lista de compras</button></div></article>`).join('');
    return pageFrame('INSPIRAÇÃO NA COZINHA', 'Ideias para hoje', 'Receitas', 'Receitas simples para aproveitar ingredientes e reduzir o desperdício.', `<div class="recipe-grid">${cards}</div>`);
  }

  function renderShopping(user) {
    const items = window.FoodWiseShopping.getAll(user);
    const pending = items.filter((item) => !item.done);
    const bought = items.filter((item) => item.done);
    function renderRows(list) {
      return list.map((item) => `<article class="shopping-row${item.done ? ' is-done' : ''}"><label class="check-label"><input type="checkbox" data-action="toggle-shopping" data-id="${item.id}"${item.done ? ' checked' : ''}><span class="custom-check" aria-hidden="true"></span><span>${escapeHTML(item.name)}</span></label><button class="icon-button" type="button" aria-label="Remover ${escapeHTML(item.name)}" data-action="remove-shopping" data-id="${item.id}">×</button></article>`).join('');
    }
    return pageFrame('COMPRAS COM INTENÇÃO', 'Lista partilhada', 'Lista de compras', 'Organiza o que falta comprar e marca os produtos à medida que os encontras.', `<form id="shoppingForm" class="inline-form"><label class="sr-only" for="shoppingName">Novo produto</label><input id="shoppingName" name="name" type="text" placeholder="O que precisas de comprar?" required maxlength="60"><button class="button button-primary" type="submit">＋ Adicionar</button></form><div class="content-columns shopping-columns"><section class="list-card"><div class="card-heading"><div><h2>Por comprar <span class="count-badge">${pending.length}</span></h2><p>Não te esqueças destes produtos.</p></div></div><div class="list-rows">${pending.length ? renderRows(pending) : '<div class="empty-inline">A lista está em dia. Adiciona o que te faz falta.</div>'}</div></section><section class="list-card bought-card"><div class="card-heading"><div><h2>Já no carrinho <span class="count-badge">${bought.length}</span></h2><p>Produtos marcados como comprados.</p></div></div><div class="list-rows">${bought.length ? renderRows(bought) : '<div class="empty-inline">Os produtos comprados aparecem aqui.</div>'}</div></section></div>`);
  }

  function renderMealPlan(user) {
    const meals = readList('meals', user).sort((a, b) => a.date.localeCompare(b.date));
    const options = ['Pequeno-almoço', 'Almoço', 'Jantar', 'Lanche'];
    const rows = meals.length ? meals.map((meal) => `<article class="meal-row"><span class="meal-date"><strong>${new Date(`${meal.date}T00:00:00`).toLocaleDateString('pt-PT', { day: '2-digit' })}</strong><span>${new Date(`${meal.date}T00:00:00`).toLocaleDateString('pt-PT', { month: 'short' })}</span></span><div class="row-main"><span class="meal-kind">${escapeHTML(meal.type)}</span><strong>${escapeHTML(meal.name)}</strong></div><button class="icon-button" type="button" aria-label="Remover ${escapeHTML(meal.name)}" data-action="remove-meal" data-id="${meal.id}">×</button></article>`).join('') : '<div class="empty-state"><span>📅</span><h3>A semana ainda está em aberto</h3><p>Adiciona a primeira refeição e começa a planear.</p></div>';
    return pageFrame('PLANEIA COM ANTECEDÊNCIA', 'A tua semana', 'Planeamento de refeições', 'Define as refeições com antecedência e aproveita melhor os alimentos que já tens.', `<div class="content-columns"><form id="mealForm" class="form-card"><div class="card-heading"><span class="feature-icon">▤</span><div><h2>Planear refeição</h2><p>Adiciona uma refeição ao teu plano.</p></div></div><label for="mealName">Nome da refeição</label><input id="mealName" name="name" type="text" placeholder="Ex.: Sopa de legumes" required maxlength="80"><label for="mealType">Tipo de refeição</label><select id="mealType" name="type">${options.map((option) => `<option>${option}</option>`).join('')}</select><label for="mealDate">Dia</label><input id="mealDate" name="date" type="date" required><p class="form-message" aria-live="polite"></p><button class="button button-primary" type="submit">Guardar no plano</button></form><section class="list-card"><div class="card-heading"><div><h2>Próximas refeições <span class="count-badge">${meals.length}</span></h2><p>O teu plano organizado por dia.</p></div></div><div class="list-rows">${rows}</div></section></div>`);
  }

  function renderFamily(user) {
    const family = window.FoodWiseFamily.get(user) || { name: 'A minha família', members: [{ id: user.id, name: user.name, role: 'Administrador' }] };
    const members = family.members.map((member) => `<article class="member-row"><span class="user-avatar">${escapeHTML(member.name.charAt(0).toUpperCase())}</span><div class="row-main"><strong>${escapeHTML(member.name)}</strong><span>${escapeHTML(member.role)}</span></div>${member.id === user.id ? '<span class="you-badge">Tu</span>' : `<button class="icon-button" type="button" aria-label="Remover ${escapeHTML(member.name)}" data-action="remove-member" data-id="${member.id}">×</button>`}</article>`).join('');
    return pageFrame('A TUA CASA', 'Em conjunto', 'Gestão familiar', `Organiza a casa com ${escapeHTML(family.name)} e mantém todos a par.`, `<div class="content-columns"><form id="memberForm" class="form-card"><div class="card-heading"><span class="feature-icon">♧</span><div><h2>Adicionar membro</h2><p>Regista quem partilha esta casa.</p></div></div><label for="memberName">Nome</label><input id="memberName" name="name" type="text" placeholder="Nome do membro" required maxlength="60"><label for="memberRole">Relação com a família</label><select id="memberRole" name="role"><option>Familiar</option><option>Companheiro(a)</option><option>Filho(a)</option><option>Outro</option></select><p class="form-message" aria-live="polite"></p><button class="button button-primary" type="submit">Adicionar membro</button></form><section class="list-card"><div class="card-heading"><div><h2>${escapeHTML(family.name)} <span class="count-badge">${family.members.length}</span></h2><p>Membros da família.</p></div></div><div class="list-rows">${members}</div></section></div>`);
  }

  function showFormMessage(form, message, type) {
    const output = form.querySelector('.form-message');
    if (output) {
      output.textContent = message;
      output.className = `form-message ${type}`;
    }
  }

  function handleSubmit(event, page, user) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    const values = new FormData(form);

    if (form.id === 'setupFamilyForm') {
      const familyName = String(values.get('familyName') || '').trim();
      if (!familyName) {
        showFormMessage(form, 'Escreve um nome para a família.', 'error');
        return;
      }
      const count = Number(values.get('memberCount'));
      window.FoodWiseFamily.create(user, familyName, count);
      window.location.href = 'dashboard.html';
      return;
    }

    if (form.id === 'inventoryForm') {
      const name = String(values.get('name') || '').trim();
      const quantity = Number(values.get('quantity'));
      if (!name || !Number.isFinite(quantity) || quantity <= 0) {
        showFormMessage(form, 'Indica um alimento e uma quantidade válida.', 'error');
        return;
      }
      window.FoodWiseInventory.add(user, {
        name,
        quantity,
        unit: values.get('unit'),
        expiry: values.get('expiry') || '',
        emoji: '🥫'
      });
      render(page, user);
      return;
    }

    if (form.id === 'shoppingForm') {
      const name = String(values.get('name') || '').trim();
      if (!name) return;
      window.FoodWiseShopping.add(user, name);
      render(page, user);
      return;
    }

    if (form.id === 'mealForm') {
      const name = String(values.get('name') || '').trim();
      const date = String(values.get('date') || '');
      if (!name || !date) {
        showFormMessage(form, 'Preenche o nome e o dia da refeição.', 'error');
        return;
      }
      const meals = readList('meals', user);
      meals.push({ id: window.FoodWiseDB.createId(), name, type: values.get('type'), date });
      saveList('meals', user, meals);
      render(page, user);
      return;
    }

    if (form.id === 'memberForm') {
      const name = String(values.get('name') || '').trim();
      if (!name) return;
      window.FoodWiseFamily.addMember(user, name, values.get('role'));
      render(page, user);
    }
  }

  function handleAction(event, page, user) {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    const action = control.dataset.action;

    if (action === 'logout') {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = '../index.html';
      return;
    }

    if (action === 'add-recipe') {
      const recipe = window.FoodWiseRecipes.get(Number(control.dataset.index));
      if (!recipe) return;
      window.FoodWiseShopping.addMany(user, recipe.ingredients);
      control.textContent = 'Ingredientes adicionados ✓';
      control.classList.add('is-confirmed');
      control.disabled = true;
      return;
    }

    if (action === 'remove-inventory') {
      window.FoodWiseInventory.remove(user, control.dataset.id);
    } else if (action === 'toggle-shopping') {
      window.FoodWiseShopping.setDone(user, control.dataset.id, control.checked);
    } else if (action === 'remove-shopping') {
      window.FoodWiseShopping.remove(user, control.dataset.id);
    } else if (action === 'remove-meal') {
      saveList('meals', user, readList('meals', user).filter((item) => item.id !== control.dataset.id));
    } else if (action === 'remove-member') {
      window.FoodWiseFamily.removeMember(user, control.dataset.id);
    } else {
      return;
    }
    render(page, user);
  }

  function render(page, user) {
    const content = document.getElementById('app-content');
    if (!content) return;
    const family = window.FoodWiseFamily.get(user);
    if (page === 'dashboard' && !family) {
      window.location.href = 'setup-family.html';
      return;
    }

    const renderers = {
      'setup-family': () => renderSetupFamily(user),
      dashboard: () => renderDashboard(user),
      inventory: () => renderInventory(user),
      alerts: () => renderAlerts(user),
      recipes: renderRecipes,
      'meal-plan': () => renderMealPlan(user),
      'shopping-list': () => renderShopping(user),
      'family-management': () => renderFamily(user)
    };
    document.title = `FoodWise - ${pageTitles[page]}`;
    content.innerHTML = renderers[page]();
    content.onsubmit = (event) => handleSubmit(event, page, user);
    content.onclick = (event) => {
      if (!event.target.closest('[data-action="toggle-shopping"]')) handleAction(event, page, user);
    };
    content.onchange = (event) => {
      if (event.target.matches('[data-action="toggle-shopping"]')) handleAction(event, page, user);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (!pageTitles[page]) return;
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    document.body.classList.add('app-page');
    document.body.insertAdjacentHTML('afterbegin', renderHeader(page, user));
    document.body.insertAdjacentHTML('beforeend', '<main id="app-content" class="app-content"></main>');
    document.querySelector('.app-header').onclick = (event) => handleAction(event, page, user);

    if (page === 'setup-family' && window.FoodWiseFamily.get(user)) {
      window.location.href = 'dashboard.html';
      return;
    }
    render(page, user);
  });
})();
