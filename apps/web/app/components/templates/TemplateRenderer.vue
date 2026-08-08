<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import FloralTemplate from '~/components/templates/floral/FloralTemplate.vue'
import BurgundyTemplate from '~/components/templates/burgundy/BurgundyTemplate.vue'

defineProps<{ invitation: PublicInvitation }>()
</script>

<template>
  <BurgundyTemplate v-if="invitation.template === 'burgundy'" :invitation="invitation" />
  <FloralTemplate v-else :invitation="invitation" />
</template>
