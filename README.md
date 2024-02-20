# myplace_api
Make API requests directly to MyPlace through a simple script and get detailed JSON responses.

## Overview
This repo consists of 2 main Node.JS scripts, one for the MyPlace APIs `m_api.js` and the other for examples on how to use it `usage.js`.

`m_api.js` is a convenient wrapper  for accessing useful APIs from MyPlace. MyPlace is a platform that offers various services, and this script focuses on extracting and utilising the key functionalities through its APIs.

This comes in handy when you're unable to use the Strath app or if you're working on a small project.

## Quick Start
Set your username and password in `usage.js` then run the script using node:
```
node usage.js
```

## Generating Barcodes
This needs a third-party library `bwip-js`, which can be installed using npm:
```
npm i bwip-js
```
The `usage.js` script has an example on how to generate these:
```js
await barcode_gen.CreateStudentBarcode(12345678901234, "./student_card/barcode.png");
```

![image](https://github.com/mohfez/myplace-api/assets/150836596/5498799b-4e04-448e-a8b8-e5fb692b8a24)


## 🔴IMPORTANT🔴
You should NEVER share your token id, device id, library number or any other personal information with anyone.

For example, it is very easy for someone to log into your account if they have your token id and device id.

Same with your library number, it can easily be used to replicate your card's barcode. This is also one of the reasons why the app does not allow screenshots when viewing your card, although it can be bypassed pretty easily.
