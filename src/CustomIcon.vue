<template>
  <div>
    <img :src="icon" alt="link button icon" class="link-button-icon" />
  </div>
</template>

<script lang="ts">
  export default {
    name: 'CustomIcon',
    props: {
      icon: {
        type: String,
        default: '',
      },
      maxSize: {
        type: String,
        default: '20px',
      },
    },
  };
</script>

<style scoped>
  .link-button-icon {
    max-height: v-bind(maxSize);
    max-width: v-bind(maxSize);
  }
</style>
