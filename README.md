# Quill Image Uploader

A module for Quill rich text editor to allow images to be uploaded to a server instead of being base64 encoded.
Adds a button to the toolbar for users to click, also handles drag,dropped and pasted images.

```javascript
import Quill from 'quill'
import ImageUploader from 'quill-image-uploader'

import 'quill-image-uploader/src/index.css'

Quill.register('modules/imageUploader', ImageUploader)

const quill = new Quill(editor, {
	// ...
	modules: {
		// ...
		imageUploader: {
			upload: file =>
				new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(
							'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/480px-JavaScript-logo.png'
						)
					}, 3500)
				})
		}
	}
})
```
