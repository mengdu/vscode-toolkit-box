import * as shared from '../../../src/views/shared'

const doc = document.getElementById('doc')

export default JSON.parse(doc!.textContent || '') as shared.InitData
