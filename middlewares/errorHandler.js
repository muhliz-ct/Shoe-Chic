// errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Check the type of error
    if (err instanceof SyntaxError) {
        res.status(400).send('Invalid JSON in request body');
    } else if (err.name === 'ValidationError') {
        res.status(422).send('Validation error: ' + err.message);
    } else {
        // Default error response
        res.status(500).send('<h1 class="text-danger">Something went wrong!</h1>');
    }
};

module.exports = errorHandler;
