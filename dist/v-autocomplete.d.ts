declare module "v-autocomplete" {
  import Vue, { PluginFunction } from "vue";

  export default class Autocomplete extends Vue {
    static install: PluginFunction<never>;

    focus(): void;
  }
}