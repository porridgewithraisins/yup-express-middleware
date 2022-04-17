import * as Yup from "yup";
import type { AssertsShape, ObjectShape, TypeOfShape } from "yup/lib/object";
import type { Request, Response, NextFunction } from "express";
import type { AnyObject, ValidateOptions } from "yup/lib/types";

type AsyncRequestHandler<T> = (
    req: Request<{}, {}, T>,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Validates the request body against the given schema. If validation succeeds, `req.body`
 * Will contain the validated, properly typed body. If validation fails, it will call `next()`
 * with the `ErrorClass` you provide, instantiated with the validation message yup provided.
 *
 * @param schema The schema to validate the request body against
 * @param ErrorClass The error class to instantiate and pass to `next()` if validation fails
 * @param [options] Will be passed through to `schema.validate(req.body, options)`
 * @param [finallyFunction] Will be called after validation has succeeded or failed, for cleanup, etc,.
 * @returns An express request handler
 */
export const validation =
    <T extends ObjectShape>(
        schema: Yup.ObjectSchema<T>,
        ErrorClass: new (message?: string) => Error,
        options?: ValidateOptions<AnyObject>,
        finallyFunction?: CallableFunction
    ): AsyncRequestHandler<AssertsShape<T> | Extract<TypeOfShape<T>, null | undefined>> =>
    async (req, _res, next) => {
        try {
            req.body = await schema.validate(req.body, options);
            next();
        } catch (err: any) {
            next(new ErrorClass(err.errors.join()));
        } finally {
            if (finallyFunction) finallyFunction();
        }
    };
