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

## `get_token`

url: baseurl/user/get_token
body:

```javascript
{
  "phone_number": String
  "password": String
}
```
response: encrypted using JWT, put this in header of subsequent request for successful authentication

```javascript
{
  "access_token": String
}
```
