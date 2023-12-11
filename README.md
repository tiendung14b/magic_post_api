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

## `get_token`

url: /user/get_token\n
body:

```javascript
{
  "phone_number": String
  "password": String
}
```

response:

```javascript
{
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

## `get_info`

url: /user/get_info/:id

### `response`:

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
      "role": "DIRECTOR",
      "_id": "656d582c883ff1fbdf1dee4f"
    },
    "__v": 0
  }
}
```
