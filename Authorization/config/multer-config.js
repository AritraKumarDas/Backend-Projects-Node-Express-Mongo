const multer = require('multer');
const crypto = require('crypto');
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, (err, buffer) => {
            const filename = buffer.toString('hex') + path.extname(file.originalname);
            cb(null, filename)
        })
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    }
})

const upload = multer({ storage: storage })

module.exports = upload;