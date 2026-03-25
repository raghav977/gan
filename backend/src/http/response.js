
const http = {
  ok: (res, message = "Success", data = null) =>
    res.status(200).json({ status: 200, message, data }),

  created: (res, message = "Resource created successfully", data = null) =>
    res.status(201).json({ status: 201, message, data }),

  badRequest: (res, message = "Bad Request", errors = null) =>
    res.status(400).json({ status: 400, message, errors }),

  serverError: (res, message = "Internal Server Error", error = null) =>
    res.status(500).json({ status: 500, message, error }),
};

export default http;
