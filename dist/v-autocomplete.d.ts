declare module "v-autocomplete" {
  import Vue from "vue";
  export default class Autocomplete extends Vue {
    static install: Vue.PluginFunction<never>;

    focus(): void;
  }
}