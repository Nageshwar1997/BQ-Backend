import { UserModule } from "../..";
import { AppError } from "../../../Classes";
import { Configs } from "../../../Configs";

export const rzp_create_order = async (
  user: Omit<UserModule.Types.UserProps, "password">,
  amount: number,
  orderId: string,
) => {
  try {
    const razorpayOrder = await Configs.Razorpay.orders.create({
      amount: amount * 100, // Price in paise
      currency: "INR", // Currency
      receipt: `order_receipt_${Date.now()}_${Math.floor(
        Math.random() * 10000,
      )}`,
      payment_capture: true,
      notes: {
        db_order_id: orderId,
        buyer_id: `${user?._id}`,
        buyer_name: `${user?.firstName} ${user?.lastName}`,
        buyer_email: `${user?.email}`,
        buyer_contact: `${user?.phoneNumber}`,
      },
    });

    return razorpayOrder;
  } catch (error) {
    console.log("Razorpay order creation failed:", error);
    throw new AppError({
      message: "Payment gateway error, please try again later",
      statusCode: 502,
      code: "INTERNAL_ERROR",
    });
  }
};
