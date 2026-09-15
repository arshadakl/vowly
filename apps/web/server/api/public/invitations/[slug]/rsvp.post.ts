import { apiError } from '../../../../utils/http'

export default defineEventHandler(async (event) => {
  apiError('RSVP_MOVED', 'RSVP responses are handled through WhatsApp.', 410)
})
