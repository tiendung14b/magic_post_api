# magic_post_api

this is api for magic post website

# how to run in local?

If this is the first time you pull this code, or you update new code, before you run this code, you must rebuild project to get all library in your folder.  
To do this, use

### `npm i`

To run server, use

### `npm run server`

To rebuild project, use

### `npm rebuild`

# API

after new api created, i will write a guide how to use it and update in this readme

format of response  
Success:

```javascript
{
  "status": "success"
  "result": {...}
}
```

Fail:

```javascript
{
  "status": "fail"
  "message": "..."
}
```

Error:

```javascript
{
  "status": "error"
  "err": {
    "file": "auth.js"
    "function": "blabla"
  }
}
```

# User route

## `user::Get token`

POST /user/get_token  
body:

```javascript
{
  "phone_number": String
  "password": String
}
```
response: encrypted using JWT, put access_token in header of subsequent request for successful authentication

```javascript
{
  "access_token": String
  ------------------------------
  "status": "success"
  "result": {
    "_id": ObjectId
    "workplace": {
      "workplace_name": String
      "workplace_id": ObjectId
      "role": String
    }
  }
}
```

## `user::get_info`

GET /user/get_info/:id

response:

```javascript
{
  "status": "success",
  "result": {
    "_id": "656d582c883ff1fbdf1dee4e",
    "last_name": "Dung",
    "first_name": "Tien",
    "email": "21021463@vnu.edu.vn",
    "phone_number": "123",
    "workplace": {
      "workplace_name": ["DIRECTOR", "WAREHOUSE", "TRANSACTION"]
      "role": "DIRECTOR",
      "workplace_id": "656d582c883ff1fbdf1dee4f"
      "_id": "656d582c883ff1fbdf1dee4f"
    },
    "__v": 0
  }
}
```
## `user::get_all_manager`

GET /user/get_list_manager

response:

```javascript
{
  //list of manager documents
}
```

## `user::create_manager`

POST /user/manager  
Require director token

body:

```javascript
{
  "last_name": String,
  "first_name": String,
  "email": String,
  "phone_number": String,
  "workplace": {
    "workplace_id": ObjectId,
  },
  "password": hash_password,
}
```

response:

```javascript
{
  //just like get_info
}
```

## `user::create_warehouse_employee`

POST user/warehouse_employee  
Require warehouse manager token

```javascript
{
  "last_name": String,
  "first_name": String,
  "email": String,
  "phone_number": String,
  "workplace": {
    "workplace_id": ObjectId,
  },
  "password": hash_password,
}
```

response: new employee document

## `user::create_transaction_employee`

POST user/transaction_employee  
Require transaction manager token

```javascript
{
  "last_name": String,
  "first_name": String,
  "email": String,
  "phone_number": String,
  "workplace": {
    "workplace_id": ObjectId,
  },
  "password": hash_password,
}
```

response: new employee document

## `user::update_password`

PUT user/password  
Require user token

body: 

```javascript
{
  password: String;
}
```

response: success message

## `user::update_user`

PUT user/:id  
require no token, anyone can change anyone info, security in trashcan

```javascript
{
  'field that want changing': 'some value'
}
```

response: success message

## `user::update_warehouse_employee`

PUT user/warehouse_employee/:user_id  
require warehouse manager token, user_id in request url

request body: 

```javascript
{
  'field that want changing': 'some value'
}
```

response: success message

## `user::update_transaction_employee`

PUT user/transaction_employee/user:id  
require transaction spot manager token, user_id in request url

request body: 

```javascript
{
  'field that want changing': 'some value'
}
```

response: success message

## `user::delete_manager`

DELETE user/manager/:user_id  
require director token, manager id in request url

response: success message

## `user::delete_warehouse_employee`

DELETE user/warehouse_employee/:user_id  
require warehouse manager token, employee id in request url

response: success message

## `user::delete_transaction_employee`

DELETE user/transaction_employee/:user_id  
require transaction manager token, employee id in request url

response: success message

# Warehouse route

## `warehouse::model`

```Javascript
{
  name: String,
  location: String,
  warehouse_manager: ObjectId,
  warehouse_employees: [ObjectId],
  transaction_spots: [ObjectId],
  // current transactions waiting to be delivered to here
  unconfirm_transactions_from_warehouse: [ObjectId],
  unconfirm_transactions_from_transaction_spot: [ObjectId],
  // current transactions inside warehouse to deliver to other place
  inwarehouse_transactions_to_warehouse: [ObjectId],
  inwarehouse_transactions_to_transaction_spot: [ObjectId],
  // history of transactions received from other places
  received_transactions_history: [{
    transaction: ObjectId,
    time: Date
  }],
  // history of transactions sent to other places
  sent_transactions_history: [{
    transaction: ObjectId,
    time: Date
  }]
}
```

## `warehouse::get_my_warehouse`

GET warehouse/my_warehouse  
require warehouse manager token

return warehouse of current manager

response: warehouse document with populated fields: employee, received/sent history, transaction spots

## `warehouse::get_employee_warehouse`

GET warehouse/employee_warehouse  
require warehouse employee token

return warehouse of current employee

response: warehouse document with populated fields: unconfirm transactions, inwarehouse_transactions

## `warehouse::receive_transaction_from_warehouse`

PUT warehouse/transaction_from_warehouse/:transaction_id  
require warehouse employee token, transaction id in request url  

accept transaction from unconfirm_transactions_from_warehouse, put in inwarehouse_transactions  
log received_transactions_history and update transaction.status  

body: no need

response: redirect to warehouse or transaction spot message

## `warehouse::receive_transaction_from_transaction_spot`

PUT warehouse/transaction_from_transaction_spot/:transaction_id  
require warehouse employee token, transaction id in request url  

accept transaction from unconfirm_transactions_from_transaction_spot, put in inwarehouse_transactions  
log received_transactions_history and update transaction.status    

body: no need

response: redirect to warehouse or transaction spot message

## `warehouse::send_transaction_to_warehouse`

PUT warehouse/transaction_to_warehouse/:transaction_id  
require warehouse employee token, transaction id in request url  

send transaction from inwarehouse_transactions_to_warehouse, put in other warehouses'unconfirm_transactions_from_warehouse  
log sent_transactions_history and update transaction.status

body: no need

response: success message

## `warehouse::send_transaction_to_transaction_spot`

PUT warehouse/transaction_to_transaction_spot/:transaction_id  
require warehouse employee token, transaction id in request url  

send transaction from inwarehouse_transactions_to_transaction_spot, put in other transaction spots'unconfirm_transactions  
log sent_transactions_history and update transaction.status

body: no need

response: success message
