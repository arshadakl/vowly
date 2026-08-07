import type { Ref } from 'vue'
import type { ClientWizardStep, EditorInvitation } from '~/types/client-wizard'

export function useClientWizard(draft: Ref<EditorInvitation | null>) {
  const activeStep = ref<ClientWizardStep>(1)
  const completion = computed(() => {
    const invitation = draft.value
    return {
      couple: Boolean(invitation?.brideName.trim() && invitation.groomName.trim()),
      events: Boolean(invitation?.events.length),
      settings: Boolean(invitation?.template),
      publish: Boolean(invitation?.published),
    }
  })

  function canAccess(step: ClientWizardStep) {
    if (step === 1) return true
    if (step === 2) return completion.value.couple
    if (step === 3) return completion.value.couple && completion.value.events
    return completion.value.couple && completion.value.events && completion.value.settings
  }

  function goToStep(step: ClientWizardStep) {
    if (canAccess(step)) activeStep.value = step
  }

  return { activeStep, completion, canAccess, goToStep }
}
