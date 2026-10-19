const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    if (!Auth.requireAuth()) return {};

    const el = document.getElementById('app');
    const orderId = el.dataset.orderId;
    const paymentResult = ref(el.dataset.paymentResult || null);

    const order = ref(null);
    const loading = ref(true);
    const paying = ref(false);

    const statusMap = {
      pending: { label: '待付款', cls: 'bg-driedrose/10 text-driedrose' },
      paid: { label: '已付款', cls: 'bg-moss/10 text-moss' },
      failed: { label: '付款失敗', cls: 'bg-porcelain text-muted' },
    };

    const paymentMessages = {
      success: { text: '付款成功，感謝你的購買。', cls: 'bg-moss text-white' },
      failed: { text: '付款失敗，請重新前往付款。', cls: 'bg-driedrose text-white' },
      cancel: { text: '付款已取消。', cls: 'bg-porcelain text-aubergine' },
      pending: { text: '付款處理中，請點「查詢付款狀態」確認結果。', cls: 'bg-porcelain text-aubergine' },
    };

    const bannerTitle = computed(function () {
      if (!order.value) return '';
      if (order.value.status === 'paid') return '付款完成，花藝師已開始準備你的花禮';
      if (order.value.status === 'failed') return '這筆訂單付款未成功';
      return '訂單已成立，付款後即開始製作';
    });

    const steps = computed(function () {
      const status = order.value && order.value.status;
      if (status === 'paid') {
        return [
          { label: '訂單成立', state: 'done' },
          { label: '付款完成', state: 'done' },
          { label: '花藝師製作', state: 'current' },
          { label: '配送', state: 'todo' },
        ];
      }
      return [
        { label: '訂單成立', state: 'done' },
        { label: status === 'failed' ? '付款失敗' : '等待付款', state: status === 'failed' ? 'failed' : 'current' },
        { label: '花藝師製作', state: 'todo' },
        { label: '配送', state: 'todo' },
      ];
    });

    async function checkPayment() {
      if (!order.value || paying.value) return;
      paying.value = true;
      try {
        const res = await apiFetch('/api/orders/' + order.value.id + '/check-payment', {
          method: 'POST'
        });
        order.value = res.data;
        if (res.data.status === 'paid') {
          paymentResult.value = 'success';
        } else {
          Notification.show(res.message || '尚未完成付款，請稍後再查詢', 'info');
        }
      } catch (e) {
        Notification.show(e?.data?.message || '查詢付款狀態失敗', 'error');
      } finally {
        paying.value = false;
      }
    }

    onMounted(async function () {
      try {
        const res = await apiFetch('/api/orders/' + orderId);
        order.value = res.data;

        if (paymentResult.value === 'pending' && order.value.status === 'pending') {
          await checkPayment();
        }
      } catch (e) {
        Notification.show('載入訂單失敗', 'error');
      } finally {
        loading.value = false;
      }
    });

    return { order, loading, paying, paymentResult, statusMap, paymentMessages, bannerTitle, steps, checkPayment, formatDateTime };
  }
}).mount('#app');
