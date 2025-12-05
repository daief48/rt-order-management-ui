<template>
  <div class="container py-4" v-cloak>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Orders</h3>
      <router-link to="/billing" class="btn btn-primary">Create Order</router-link>
    </div>

    <!-- Filters -->
    <div class="card p-3 mb-3">
      <div class="row g-2">
        <div class="col-md-3">
          <input v-model="filters.search" @input="applyFilters" class="form-control" placeholder="Search customer or invoice" />
        </div>
        <div class="col-md-2">
          <input v-model="filters.from" type="date" @change="applyFilters" class="form-control" />
        </div>
        <div class="col-md-2">
          <input v-model="filters.to" type="date" @change="applyFilters" class="form-control" />
        </div>
        <div class="col-md-2">
          <select v-model.number="perPage" @change="applyFilters" class="form-select">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card p-3">
      <table class="table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.invoice_number }}</td>
            <td>{{ order.customer_name }}</td>
            <td>{{ order.order_datetime }}</td>
            <td>{{ order.total_amount }}</td>
            <td>{{ order.status }}</td>
            <td>
              <router-link :to="`/orders/${order.id}/edit`" class="btn btn-sm btn-primary me-1">Edit</router-link>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(order.id)">Delete</button>
            </td>
          </tr>

          <tr v-if="!filteredOrders.length">
            <td colspan="6" class="text-center">No orders found</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <nav v-if="filteredOrders.length > perPage">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="prevPage">Prev</a>
          </li>
          <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: p === currentPage }">
            <a class="page-link" href="#" @click.prevent="gotoPage(p)">{{ p }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import orderService from "../services/orderService";

export default {
  name: "OrdersPage",
  setup() {
    const allOrders = ref([]); // fetched once from API
    const filteredOrders = ref([]); // after JS filtering
    const filters = reactive({ search: "", from: "", to: "" });
    const perPage = ref(10);
    const currentPage = ref(1);

    async function fetchOrders() {
      try {
        const res = await orderService.fetchOrders({ page: 1, per_page: 1000 }); // fetch all once
        allOrders.value = res.data.data;
        applyFilters();
      } catch (e) {
        console.error(e);
      }
    }

    function applyFilters() {
      let temp = allOrders.value;

      console.log("=== ALL ORDERS ===", temp);

      // Search filter
      if (filters.search) {
        const s = filters.search.toLowerCase();
        temp = temp.filter(
          (o) =>
            o.customer_name.toLowerCase().includes(s) ||
            o.invoice_number.toLowerCase().includes(s)
        );
      }
      console.log("=== AFTER SEARCH FILTER ===", temp);

      // Date filter
      if (filters.from) {
        const fromDate = new Date(filters.from);
        temp = temp.filter((o) => new Date(o.order_datetime) >= fromDate);
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        temp = temp.filter((o) => new Date(o.order_datetime) <= toDate);
      }
      console.log("=== AFTER DATE FILTER ===", temp);

      filteredOrders.value = temp;
      currentPage.value = 1; // reset page
    }

    // Pagination
    const totalPages = computed(() =>
      Math.ceil(filteredOrders.value.length / perPage.value)
    );

    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * perPage.value;
      return filteredOrders.value.slice(start, start + perPage.value);
    });

    function prevPage() {
      if (currentPage.value > 1) currentPage.value--;
    }
    function nextPage() {
      if (currentPage.value < totalPages.value) currentPage.value++;
    }
    function gotoPage(p) {
      if (p >= 1 && p <= totalPages.value) currentPage.value = p;
    }

    function confirmDelete(id) {
      if (!confirm("Are you sure you want to delete this order?")) return;
      orderService.deleteOrder(id).then(() => {
        allOrders.value = allOrders.value.filter((o) => o.id !== id);
        applyFilters();
      });
    }

    onMounted(fetchOrders);

    return {
      filters,
      perPage,
      currentPage,
      paginatedOrders,
      totalPages,
      prevPage,
      nextPage,
      gotoPage,
      confirmDelete,
      filteredOrders,
      applyFilters,
    };
  },
};
</script>

<style>
[v-cloak] {
  display: none;
}
</style>
