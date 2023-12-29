const express = require('express')
const mongoose = require('mongoose');
const route = express.Router()
const body_parse = require('body-parser')
const cors = require('cors')
const User = require('../models/User')
const TransactionSpot = require('../models/TransactionSpot')
const response = require('../utils/response');
const auth = require('../middleware/auth');
const userController = require('../controllers/user')
const bcrypt = require('bcrypt')
const Warehouse = require('../models/Warehouse')
const Transaction = require('../models/Transaction')

route.use(cors({
origin: "*"
}))

route.use(body_parse.json())

route.post('/testR', auth.authWarehouseManager)

route.post('/create_mock_transaction', async (req, res) => {
  const mockData = {
    sender: {
      name: "Nguyen Van A",
      email: "jdalfksdj@gmail.com",
      address: {
        district: "Huyện Chương Mỹ",
        city: "Thành phố Hà Nội",
        detail: "laksjdlfakjsdf"
      },
      phoneNumber: "0123456789"
    },
    receiver: {
      name: "Nguyen Van B",
      email: "asldf@gmail.com",
      address: {
        city: "Tỉnh Quảng Ninh",
        district: "Thành phố Hạ Long",
        detail: "Vịnh Hạ Long"
      },
      phoneNumber: "0123456789"
    },
    list_package: [
      {
        name: "test",
        description: "test",
        type: "PACKAGE",
        weight: 122,
        postage: 123,
        quantity: 123
      }
    ],
    source_transaction_spot : "658db399eda9aab315d71157",
    destination_transaction_spot: "658db0b88940c9ca1e4abda3",
    transaction_type: "Hoả tốc",
    shipping_cost: 13503.162689425128,
    status: [
      {
        status: "WAITING",
        date: Date.now(),
        location: "Điểm giao dịch Xuân Thủy"
      }
    ]
  }
  const list_mock = []
  for (let j = 2; j < 12; j++) {
    for (let i = 0; i < Math.random() * 26; i++) {
      const date = new Date()
      date.setDate(i + 1);
      date.setMonth(j + 1);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      mockData.send_date = date
      list_mock.push({...mockData})
    }
    const list = await Transaction.insertMany(list_mock)
    const list_id = list.map(item => item._id)
    for (let i = 0; i < list_id.length; i++) {
      const id = list_id[i];
      await Warehouse.findByIdAndUpdate("658db03f8940c9ca1e4abd8e", {
        $push: {
          received_transactions_history: {
            transaction: id,
            time: list_mock[i].send_date
          }
        }
      })
    }
  }
  // await Warehouse.findByIdAndUpdate("658db03f8940c9ca1e4abd8e", {
  //   $push: {
  //     sent_transactions_history: {
  //       transaction: "658db399eda9aab315d71157",
  //       time: Date.now()
  //     }
  //   }
  // })
  return res.json("ok")
})

module.exports = route