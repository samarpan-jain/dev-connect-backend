const apiResponse = (res, statusCode, message, data = null) => {
    const response = {
        code: statusCode,
        message,
    };
    if (data) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

module.exports = apiResponse;