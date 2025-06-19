import { isCelebrateError } from 'celebrate';

export const notFoundHandler = (req, res) => {
    res.status(404).send('Not Found');
}

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    if (isCelebrateError(err)) {
        const errorMessages = {};
        err.details.forEach((value, key) => {
            errorMessages[key] = value.details.map(detail => detail.message);
        });

        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Validation failed',
            details: errorMessages
        });
    }

    if (!res.headersSent) {
        res.status(err.status || 500).json({
            status: 'error',
            code: err.status || 500,
            message: err.message || 'Internal Server Error'
        })
    }
}
