const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const body_parse = require('body-parser')
const warehouseController = require('../controllers/warehouse')
const cors = require('cors')

router.use(cors({
  origin: "*"
}))

router.use(body_parse.json())

router.post('/', auth.authDirector, warehouseController.create_warehouse)
router.get('/all', auth.authDirector, warehouseController.get_all_warehouse)
router.get('/:id', auth.authDirector, warehouseController.get_warehouse)
router.put('/manager/:warehouse_id', auth.authDirector, warehouseController.set_manager)


module.exports = router