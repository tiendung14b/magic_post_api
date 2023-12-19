# magic_post_api

this is api for magic post website

# how to run in local?

If this is the first time you pull this code, or you update new code, before you run this code, you must rebuild project to get all library in your folder. \n
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

## `user::Get token`

POST /user/get_token\n
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

POST /user/manager\n
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

## `user::update_password`

PUT user/password
Require user token

```javascript
{
  password: String;
}
```

## `user::update_user`

PUT user/user
require director token

```javascript
{
}
```
## `user::update_warehouse_employee`

PUT user/warehouse_employee
require warehouse manager token, user_id in request body

request body: 

```javascript
{
  'user_id': ObjectId,
  'field that want changing': 'some value'
}
```

response: the old document of warehouse

## `user::update_transaction_employee`

PUT user/transaction_employee
require transaction spot manager token, user_id in request body

request body: 

```javascript
{
  'user_id': ObjectId,
  'field that want changing': 'some value'
}
```

response: the old document of transaction spot

