<template lang="html">
  <div class="v-autocomplete">
    <div class="v-autocomplete-input-group" :class="{'v-autocomplete-selected': value}">
      <input type="search" v-model="searchText" v-bind="inputAttrs"
            ref="input"
            :class="inputAttrs.class || inputClass"
            :placeholder="inputAttrs.placeholder || placeholder"
            :disabled="inputAttrs.disabled || disabled"
            @blur="onBlur" @focus="onFocus" @input="onInputChange"
            @keydown.enter="onKeyEnter" @keydown.tab="onKeyEnter" 
            @keydown.up="onKeyUp" @keydown.down="onKeyDown" @keydown.esc="onKeyEsc">
    </div>
    <div class="v-autocomplete-list" v-if="show">
      <div class="v-autocomplete-list-item" v-for="item, i in internalItems" @mousedown.prevent="onClickItem(item)"
           :class="{'v-autocomplete-item-active': i === cursor}" @mouseover="cursor = i">
        <div :is="componentItem" :item="item" :searchText="searchText"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Item from './Item.vue'
import utils from './utils.js'

export default {
  name: 'v-autocomplete',
  props: {
    componentItem: { default: () => Item },
    minLen: { type: Number, default: utils.minLen },
    wait: { type: Number, default: utils.wait },
    value: null,
    getLabel: {
      type: Function,
      default: item => item
    },
    items: Array,
    autoSelectOneItem: { type: Boolean, default: true },
    placeholder: String,
    isFreeTextAllowed: { type: Boolean, default: false },
    inputClass: {type: String, default: 'v-autocomplete-input'},
    disabled: {type: Boolean, default: false},
    inputAttrs: {type: Object, default: () => {return {}}},
    keepOpen: {type: Boolean, default: false},
    disableFormSubmit: {type: Boolean, default: false},
  },
  data () {
    return {
      searchText: '',
      showList: false,
      cursor: -1,
      internalItems: this.items || [],
      inputElement: undefined,
    }
  },
  computed: {
    hasItems () {
      return !!this.internalItems.length
    },
    show () {
      return (this.showList && this.hasItems) || this.keepOpen
    }
  },
  mounted() {
    this.inputElement = this.$refs["input"];
  },
  methods: {
    focus() {
      if (!this.inputElement) {
        return;
      }

      this.inputElement.focus();
    },

    updateItems () {
      this.$emit('update-items', this.searchText)
    },

    onInputChange () {
      this.showList = true
      this.cursor = -1
      if (!this.searchText) {
        this.onSelectItem(undefined);
      }

      utils.callUpdateItems(this.searchText, this.updateItems)
      this.$emit('change', this.searchText)
    },

    onFocus () {
      this.$emit('focus', this.searchText)
      
      if (this.hasItems) {
        this.showList = true
      }
    },

    onBlur () {
      if (!this.isFreeTextAllowed) {
        this.onValueChanged(this.value);
      } else {
        this.onSelectItem(this.searchText);
      }
      
      this.$emit('blur');
      setTimeout( () => this.showList = false, 200)
    },

    onClickItem(item) {
      this.onSelectItem(item)
      this.$emit('item-clicked', item)
      this.showList = false
    },

    onSelectItem (item) {
        this.searchText = '';
        this.$emit('input', item)
        this.$emit('item-selected', item)
    },

    setItems (items) {
      this.internalItems = items || []
    },

    isSelectedValue (value) {
      return 1 == this.internalItems.length && value == this.internalItems[0]
    },

    onKeyUp (e) {
      if (!this.showList || !this.hasItems) {
        return;
      }

      e.preventDefault();

      if (this.cursor > -1) {
        this.cursor--
        this.itemView(this.$el.getElementsByClassName('v-autocomplete-list-item')[this.cursor])
      }
    },

    onKeyDown (e) {
      if (!this.showList || !this.hasItems) {
        return;
      }

      e.preventDefault();

      if (this.cursor < this.internalItems.length) {
        this.cursor++
        this.itemView(this.$el.getElementsByClassName('v-autocomplete-list-item')[this.cursor])
      }
    },

    itemView (item) {
      if (!item || !item.scrollIntoView) {
        return;
      }

      let viewport = {};
      viewport.top = window.pageYOffset;
      viewport.bottom = viewport.top + window.innerHeight;

      let bounds = {};
      bounds.top = item.getBoundingClientRect().top + window.pageYOffset
      bounds.bottom = bounds.top + item.clientHeight;

      if (bounds.top < viewport.top) {
        item.scrollIntoView(true);
      } else if (bounds.bottom > viewport.bottom) {
        item.scrollIntoView(false);
      }       
    },

    onKeyEnter (e) {
      if (this.disableFormSubmit && e.keyCode === 13) {
        e.preventDefault();
      }

      if (this.showList && this.internalItems[this.cursor]) {
        this.onSelectItem(this.internalItems[this.cursor]);
        this.showList = false;  
      } else if (this.isFreeTextAllowed) {
        this.onSelectItem(this.searchText);
        this.showList = false;
      }
    },

    onKeyEsc (e) {
      e.preventDefault();
      this.onValueChanged(this.value);
      this.showList = false;
    },

    onValueChanged(newValue) {
      this.internalItems = newValue  ? [newValue] : []
      utils.clearTimeout()
      this.searchText = this.getLabel(newValue)

      if (!this.isSelectedValue(newValue)) {
        this.$emit('item-selected', newValue)
      }
    }

  },
  created () {
    utils.minLen = this.minLen
    utils.wait = this.wait
  },
  watch: {
    items (newValue) {
      this.setItems(newValue)
      let item = utils.findItem(this.items, this.searchText, this.autoSelectOneItem)
      if (item) {
        this.onSelectItem(item)
        this.showList = false
      }
    },
    value (newValue) {      
      this.onValueChanged(newValue);
    }
  }
}
</script>

<style>
  .v-autocomplete {
    position: relative;
  }
  .v-autocomplete .v-autocomplete-list {
    position: absolute;
  }
  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item {
    cursor: pointer;
  }
  .v-autocomplete .v-autocomplete-list .v-autocomplete-list-item.v-autocomplete-item-active {
    background-color: #f3f6fa;
  }
</style>
