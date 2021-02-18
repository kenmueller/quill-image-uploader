export default class ImageUploader {
	constructor(quill, options) {
		this.quill = quill
		this.options = options
		this.range = null

		if (typeof this.options.upload !== 'function')
			console.error(
				'[Missing config] upload function that returns a promise is required'
			)

		this.quill
			.getModule('toolbar')
			.addHandler('image', this.selectLocalImage.bind(this))

		this.handleDrop = this.handleDrop.bind(this)
		this.handlePaste = this.handlePaste.bind(this)

		this.quill.root.addEventListener('drop', this.handleDrop, false)
		this.quill.root.addEventListener('paste', this.handlePaste, false)
	}

	selectLocalImage() {
		this.range = this.quill.getSelection()
		this.fileHolder = document.createElement('input')
		this.fileHolder.setAttribute('type', 'file')
		this.fileHolder.setAttribute('accept', 'image/*')
		this.fileHolder.setAttribute('style', 'visibility:hidden')

		this.fileHolder.onchange = this.fileChanged.bind(this)

		document.body.appendChild(this.fileHolder)

		this.fileHolder.click()

		window.requestAnimationFrame(() => {
			document.body.removeChild(this.fileHolder)
		})
	}

	handleDrop = event => {
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

	handlePaste = event => {
		const clipboard = event.clipboardData || window.clipboardData
		if (!(clipboard && (clipboard.items || clipboard.files))) return

		const items = clipboard.items || clipboard.files
		const IMAGE_MIME_REGEX = /^image\/(jpe?g|gif|png|svg|webp)$/i

		for (let i = 0; i < items.length; i++) {
			if (!IMAGE_MIME_REGEX.test(items[i].type)) continue

			const file = items[i].getAsFile ? items[i].getAsFile() : items[i]
			if (!file) continue

			this.range = this.quill.getSelection()
			event.preventDefault()

			setTimeout(() => {
				this.range = this.quill.getSelection()
				this.readAndUploadFile(file)
			}, 0)
		}
	}

	readAndUploadFile = file => {
		this.options.upload(file).then(this.insertToEditor).catch(console.error)
	}

	fileChanged = () => {
		this.readAndUploadFile(this.fileHolder.files[0])
	}

	insertToEditor = url => {
		const { quill, range } = this

		quill.insertEmbed(range.index, 'image', url, 'user')

		range.index++
		quill.setSelection(range, 'user')
	}
}
