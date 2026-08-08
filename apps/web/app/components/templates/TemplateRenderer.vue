<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import FloralTemplate from '~/components/templates/floral/FloralTemplate.vue'

defineProps<{ invitation: PublicInvitation }>()
</script>

<template>
  <FloralTemplate :invitation="invitation" />
</template>
