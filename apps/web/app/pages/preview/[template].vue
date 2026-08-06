<script setup lang="ts">
const route = useRoute()
const template = (route.params.template as 'classic' | 'luxury') ?? 'classic'
const invitation = makeMockInvitation(template)
</script>

<template>
  <div>
    <div class="bg-ink-900 py-2 text-center text-xs text-ivory-200/70">
      Template preview — <span class="uppercase">{{ template }}</span>
    </div>
    <TemplateRenderer :invitation="invitation" />
  </div>
</template>
