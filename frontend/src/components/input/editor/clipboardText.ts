import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_NODE_NAMES = new Set(['bulletList', 'orderedList', 'taskList'])

// Plain text for the clipboard. ProseMirror's default drops list markers, so a copied
// bullet list would paste back as loose lines. Markers are written the way the paste
// handler reads markdown, so copying and pasting a list keeps it a list.
export function sliceToPlainText(slice: Slice): string {
	return fragmentLines(slice.content).join('\n')
}

function fragmentLines(fragment: Fragment): string[] {
	const lines: string[] = []
	fragment.forEach(node => lines.push(...nodeLines(node)))
	return lines
}

function nodeLines(node: ProseMirrorNode): string[] {
	if (LIST_NODE_NAMES.has(node.type.name)) {
		const ordered = node.type.name === 'orderedList'
		const lines: string[] = []
		node.forEach((item, _offset, index) => {
			const marker = ordered ? `${index + 1}. ` : '- '
			const itemLines = fragmentLines(item.content)
			const indent = ' '.repeat(marker.length)
			itemLines.forEach((line, lineIndex) => {
				lines.push((lineIndex === 0 ? marker : indent) + line)
			})
			if (itemLines.length === 0) {
				lines.push(marker.trimEnd())
			}
		})
		return lines
	}

	if (node.isTextblock) {
		return [node.textContent]
	}

	if (node.isBlock && node.childCount > 0) {
		return fragmentLines(node.content)
	}

	return []
}
