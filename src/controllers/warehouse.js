const TransactionSpot = require("../models/TransactionSpot");
const Transaction = require("../models/Transaction");
const Warehouse = require("../models/Warehouse");
const response = require("../utils/response");
const geocode = require("../utils/geocode");
const User = require("../models/User");

exports.create_warehouse = async (req, res) => {
  try {
    const { name, location, warehouse_manager } = req.body;
    const warehouse = await Warehouse.create({
      name,
      location,
      transaction_spots: [],
      warehouse_manager,
      warehouse_employees: [],
    });
    await User.findByIdAndUpdate(warehouse_manager, {
      $set: {
        "workplace.workplace_id": warehouse._id,
        "workplace.workplace_name": "WAREHOUSE",
      },
    });
    return response.response_success(
      res,
      response.OK,
      "Create warehouse successfully"
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "create_warehouse";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_warehouse = async (req, res) => {
  try {
    if (!req.params.id)
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: warehouse id"
      );
    const warehouse = await Warehouse.findById(req.params.id)
      .populate("warehouse_manager")
      .populate("warehouse_employees")
      .populate("transaction_spots");
    return response.response_success(res, response.OK, warehouse);
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_warehouse";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_all_warehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.find()
      .populate("warehouse_manager")
      .populate("warehouse_employees")
      .populate("transaction_spots");
    return response.response_success(res, response.OK, warehouse);
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_all_warehouse";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_my_warehouse = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(
        res, 
        response.INTERNAL_SERVER_ERROR, 
        'auth middleware didnt pass warehouse doc'
      );
    const populateField = ['warehouse_manager', 'warehouse_employees', 'transaction_spots']
    const warehouse = await Warehouse.findById(req.warehouse._id).populate(populateField);
    return response.response_success(res, response.OK, warehouse)
  } catch (err) {
    err.file = "warehouse.js"
    err.function = "get_my_warehouse"
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
}

exports.get_employee_warehouse = async (req, res) => {
  try {
    const id = req.params.warehouse_id;
    const warehouse = await Warehouse.findById(id).populate('warehouse_employees');
    return response.response_success(res, response.OK, warehouse.warehouse_employees)
  } catch (err) {
    err.file = "warehouse.js"
    err.function = "get_employee_warehouse"
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.get_received_transactions_history = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(res, response.INTERNAL_SERVER_ERROR, 'auth middleware didnt pass warehouse doc')
    const warehouse = await Warehouse.findById(req.warehouse._id)
    .populate({
      path: 'received_transactions_history', 
      populate: {
        path: 'transaction',
        model: 'Transaction',
        populate:[ 
          {
            path: 'source_transaction_spot',
            model: 'TransactionSpot'
          },
          {
            path: 'destination_transaction_spot',
            model: 'TransactionSpot'
          },
          {
            path: 'sender',
            model: 'User'
          },
          {
            path: 'receiver',
            model: 'User'
          }
        ] 
      }
    })
    const received_transactions_history = warehouse.received_transactions_history

    return response.response_success(
      res,
      response.OK,
      received_transactions_history
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_received_transactions_history";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_sent_transactions_history = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(res, response.INTERNAL_SERVER_ERROR, 'auth middleware didnt pass warehouse doc')
    const warehouse = await Warehouse.findById(req.warehouse._id)
    .populate({
      path: 'sent_transactions_history', 
      populate: {
        path: 'transaction',
        model: 'Transaction',
        populate:[ 
          {
            path: 'source_transaction_spot',
            model: 'TransactionSpot'
          },
          {
            path: 'destination_transaction_spot',
            model: 'TransactionSpot'
          },
          {
            path: 'sender',
            model: 'User'
          },
          {
            path: 'receiver',
            model: 'User'
          }
        ] 
      }
    })
    const sent_transactions_history = warehouse.sent_transactions_history
    
    return response.response_success(
      res,
      response.OK,
      sent_transactions_history
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_sent_transactions_history";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_unconfirm_transactions_from_warehouse = async (req, res) => {
  try {
    if (!req.params.warehouse_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: warehouse id')
    const warehouse = await Warehouse.findById(req.params.warehouse_id)
    if (!warehouse)
      return response.response_fail(res, response.NOT_FOUND, 'Warehouse not found')
    const unconfirm_transactions_from_warehouse = await Transaction.find({
      _id: { $in: warehouse.unconfirm_transactions_from_warehouse },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(
      res,
      response.OK,
      unconfirm_transactions_from_warehouse
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_unconfirm_transactions_from_warehouse";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_unconfirm_transactions_from_transaction_spot = async (req, res) => {
  try {
    if (!req.params.warehouse_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: warehouse id')
    const warehouse = await Warehouse.findById(req.params.warehouse_id)
    if (!warehouse)
      return response.response_fail(res, response.NOT_FOUND, 'Warehouse not found')
    const unconfirm_transactions_from_transaction_spot = await Transaction.find({
      _id: { $in: warehouse.unconfirm_transactions_from_transaction_spot },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(
      res,
      response.OK,
      unconfirm_transactions_from_transaction_spot
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_unconfirm_transactions_from_transaction_spot";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_inwarehouse_transactions_to_warehouse = async (req, res) => {
  try {
    if (!req.params.warehouse_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: warehouse id')
    const warehouse = await Warehouse.findById(req.params.warehouse_id)
    if (!warehouse)
      return response.response_fail(res, response.NOT_FOUND, 'Warehouse not found')
    const inwarehouse_transactions_to_warehouse = await Transaction.find({
      _id: { $in: warehouse.inwarehouse_transactions_to_warehouse },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(
      res,
      response.OK,
      inwarehouse_transactions_to_warehouse
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_inwarehouse_transactions_to_warehouse";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_inwarehouse_transactions_to_transaction_spot = async (req, res) => {
  try {
    if (!req.params.warehouse_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: warehouse id')
    const warehouse = await Warehouse.findById(req.params.warehouse_id)
    if (!warehouse)
      return response.response_fail(res, response.NOT_FOUND, 'Warehouse not found')
    const inwarehouse_transactions_to_transaction_spot = await Transaction.find({
      _id: { $in: warehouse.inwarehouse_transactions_to_transaction_spot },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(
      res,
      response.OK,
      inwarehouse_transactions_to_transaction_spot
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "get_inwarehouse_transactions_to_transaction_spot";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.set_manager = async (req, res) => {
  try {
    const id = req.params.warehouse_id;
    const manager_id = req.body.manager_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: warehouse_id is required"
      );
    }
    if (!manager_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "manager_id is required"
      );
    }
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "Warehouse not found"
      );
    }
    const manager = await User.findById(manager_id);
    if (!manager) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "manager not found"
      );
    }
    if (manager.workplace?.workplace_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "manager already have workplace"
      );
    }
    if (warehouse.warehouse_manager) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "warehouse already have manager"
      );
    }
    await Warehouse.findByIdAndUpdate(id, { warehouse_manager: manager_id });
    await User.findByIdAndUpdate(manager_id, {
      $set: {
        "workplace.workplace_id": id,
        "workplace.workplace_name": "WAREHOUSE",
      },
    });
    return response.response_success(
      res,
      response.OK,
      "set warehouse manager success"
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "set_manager";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.remove_manager = async (req, res) => {
  try {
    const id = req.params.warehouse_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "warehouse_id is required"
      );
    }
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "warehouse not found"
      );
    }
    const manager = await User.findById(warehouse.warehouse_manager);
    if (!manager) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "warehouse manager not found"
      );
    }
    await Warehouse.findByIdAndUpdate(warehouse._id, {
      warehouse_manager: null,
    });
    await User.findByIdAndUpdate(manager._id, {
      $set: { "workplace.workplace_id": null },
    });
    return response.response_success(
      res,
      response.OK,
      "remove manager from warehouse success"
    );
  } catch (err) {
    err.file = "warehouse.js";
    err.function = "remove_manager";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.send_transaction_to_warehouse = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(res, response.INTERNAL_SERVER_ERROR, 'auth middleware didnt pass warehouse doc')
    const warehouse = req.warehouse
    if (!req.params.transaction_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_id')
    const transaction = await Transaction.findById(req.params.transaction_id)
    if (!transaction) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not found')
    if (!warehouse.inwarehouse_transactions_to_warehouse.includes(transaction._id)) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not in warehouse list to ship to warehouse')
    const destination_transaction_spot = await TransactionSpot.findById(transaction.destination_transaction_spot)
    if (!destination_transaction_spot) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction doesnt have destination transaction spot')
    if (!destination_transaction_spot.warehouse) 
      return response.response_fail(res, response.NOT_FOUND, 'destination transaction spot doesnt have warehouse')
    const destination_warehouse = await Warehouse.findById(destination_transaction_spot.warehouse)
    if (!destination_warehouse) 
      return response.response_fail(res, response.NOT_FOUND, 'destination warehouse not found')
    const newHistory = {
      transaction: transaction._id
    }
    await Warehouse.findByIdAndUpdate(warehouse._id, 
      { $pull: { inwarehouse_transactions_to_warehouse: transaction._id }, $addToSet: { sent_transactions_history: newHistory } }
      )
    await Warehouse.findByIdAndUpdate(destination_warehouse._id, 
      { $addToSet: { unconfirm_transactions_from_warehouse: transaction._id } }
      )
    const newStatus = {
      date: Date.now(),
      location: destination_warehouse.name
    }
    await Transaction.findByIdAndUpdate(transaction._id, { $addToSet: { status: newStatus } })
    return response.response_success(
      res, 
      response.OK, 
      'ship transaction from this warehouse to destination warehouse'
      );
  } catch (err) {
    err.file = "warehouse.js"
    err.function = "send_transaction_to_warehouse"
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.send_transaction_to_transaction_spot = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(res, response.INTERNAL_SERVER_ERROR, 'auth middleware didnt pass warehouse doc')
    const warehouse = req.warehouse
    if (!req.params.transaction_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_id')
    const transaction = await Transaction.findById(req.params.transaction_id)
    if (!transaction) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not found')
    if (!transaction.destination_transaction_spot) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction doesnt have destination transaction spot')
    if (!warehouse.inwarehouse_transactions_to_transaction_spot.includes(transaction._id)) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not in warehouse list to ship to transaction spot')
    if (!warehouse.transaction_spots.includes(transaction.destination_transaction_spot)) 
      return response.response_fail(res, response.BAD_REQUEST, 'this warehouse doesnt have destination transaction spot')
    const destination_transaction_spot = await TransactionSpot.findById(transaction.destination_transaction_spot)
    if (!destination_transaction_spot) 
      return response.response_fail(res, response.NOT_FOUND, 'destination transaction spot not found')
    const newHistory = {
      transaction: transaction._id
    }
    await Warehouse.findByIdAndUpdate(warehouse._id, 
      { $pull: { inwarehouse_transactions_to_transaction_spot: transaction._id }, $addToSet: { sent_transactions_history: newHistory } }
      )
    await TransactionSpot.findByIdAndUpdate(destination_transaction_spot._id, 
      { $addToSet: { unconfirm_transactions: transaction._id } }
      )
    const newStatus = {
      date: Date.now(),
      location: destination_transaction_spot.name
    }
    await Transaction.findByIdAndUpdate(transaction._id, { $addToSet: { status: newStatus } })
    return response.response_success(
      res, 
      response.OK, 
      'ship transaction from this warehouse to destination transaction spot'
      )
  } catch (err) {
    err.file = "warehouse.js"
    err.function = "send_transaction_to_transaction_spot"
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.receive_transaction_from_warehouse = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(res, response.INTERNAL_SERVER_ERROR, 'auth middleware didnt pass warehouse doc')
    const warehouse = req.warehouse
    if (!req.params.transaction_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_id')
    const transaction = await Transaction.findById(req.params.transaction_id)
    if (!transaction) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not found')
    if (!transaction.destination_transaction_spot) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction doesnt have destination transaction spot')
    if (!warehouse.unconfirm_transactions_from_warehouse.includes(transaction._id)) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not in waiting from warehouse list')
    const newHistory = {
      transaction: transaction._id
    }
    const warehouse_has_transaction_spot = warehouse.transaction_spots.includes(transaction.destination_transaction_spot)
    if (!warehouse_has_transaction_spot) {
      await Warehouse.findByIdAndUpdate(warehouse._id, 
        { $pull: { unconfirm_transactions_from_warehouse: transaction._id }, 
          $addToSet: { inwarehouse_transactions_to_warehouse: transaction._id, received_transactions_history: newHistory } 
        }
      )
    } else await Warehouse.findByIdAndUpdate(warehouse._id, 
        { $pull: { unconfirm_transactions_from_warehouse: transaction._id }, 
          $addToSet: { inwarehouse_transactions_to_transaction_spot: transaction._id, received_transactions_history: newHistory } 
        }
      )
    const newStatus = {
      status: 'SUCCESS',
      date: Date.now(),
      location: warehouse.name
    }
    await Transaction.findByIdAndUpdate(transaction._id, { $addToSet: { status: newStatus } })
    if (!warehouse_has_transaction_spot) 
    return response.response_success(
      res, 
      response.OK, 
      'this warehouse doesnt have destination transaction spot, redirect to another warehouse'
    );
    else return response.response_success(
        res, 
        response.OK, 
        'received. Ready to ship to destination transaction spot'
      )
  } catch (err) {
    err.file = "warehouse.js"
    err.function = "receive_transaction_from_warehouse "
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};

exports.receive_transaction_from_transaction_spot = async (req, res) => {
  try {
    if (!req.warehouse) 
      return response.response_fail(res, response.INTERNAL_SERVER_ERROR, 'auth middleware didnt pass warehouse doc')
    const warehouse = req.warehouse
    if (!req.params.transaction_id) 
      return response.response_fail(res, response.BAD_REQUEST, 'Missing params: transaction_id')
    const transaction = await Transaction.findById(req.params.transaction_id)
    if (!transaction) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not found')
    if (!transaction.destination_transaction_spot) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction doesnt have destination transaction spot')
    if (!warehouse.unconfirm_transactions_from_transaction_spot.includes(transaction._id)) 
      return response.response_fail(res, response.NOT_FOUND, 'transaction not in waiting from transaction spot list')
    const newHistory = {
      transaction: transaction._id
    }
    const warehouse_has_transaction_spot = warehouse.transaction_spots.includes(transaction.destination_transaction_spot)
    if (!warehouse_has_transaction_spot) {
      await Warehouse.findByIdAndUpdate(warehouse._id, 
        { $pull: { unconfirm_transactions_from_transaction_spot: transaction._id }, 
          $addToSet: { inwarehouse_transactions_to_warehouse: transaction._id, received_transactions_history: newHistory } 
        })
    } else await Warehouse.findByIdAndUpdate(warehouse._id, 
      { $pull: { unconfirm_transactions_from_transaction_spot: transaction._id }, 
        $addToSet: { inwarehouse_transactions_to_transaction_spot: transaction._id, received_transactions_history: newHistory } 
      })
    const newStatus = {
      status: 'SUCCESS',
      date: Date.now(),
      location: warehouse.name
    }
    await Transaction.findByIdAndUpdate(transaction._id, { $addToSet: { status: newStatus } })
    if (!warehouse_has_transaction_spot) 
    return response.response_success(
      res, 
      response.OK, 
      'this warehouse doesnt have destination transaction spot, redirect to another warehouse'
    );
    else return response.response_success(
          res, 
          response.OK, 
          'received. Ready to ship to destination transaction spot'
        );
  } catch (err) {
    err.file = "warehouse.js"
    err.function = "receive_transaction_from_transaction_spot "
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err)
  }
};
