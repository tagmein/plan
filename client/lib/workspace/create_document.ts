import { add_style } from '../add_style'
import { elem } from '../element_utils'

add_style`
.plan_document {
 display: flex;
 flex-direction: column;
 flex-grow: 1;
 flex-shrink: 1;
 overflow-x: hidden;
 overflow-y: auto;
}

.plan_document + .plan_document {
 border-top: 1px solid #1b1b1b;
}
`

export interface PlanDocument extends HTMLDivElement {
 path: string
}

export function create_document(path: string): PlanDocument {
 const plan_doc = elem('div', 'plan_document') as PlanDocument
 plan_doc.path = path
 plan_doc.textContent = `Path: ${path}`
 return plan_doc
}
