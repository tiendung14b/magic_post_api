const TransactionSpot = require("../models/TransactionSpot");
const Transaction = require("../models/Transaction");
const Warehouse = require("../models/Warehouse");
const response = require("../utils/response");
const geocode = require("../utils/geocode");
const User = require("../models/User");
const role = require("../utils/role");

exports.create_transaction_spot = async (req, res) => {
  try {
    const { name, location, warehouse, transaction_manager } = req.body;
    console.log(req.body);
    const geocodeInfo = await geocode.getPostalCode(
      location.detail + ", " + location.district + ", " + location.city
    );
    if (!geocodeInfo.postcode) {
      geocodeInfo.postcode = Math.floor(Math.random() * 100000);
    }
    const existPostalCode = await TransactionSpot.findOne({
      postal_code: geocodeInfo.postcode,
    });
    if (existPostalCode) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Postal code already exist"
      );
    }
    location.lat = geocodeInfo.lat;
    location.long = geocodeInfo.lon;
    const transactionSpot = await TransactionSpot.create({
      name,
      location,
      postal_code: geocodeInfo.postcode,
      warehouse,
      transaction_manager,
      transaction_employees: [],
    });
    await User.findByIdAndUpdate(transaction_manager, {
      $set: {
        "workplace.workplace_id": transactionSpot._id,
        "workplace.workplace_name": "TRANSACTION",
        "workplace.role": role.TRANSACTION_MANAGER,
      },
    });
    await Warehouse.findByIdAndUpdate(warehouse, {
      $push: {
        transaction_spots: transactionSpot._id,
      },
    });
    return response.response_success(
      res,
      response.OK,
      "Create transaction spot successfully"
    );
  } catch (err) {
    console.log(err);
    err.file = "transaction_spot.js";
    err.function = "create_transaction_spot";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_transaction_spot = async (req, res) => {
  try {
    if (!req.params.id)
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction spot id"
      );
    const transactionSpot = await TransactionSpot.findById(req.params.id)
      .populate("transaction_manager")
      .populate("transaction_employees")
      .populate("warehouse");
    return response.response_success(res, response.OK, transactionSpot);
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_transaction_spot";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_all_transaction_spot = async (req, res) => {
  try {
    const transactionSpot = await TransactionSpot.find()
      .populate("transaction_manager")
      .populate("transaction_employees")
      .populate("warehouse");
    return response.response_success(res, response.OK, transactionSpot);
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_all_transaction_spot";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.set_manager = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id;
    const manager_id = req.body.manager_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    if (!manager_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "manager_id is required"
      );
    }
    const transactionSpot = await TransactionSpot.findById(id);
    if (!transactionSpot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "Transaction_spot not found"
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
    if (transactionSpot.transaction_manager) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "transaction_spot already have manager"
      );
    }
    await TransactionSpot.findByIdAndUpdate(id, {
      transaction_manager: manager_id,
    });
    await User.findByIdAndUpdate(manager_id, {
      $set: {
        "workplace.workplace_id": id,
        "workplace.workplace_name": "TRANSACTION",
      },
    });
    return response.response_success(
      res,
      response.OK,
      "set transaction manager success"
    );
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "set_manager";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.remove_manager = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "transaction_spot_id is required"
      );
    }
    const transactionSpot = await TransactionSpot.findById(id);
    if (!transactionSpot) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "transaction_spot not found"
      );
    }
    const manager = await User.findById(transactionSpot.transaction_manager);
    if (!manager) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "manager not found"
      );
    }
    await TransactionSpot.findByIdAndUpdate(id, { transaction_manager: null });
    await User.findByIdAndUpdate(manager._id, {
      $set: { "workplace.workplace_id": null },
    });
    return response.response_success(
      res,
      response.OK,
      "remove transaction manager success"
    );
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "remove_manager";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_all_employee = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    const transactionSpot = await TransactionSpot.findById(id).populate(
      "transaction_employees"
    );
    if (!transactionSpot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "transaction_spot not found"
      );
    }
    return response.response_success(
      res,
      response.OK,
      transactionSpot.transaction_employees
    );
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_all_employee";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_unconfirmed_transaction = async (req, res) => {
  try {
    const transaction_spot_id = req.params.transaction_spot_id;
    if (!transaction_spot_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    const transaction_spot = await TransactionSpot.findById(
      transaction_spot_id
    );
    if (!transaction_spot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "transaction_spot not found"
      );
    }
    const unconfirmed_transactions = await Transaction.find({
      _id: { $in: transaction_spot.unconfirm_transactions },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(
      res,
      response.OK,
      unconfirmed_transactions
    );
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_unconfirmed_transaction";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_from_client_transaction = async (req, res) => {
  try {
    const transaction_spot_id = req.params.transaction_spot_id;
    if (!transaction_spot_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    const transaction_spot = await TransactionSpot.findById(
      transaction_spot_id
    );
    if (!transaction_spot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "transaction_spot not found"
      );
    }
    const from_client_transactions = await Transaction.find({
      _id: { $in: transaction_spot.from_client_transactions },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(
      res,
      response.OK,
      from_client_transactions
    );
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_to_client_transaction";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_to_client_transaction = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    const transaction_spot = await TransactionSpot.findById(id);
    if (!transaction_spot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "transaction_spot not found"
      );
    }
    const to_client_transactions = await Transaction.find({
      _id: { $in: transaction_spot.to_client_transactions },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(res, response.OK, to_client_transactions);
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_to_client_transaction";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_sending_history = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    const transaction_spot = await TransactionSpot.findById(id);
    if (!transaction_spot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "transaction_spot not found"
      );
    }
    const sending_history = await Transaction.find({
      _id: { $in: transaction_spot.sending_history },
    })
      .populate("sender")
      .populate("receiver")
      .populate("source_transaction_spot")
      .populate("destination_transaction_spot");
    return response.response_success(res, response.OK, sending_history);
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_sending_history";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.send_to_warehouse = async (req, res) => {
  try {
    const { transaction_id, transaction_spot_id } = req.body;
    if (!transaction_id || !transaction_spot_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params"
      );
    }
    const transactionSpot = await TransactionSpot.findById(transaction_spot_id);
    const warehouse = await Warehouse.findById(transactionSpot?.warehouse);
    console.log(warehouse);
    console.log(transactionSpot);
    if (!transactionSpot || !warehouse) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "Transaction spot or warehouse not found"
      );
    }
    await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
      $pull: {
        from_client_transactions: transaction_id,
      },
    });
    await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
      $push: {
        sending_history: {
          time: Date.now(),
          transaction: transaction_id
        },
      },
    });
    await Warehouse.findByIdAndUpdate(warehouse._id, {
      $push: {
        unconfirm_transactions_from_transaction_spot: transaction_id,
      },
    });
    return response.response_success(
      res,
      response.OK,
      "Send to warehouse success"
    );
  } catch (error) {
    error.file = "transaction_spot.js";
    error.function = "send_to_warehouse";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error);
  }
};

