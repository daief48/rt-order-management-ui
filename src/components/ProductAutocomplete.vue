<template>
  <div class="position-relative">
    <input
      v-model="term"
      @input="onSearch"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="chooseHighlighted"
      type="text"
      class="form-control"
      :placeholder="placeholder"
    />
    <ul v-if="show && results.length" class="list-group position-absolute w-100" style="z-index: 1000;">
      <li
        v-for="(r, idx) in results"
        :key="r.id + '-' + idx"
        @click="select(r)"
        :class="['list-group-item list-group-item-action', idx === highlighted ? 'active' : '']"
        style="cursor: pointer;"
      >
        <div><strong>{{ r.name }}</strong> <small class="text-muted">({{ r.barcode || r.sku }})</small></div>
        <div><small>Stock: {{ firstStockQty(r) }}, Price: {{ firstStockPrice(r) || '-' }}</small></div>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref } from 'vue'
import orderService from '../services/orderService'
import _ from 'lodash'

export default {
  name: 'ProductAutocomplete',
  props: {
    placeholder: { type: String, default: 'Search product by name, barcode, sku...' }
  },
  emits: ['selected'],
  setup(props, { emit }) {
    const term = ref('')
    const results = ref([])
    const show = ref(false)
    const highlighted = ref(0)

    const doSearch = async (q) => {
      if (!q || q.length < 1) {
        results.value = []
        show.value = false
        return
      }
      try {
        const res = await orderService.searchProducts(q)
        results.value = res.data
        show.value = results.value.length > 0
        highlighted.value = 0
      } catch (e) {
        results.value = []
        show.value = false
      }
    }

    const onSearch = _.debounce(() => doSearch(term.value), 300)

    function select(item) {
      emit('selected', item)
      term.value = ''
      results.value = []
      show.value = false
    }

    function moveDown() {
      if (results.value.length === 0) return
      highlighted.value = (highlighted.value + 1) % results.value.length
    }
    function moveUp() {
      if (results.value.length === 0) return
      highlighted.value = (highlighted.value - 1 + results.value.length) % results.value.length
    }
    function chooseHighlighted() {
      const sel = results.value[highlighted.value]
      if (sel) select(sel)
    }

    function firstStockQty(prod) {
      return prod.stocks && prod.stocks.length ? prod.stocks[0].quantity : 0
    }
    function firstStockPrice(prod) {
      return prod.stocks && prod.stocks.length ? prod.stocks[0].sale_price : null
    }

    return { term, onSearch, results, show, select, moveDown, moveUp, chooseHighlighted, highlighted, firstStockQty, firstStockPrice }
  }
}
</script>
