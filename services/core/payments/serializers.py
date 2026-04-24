from rest_framework import serializers


class CreateOrderSerializer(serializers.Serializer):
    amount = serializers.IntegerField(
        min_value=1, help_text="Amount in INR (e.g. 49, 99, 199)."
    )


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField(
        help_text="The order ID returned by Razorpay when the order was created."
    )
    razorpay_payment_id = serializers.CharField(
        help_text="The payment ID returned by Razorpay after a successful payment."
    )
    razorpay_signature = serializers.CharField(
        help_text="The signature returned by Razorpay to verify the payment authenticity."
    )