exports.confirm_transaction = async (req, res) => {
  try {
    const { transaction_id, transaction_spot_id } = req.body;
    if (!transaction_id || !transaction_spot_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params"
      );
    }
    const transactionSpot = await TransactionSpot.findById(transaction_spot_id);
    if (!transactionSpot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "Transaction spot not found"
      );
    }
    if (
      transactionSpot.unconfirm_transactions.indexOf(transaction_id) == -1
    ) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Transaction not found"
      );
    }
    await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
      $pull: {
        unconfirm_transactions: transaction_id,
      },
    });
    await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
      $push: {
        to_client_transactions: transaction_id,
      },
    });
    await Transaction.findByIdAndUpdate(transaction_id, {
      $push: {
        status: {
          status: "WAITING",
          date: new Date(),
          location: transactionSpot.name,
        },
      },
    });
    return response.response_success(
      res,
      response.OK,
      "Confirm transaction success"
    );
  } catch (error) {
    error.file = "transaction_spot.js";
    error.function = "confirm_transaction";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error);
  }
};

exports.confirm_delivery = async (req, res) => {
  try {
    const { transaction_id, transaction_spot_id, status } = req.body;
    if (!transaction_id || !transaction_spot_id || !status) {
      return response.response_fail(res, response.BAD_REQUEST, "Missing params"
      );
    }
    const transactionSpot = await TransactionSpot.findById(transaction_spot_id);
    if (!transactionSpot) {
      return response.response_fail(res, response.NOT_FOUND, "Transaction spot not found");
    }
    if (transactionSpot.to_client_transactions.indexOf(transaction_id) == -1) {
      return response.response_fail(res,response.BAD_REQUEST,"Transaction not found");
    }
    await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
      $pull: {
        to_client_transactions: transaction_id,
      },
    });
    if (status == "SUCCESS") {
      await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
        $push: {
          success_transactions: {
            transaction: transaction_id,
            time: Date.now(),
          }
        },
      });
      await Transaction.findByIdAndUpdate(transaction_id, {
        $push: {
          status: {
            status: "SUCCESS",
            date: Date.now(),
            location: transactionSpot.name,
          },
        },
        $set: {
          receive_date: Date.now(),
        },
      });
    } else {
      await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
        $push: {
          failed_transactions: {
            transaction: transaction_id,
            time: Date.now(),
          }
        },
      });
      await Transaction.findByIdAndUpdate(transaction_id, {
        $push: {
          status: {
            status: "FAILED",
            date: Date.now(),
            location: transactionSpot.name,
          },
        },
      });
    }
    return response.response_success(
      res,
      response.OK,
      "Confirm delivery success"
    );
  } catch (error) {
    error.file = "transaction_spot.js";
    error.function = "confirm_delivery";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error);
  }
};

