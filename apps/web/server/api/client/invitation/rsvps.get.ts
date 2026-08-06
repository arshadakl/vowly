import { editorContext } from '../../../utils/editor'
import { rsvpData } from '../../../utils/rsvps'
export default defineEventHandler(async (event) => { const context = await editorContext(event); return rsvpData(event, context.invitation.id) })
