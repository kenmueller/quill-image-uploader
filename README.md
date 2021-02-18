# Quill Upload Image

Upload images in Quill through a server instead of being base64 encoded. Handles drag & drop, pasting, and direct uploads.

```js
import Quill from 'quill'
import UploadImage from 'quill-upload-image'

Quill.register('modules/uploadImage', UploadImage)

const quill = new Quill(editor, {
	modules: {
		uploadImage: {
			upload: file =>
				new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve('https://example.com/image.png')
					}, 3000)
				}),
			onError: error => console.error(error)
		}
	}
})
```
