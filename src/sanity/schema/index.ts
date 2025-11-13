
import {documentSchema} from './documents/documentSchema.ts'
import {refSchema} from './refs/refSchema.ts'
import {groupSchema} from './groups/groupSchema.ts'
import {componentSchema} from './components/componentSchema.ts'
import {blockSchema} from './blocks/blockSchema.ts'
import {listSchema} from './lists/listSchema.ts'
import {fieldSchema} from './fields/fieldSchema.ts'
import {imgSchema} from './imgs/imgSchema.ts'

export const schema = [
...documentSchema,
...refSchema,
...groupSchema,
...componentSchema,
...blockSchema,
...listSchema,
...fieldSchema,
...imgSchema
]
