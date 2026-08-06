import { editorContext, presentEditor } from '../../utils/editor'
export default defineEventHandler(async (event) => presentEditor(event, await editorContext(event)))
