import Quill, { RangeStatic } from 'quill'

export interface UploadImageOptions {
	upload(file: File): Promise<string> | string
	onError?(error: unknown): void
}

export default class UploadImage {
	private range: RangeStatic | null = null
	private fileHolder: HTMLInputElement | null = null

	constructor(
		private readonly quill: Quill,
		private readonly options: UploadImageOptions
	) {
		if (typeof options.upload !== 'function')
			throw new Error('Missing upload function')

		this.quill.getModule('toolbar').addHandler('image', this.selectLocalImage)

		this.quill.root.addEventListener('drop', this.handleDrop, false)
		this.quill.root.addEventListener('paste', this.handlePaste, false)
	}

	selectLocalImage = () => {
		this.range = this.quill.getSelection()
		this.fileHolder = document.createElement('input')

		this.fileHolder.setAttribute('type', 'file')
		this.fileHolder.setAttribute('accept', 'image/*')
		this.fileHolder.setAttribute('style', 'visibility:hidden')

		this.fileHolder.addEventListener('change', this.fileChanged)

		document.body.appendChild(this.fileHolder)
		this.fileHolder.click()

		window.requestAnimationFrame(() => {
			if (!this.fileHolder) return
			document.body.removeChild(this.fileHolder)
		})
	}

	handleDrop = (event: DragEvent) => {
		event.stopPropagation()
		event.preventDefault()

		if (
			!(
				event.dataTransfer &&
				event.dataTransfer.files &&
				event.dataTransfer.files.length
			)
		)
			return

		if (document.caretRangeFromPoint) {
			const selection = document.getSelection()
			const range = document.caretRangeFromPoint(event.clientX, event.clientY)

			if (selection && range)
				selection.setBaseAndExtent(
					range.startContainer,
					range.startOffset,
					range.startContainer,
					range.startOffset
				)
		} else {
			const selection = document.getSelection()
			const range = document.caretPositionFromPoint(
				event.clientX,
				event.clientY
			)

			if (selection && range)
				selection.setBaseAndExtent(
					range.offsetNode,
					range.offset,
					range.offsetNode,
					range.offset
				)
		}

		this.range = this.quill.getSelection()
		const file = event.dataTransfer.files[0]

		setTimeout(() => {
			this.range = this.quill.getSelection()
			this.readAndUploadFile(file)
		}, 0)
	}

	handlePaste = (event: ClipboardEvent) => {
		const clipboard =
			event.clipboardData ||
			((window as unknown) as { clipboardData: DataTransfer | null })
				.clipboardData

		if (!(clipboard && (clipboard.items || clipboard.files))) return

		const items = clipboard.items || clipboard.files
		const IMAGE_MIME_REGEX = /^image\/(jpe?g|gif|png|svg|webp)$/i

		for (let i = 0; i < items.length; i++) {
			if (!IMAGE_MIME_REGEX.test(items[i].type)) continue

			const file = 'getAsFile' in items[i] ? items[i].getAsFile() : items[i]
			if (!file) continue

			this.range = this.quill.getSelection()
			event.preventDefault()

			setTimeout(() => {
				this.range = this.quill.getSelection()
				this.readAndUploadFile(file as File)
			}, 0)
		}
	}

	readAndUploadFile = async (file: File) => {
		const { upload, onError } = this.options

		try {
			this.insertToEditor(await upload(file))
		} catch (error) {
			;(onError ?? console.error)(error)
		}
	}

	fileChanged = () => {
		const file = this.fileHolder?.files?.[0]
		if (file) this.readAndUploadFile(file)
	}

	insertToEditor = (url: string) => {
		const { quill, range } = this
		if (!range) return

		quill.insertEmbed(range.index, 'image', url, 'user')

		range.index++
		quill.setSelection(range, 'user')
	}
}
