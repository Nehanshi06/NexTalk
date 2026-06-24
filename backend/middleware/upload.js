const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname)),
});
const fileFilter = (req, file, cb) => {
  if (/image/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Images only'));
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
