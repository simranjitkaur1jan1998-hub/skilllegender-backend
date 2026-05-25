const Razorpay = require("razorpay");
const crypto = require("crypto");
const requestModel = require("../request/requestModel");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder",
});

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await requestModel.findById(requestId).populate("sessionId");

    if (!request) {
      return res.send({ success: false, message: "Request not found" });
    }

    if (request.status !== "accepted") {
      return res.send({ success: false, message: "Session not yet approved by mentor" });
    }

    const options = {
      amount: request.sessionId.price * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_${requestId}`,
    };

    const order = await instance.orders.create(options);

    res.send({
      success: true,
      data: order,
    });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment successful
      await requestModel.findByIdAndUpdate(requestId, {
        paymentStatus: "paid",
      });

      res.send({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      res.send({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
