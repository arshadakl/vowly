<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'

const props = defineProps<{ invitation: PublicInvitation }>()
const resolvedTemplate = computed(() => resolveTemplateComponent(props.invitation.template))
</script>

<template>
  <component :is="resolvedTemplate" :invitation="invitation" />
</template>
