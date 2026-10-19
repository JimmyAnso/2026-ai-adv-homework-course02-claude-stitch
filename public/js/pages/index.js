const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const products = ref([]);
    const pagination = ref({ total: 0, page: 1, limit: 8, totalPages: 0 });
    const loading = ref(true);
    const newsletterEmail = ref('');

    const subscriptionProduct = computed(function () {
      return products.value.find(function (p) { return p.name.includes('訂閱'); }) || null;
    });

    async function loadProducts(page) {
      page = page || 1;
      loading.value = true;
      try {
        const res = await apiFetch('/api/products?page=' + page + '&limit=8');
        products.value = res.data.products.map(function (p) {
          p._adding = false;
          return p;
        });
        pagination.value = res.data.pagination;
      } catch (e) {
        products.value = [];
      } finally {
        loading.value = false;
      }
    }

    function subscribeNewsletter() {
      // 電子報尚無後端 API，先提示使用者
      Notification.show('電子報即將開放訂閱，敬請期待', 'info');
      newsletterEmail.value = '';
    }

    async function addToCart(product) {
      if (product._adding) return;
      product._adding = true;
      try {
        await apiFetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity: 1 })
        });
        Notification.show('已加入購物車', 'success');
        // Update cart badge
        var badge = document.getElementById('cart-badge');
        if (badge) {
          var count = parseInt(badge.textContent || '0') + 1;
          badge.textContent = count;
          badge.style.display = 'flex';
        }
      } catch (e) {
        Notification.show('加入購物車失敗', 'error');
      } finally {
        product._adding = false;
      }
    }

    onMounted(function () {
      loadProducts(1);
    });

    return {
      products, pagination, loading, newsletterEmail, subscriptionProduct,
      loadProducts, addToCart, subscribeNewsletter
    };
  }
}).mount('#app');
