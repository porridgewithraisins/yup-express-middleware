import { validation } from ".";
import * as Yup from "yup";
import type { Request, Response } from "express";

test("Body that passes validation should be passed through", async () => {
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        age: Yup.number()
            .required()
            .transform(val => val + 2),
    });

    const handler = validation({ body: schema }, { yupOptions: { abortEarly: false } });

    const req = {
        body: {
            name: "John",
            age: 30,
        },
    };

    const res = {};

    const next = jest.fn();

    await handler(req as any, res as Response, next);

    expect(req.body).toEqual({
        name: "John",
        age: 32,
    });
});

test("Query that fails validation should throw the custom error, and original query should not be modified", async () => {
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        age: Yup.number()
            .min(3)
            .max(5, "Too old")
            .required()
            .transform(val => val + 2),
    });

    class CustomError extends Error {
        constructor(message?: string) {
            super(message);
            this.name = "CustomError";
        }
    }

    const handler = validation({ query: schema }, { ErrorClass: CustomError });

    const req = {
        query: {
            name: "John",
            age: "6",
        },
    };

    const res = {};

    const next = jest.fn();

    await handler(req as any, res as Response, next);

    expect(next).toHaveBeenCalledWith(new CustomError("Too old"));
    expect(req.query).toEqual({
        name: "John",
        age: "6",
    });
});
