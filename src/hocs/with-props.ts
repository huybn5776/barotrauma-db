import { Component } from 'vue';

// eslint-disable-next-line import/no-extraneous-dependencies
import { h } from '@vue/runtime-core';

export function withProps<P>(component: Component<P>, propsGetter: () => object): Component<P> {
  return {
    render() {
      return h(component, { ...propsGetter(), ...this.$attrs }, this.$slots);
    },
  };
}
