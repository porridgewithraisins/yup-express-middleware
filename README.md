# Yup express middleware

Offers [Yup](https://github.com/jquense/yup) schema validation for Express with first class typescript support.

`npm i yup-express-middleware`

or

`yarn add yup-express-middleware`

## Features

1. `req.body` or `req.query` or `req.params` will be typed according to your validation schema.


## Usage

```ts
import { validation } from "yup-express-middleware";
import * as yup from "yup";
import express from "express";

const app = express();

const schema = yup.object().shape({
    name: yup.string().required(),
    age: yup
        .number()
        .required()
        .transform(val => val + 2),
});

app.post("/", validation(schema), (req, res, next) => {
    const { name, age } = req.body;
    //  string^   ^number => validated, transformed (if the schema did so) and typed correctly
});
```

When validation fails

```ts
class HttpError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

class BadRequestError extends HttpError {
    constructor(message: string) {
        super(message, 400);
    }
}

app.post(
    "/",
    validation(schema, { yupOptions: { abortEarly: false }, ErrorClass: BadRequestError }),
    (req, res, next) => {
        // If validation fails, this won't get called
        // the middleware will call `next(new BadRequestError("the message provided by yup"))`
        // and you will have to catch that in your express error handler.
    }
);

// for example

app.use(((err, req, res, next) => {
    if (res.headersSent) next(err);
    if (err.name === "BadRequestError" /* the name of your custom error */) {
        res.status(err.status).json({
            reason: "Validation Error",
            error: err.message,
        });
    } else {
        //...
    }
}) as ErrorRequestHandler);
```

## API

```

validation(schema, options);

schema: a yup schema

options:

    yupOptions: Options to pass to yup.validate()

    ErrorClass: The error class to throw when validation fails (defaults to `Error`)

    finallyFunction: the function to call regardless of whether validation succeeds or fails)


```
