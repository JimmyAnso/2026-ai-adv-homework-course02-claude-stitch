document.addEventListener('DOMContentLoaded', function () {
  const authNav = document.getElementById('auth-nav');
  const cartBadge = document.getElementById('cart-badge');
  const ordersLink = document.getElementById('orders-link');

  if (authNav) {
    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      const name = document.createElement('span');
      name.className = 'hidden sm:inline text-ink';
      name.textContent = user?.name || '';
      authNav.innerHTML = '';
      if (Auth.isAdmin()) {
        authNav.insertAdjacentHTML('beforeend', '<a href="/admin/products" class="hidden sm:inline hover:text-driedrose transition-colors">後台管理</a>');
      }
      authNav.appendChild(name);
      authNav.insertAdjacentHTML('beforeend', '<button type="button" onclick="Auth.logout()" class="text-muted hover:text-driedrose transition-colors cursor-pointer">登出</button>');
    }
  }

  if (ordersLink) {
    ordersLink.style.display = Auth.isLoggedIn() ? '' : 'none';
  }

  if (cartBadge) {
    apiFetch('/api/cart').then(function (res) {
      if (res && res.data && res.data.items && res.data.items.length > 0) {
        cartBadge.textContent = res.data.items.length;
        cartBadge.style.display = 'flex';
      }
    }).catch(function () {});
  }
});