exports.delivery = async (req, res) => {
  try {
    const { transaction_id, transaction_spot_id } = req.body;
    if (!transaction_id || !transaction_spot_id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params"
      );
    }
    await TransactionSpot.findByIdAndUpdate(transaction_spot_id, {
      $pull: {
        to_client_transactions: transaction_id,
      },
    });
    return response.response_success(res, "Send to client success");
  } catch (error) {
    error.file = "transaction_spot.js";
    error.function = "send_to_client";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, error);
  }
};

exports.get_sending_history_statistic = async (data) => {
  try {
    if (data.length <= 0) return;
    const result = [data[0]]
    for (let i = 1; i < data.length; i++) {
      const prev_date = new Date(data[i - 1].time);
      const cur_date = new Date(data[i].time);
      
    }
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_sending_history_statistic";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
};

exports.get_statistic = async (req, res) => {
  try {
    const id = req.params.transaction_spot_id;
    if (!id) {
      return response.response_fail(
        res,
        response.BAD_REQUEST,
        "Missing params: transaction_spot_id is required"
      );
    }
    const transactionSpot = await TransactionSpot.findById(id)
      .populate({ path: "sending_history.transaction" })
      .populate({ path: "success_transactions.transaction" })
      .populate({ path: "failed_transactions.transaction" });

    if (!transactionSpot) {
      return response.response_fail(
        res,
        response.NOT_FOUND,
        "transaction_spot not found"
      );
    }
    
    const sending_history_map = {};
    const success_transactions_map = {};
    const failed_transactions_map = {};

    transactionSpot.sending_history.forEach((item) => {
      const date = new Date(item.time);
      const key = (date.getMonth() + 1) + "/" + date.getFullYear();
      if (!sending_history_map[key]) {
        sending_history_map[key] = [item.transaction];
      } else {
        sending_history_map[key].push(item.transaction);
      }
    });

    transactionSpot.success_transactions.forEach((item) => {
      const date = new Date(item.time);
      const key = (date.getMonth() + 1) + "/" + date.getFullYear();
      if (!success_transactions_map[key]) {
        success_transactions_map[key] = [item.transaction];
      } else {
        success_transactions_map[key].push(item.transaction);
      }
    });

    transactionSpot.failed_transactions.forEach((item) => {
      const date = new Date(item.time);
      const key = (date.getMonth() + 1) + "/" + date.getFullYear();
      if (!failed_transactions_map[key]) {
        failed_transactions_map[key] = [item.transaction];
      } else {
        failed_transactions_map[key].push(item.transaction);
      }
    });

    return response.response_success(res, response.OK, {
      sending_history: sending_history_map,
      success_transactions: success_transactions_map,
      failed_transactions: failed_transactions_map,
    });
  } catch (err) {
    err.file = "transaction_spot.js";
    err.function = "get_statistic";
    return response.response_error(res, response.INTERNAL_SERVER_ERROR, err);
  }
}

exports.create_mock_transaction = async (req, res) => {
  const { transaction_spot_id, transaction_id } = req.body;
  if (!transaction_spot_id || !transaction_id) {
    return response.response_fail(
      res,
      response.BAD_REQUEST,
      "Missing params"
    );
  }
}