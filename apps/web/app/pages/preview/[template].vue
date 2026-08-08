<script setup lang="ts">
const invitation = makeMockInvitation()
</script>

<template>
  <div>
    <div class="bg-ink-900 py-2 text-center text-xs text-ivory-200/70">
      Template preview — <span class="uppercase">Floral</span>
    </div>
    <TemplateRenderer :invitation="invitation" />
  </div>
</template>
