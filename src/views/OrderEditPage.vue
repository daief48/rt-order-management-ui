<template>
  <div class="container py-4">
    <h3>Edit Order #{{ id }}</h3>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <div class="card p-3">
        <form @submit.prevent="updateOrder">
          <div class="row g-2 mb-3">
            <div class="col-md-3">
              <label class="form-label">Invoice Number</label>
              <input v-model="invoice" class="form-control" disabled />
            </div>
            <div class="col-md-3">
              <label class="form-label">Customer Name</label>
              <input v-model="customerName" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select v-model="status" class="form-select">
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Add Product</label>
              <ProductAutocomplete @selected="onProductSelected" />
            </div>
          </div>

          <div class="mt-3">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Sub Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, idx) in lines" :key="line.stock_id + '-' + idx">
                  <td>{{ line.name }}</td>
                  <td>{{ line.available }}</td>
                  <td>{{ line.price }}</td>
                  <td>
                    <input
                      type="number"
                      v-model.number="line.quantity"
                      min="1"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>{{ line.price * line.quantity }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" @click.prevent="removeLine(idx)">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="d-flex justify-content-between align-items-center mt-2">
              <div><strong>Total: </strong> {{ total }}</div>
              <div><button class="btn btn-primary" type="submit">Update Order</button></div>
            </div>

            <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import ProductAutocomplete from "../components/ProductAutocomplete.vue";
import orderService from "../services/orderService";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "OrderEditPage",
  components: { ProductAutocomplete },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const id = route.params.id;

    const invoice = ref("");
    const customerName = ref("");
    const status = ref("Pending"); // NEW: reactive status
    const lines = ref([]);
    const loading = ref(false);
    const error = ref(null);

    onMounted(async () => {
      loading.value = true;
      try {
        const res = await orderService.fetchOrders({ page: 1, per_page: 1000 });
        const found = res.data.data.find((o) => o.id.toString() === id.toString());
        if (!found) {
          error.value = "Order not found";
          return;
        }

        invoice.value = found.invoice_number;
        customerName.value = found.customer_name;
        status.value = found.status; // NEW: set initial status

        lines.value = (found.order_products || []).map((op) => ({
          product_id: op.product_id,
          stock_id: op.stock_id,
          name: op.product?.name || `Product ${op.product_id}`,
          available: 9999,
          price: op.sale_price,
          quantity: Math.round(op.sub_total / op.sale_price),
        }));
      } catch (e) {
        error.value = "Failed to load order";
      } finally {
        loading.value = false;
      }
    });

    function onProductSelected(product) {
      const firstStock = product.stocks && product.stocks.length ? product.stocks[0] : null;
      if (!firstStock) return;
      lines.value.push({
        product_id: product.id,
        stock_id: firstStock.id,
        name: product.name,
        available: firstStock.quantity,
        price: firstStock.sale_price,
        quantity: 1,
      });
    }

    function removeLine(i) {
      lines.value.splice(i, 1);
    }

    const total = computed(() => lines.value.reduce((s, l) => s + l.price * l.quantity, 0));

    async function updateOrder() {
      try {
        const payload = {
          customer_name: customerName.value,
          status: status.value, // NEW: send updated status
          products: lines.value.map((l) => ({ stock_id: l.stock_id, quantity: l.quantity })),
        };
        await orderService.updateOrder(id, payload);
        router.push("/orders");
      } catch (e) {
        console.error(e);
        error.value = "Update failed";
      }
    }

    return { id, invoice, customerName, status, lines, total, onProductSelected, removeLine, updateOrder, loading, error };
  },
};
</script>
