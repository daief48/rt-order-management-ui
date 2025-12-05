<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Billing</h3>
            <router-link to="/orders" class="btn btn-outline-secondary">
                View Orders
            </router-link>
        </div>

        <div class="card p-3 mb-3">
            <form @submit.prevent="submitOrder">
                <div class="row g-2">
                    <div class="col-md-4">
                        <label class="form-label">Invoice Number</label>
                        <input v-model="invoice" class="form-control" required />
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Customer Name</label>
                        <input v-model="customerName" class="form-control" required />
                    </div>

                    <div class="col-md-4">
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
                            <tr v-for="(line, idx) in lines" :key="idx">
                                <td>{{ line.name }}</td>
                                <td>{{ line.available }}</td>
                                <td>{{ line.price }}</td>

                                <td>
                                    <input type="number" v-model.number="line.quantity" min="1" :max="line.available"
                                        class="form-control form-control-sm" />
                                </td>

                                <td>{{ line.price * line.quantity }}</td>

                                <td>
                                    <button class="btn btn-sm btn-danger" @click.prevent="removeLine(idx)">
                                        Remove
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="!lines.length">
                                <td colspan="6" class="text-center">
                                    No products added
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <strong>Total:</strong> {{ total }}

                        <button class="btn btn-success" type="submit" :disabled="submitting || !lines.length">
                            Create Order
                        </button>
                    </div>
                </div>
            </form>

            <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
            <div v-if="success" class="alert alert-success mt-2">{{ success }}</div>
        </div>
    </div>
</template>

<script>
import { ref, computed } from "vue";
import ProductAutocomplete from "../components/ProductAutocomplete.vue";
import orderService from "../services/orderService";
import router from "../router";

export default {
  name: "BillingPage",
  components: { ProductAutocomplete },

  setup() {
    const invoice = ref(`INV-${Date.now()}`);
    const customerName = ref("");
    const lines = ref([]);
    const submitting = ref(false);
    const error = ref(null);
    const success = ref(null);

    function onProductSelected(product) {
      const firstStock =
        product?.stocks && product.stocks.length ? product.stocks[0] : null;

      if (!firstStock) {
        error.value = "Selected product has no stock";
        return;
      }

      const exists = lines.value.find((l) => l.stock_id === firstStock.id);
      if (exists) {
        error.value = "Product already added";
        return;
      }

      lines.value.push({
        product_id: product.id,
        stock_id: firstStock.id,
        name: product.name,
        available: firstStock.quantity,
        price: firstStock.sale_price,
        quantity: 1,
      });

      error.value = null;
    }

    function removeLine(index) {
      lines.value.splice(index, 1);
    }

    const total = computed(() =>
      lines.value.reduce((sum, l) => sum + l.price * l.quantity, 0)
    );

    async function submitOrder() {
      submitting.value = true;
      error.value = null;
      success.value = null;

      try {
        const payload = {
          invoice_number: invoice.value,
          customer_name: customerName.value,
          products: lines.value.map((l) => ({
            stock_id: l.stock_id,
            quantity: l.quantity,
          })),
        };

        await orderService.createOrder(payload);

        success.value = "Order created successfully";
        router.push("/orders");
      } catch (e) {
        error.value =
          e.response?.data?.message ||
          e.response?.data?.error ||
          "Order creation failed";
      } finally {
        submitting.value = false;
      }
    }

    return {
      invoice,
      customerName,
      lines,
      onProductSelected,
      removeLine,
      total,
      submitOrder,
      submitting,
      error,
      success,
    };
  },
};
</script>
