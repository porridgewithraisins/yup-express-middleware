import * as Yup from "yup";
import type { AssertsShape, ObjectShape, TypeOfShape } from "yup/lib/object";
import type { Request, Response, NextFunction } from "express";
import type { AnyObject, ValidateOptions } from "yup/lib/types";

export type AsyncRequestHandler<Body, Query> = (
    req: Request<{}, {}, Body, Query>,
    res: Response,
    next: NextFunction
) => Promise<any>;

export interface ValidationOptions {
    yupOptions?: ValidateOptions<AnyObject>;
    ErrorClass?: new (message?: string) => Error;
    finallyFunction?: CallableFunction;
}

export interface Schema<Body extends ObjectShape, Query extends ObjectShape> {
    body?: Yup.ObjectSchema<Body>;
    query?: Yup.ObjectSchema<Query>;
}

export type YupReturnType<T extends ObjectShape> =
    | AssertsShape<T>
    | Extract<TypeOfShape<T>, null | undefined>;

export const validation =
    <Body extends ObjectShape, Query extends ObjectShape>(
        schema: Schema<Body, Query>,
        options?: ValidationOptions
    ): AsyncRequestHandler<YupReturnType<Body>, YupReturnType<Query>> =>
    async (req, _res, next) => {
        try {
            if (schema.body) req.body = await schema.body.validate(req.body, options?.yupOptions);
            if (schema.query)
                req.query = await schema.query.validate(req.query, options?.yupOptions);
            next();
        } catch (err: any) {
            const ErrorClass = options?.ErrorClass || Error;
            next(new ErrorClass(err.errors.join()));
        } finally {
            if (options?.finallyFunction) options.finallyFunction();
        }
    };

