const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const auth = require('../middleware/auth');

router.post('/diabetes', auth, predictionController.predictDiabetes);
router.post('/heart', auth, predictionController.predictHeart);
router.get('/history', auth, predictionController.getPredictionHistory);

module.exports = router;