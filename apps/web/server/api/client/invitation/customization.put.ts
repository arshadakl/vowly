import { templateCustomizationUpdateSchema } from '@vowly/types'
import { editorContext, assertEditable, presentEditor } from '../../../utils/editor'
import { apiError, body } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
import { writeCustomization } from '../../../utils/template-customization'

export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  assertEditable(context)
  const parsed = templateCustomizationUpdateSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Template customization is invalid.', 400)
  await writeCustomization(
    getEnv(event).DB,
    context.invitation.id,
    parsed.data.template,
    parsed.data.customization,
  )
  return presentEditor(event, context)
})
