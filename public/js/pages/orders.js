const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const user = Auth.getUser();
    const orders = ref([]);
    const loading = ref(true);
    const filter = ref('all');

    const tabs = [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待付款' },
      { value: 'paid', label: '已付款' },
      { value: 'failed', label: '付款失敗' },
    ];

    const filteredOrders = computed(function () {
      if (filter.value === 'all') return orders.value;
      return orders.value.filter(function (o) { return o.status === filter.value; });
    });

    const statusMap = {
      pending: { label: '待付款', cls: 'bg-driedrose/10 text-driedrose' },
      paid: { label: '已付款', cls: 'bg-moss/10 text-moss' },
      failed: { label: '付款失敗', cls: 'bg-porcelain text-muted' },
    };

    onMounted(async function () {
      try {
        const res = await apiFetch('/api/orders');
        orders.value = res.data.orders;
      } catch (e) {
        orders.value = [];
      } finally {
        loading.value = false;
      }
    });

    return { user, orders, loading, statusMap, filter, tabs, filteredOrders, formatDate };
  }
}).mount('#app');
