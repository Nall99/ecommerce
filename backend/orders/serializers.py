import re

from rest_framework import serializers

from .models import Order, OrderItem


class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=99)


class QuoteInputSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True, allow_empty=False)
    coupon_code = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, max_length=40
    )


class OrderCreateSerializer(QuoteInputSerializer):
    customer_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    cep = serializers.CharField(max_length=12)
    street = serializers.CharField(max_length=160)
    number = serializers.CharField(max_length=20)
    complement = serializers.CharField(max_length=80, required=False, allow_blank=True)
    neighborhood = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=2)
    payment_method = serializers.ChoiceField(choices=Order.Payment.choices)

    def validate_phone(self, value):
        digits = re.sub(r"\D", "", value)
        if len(digits) not in (10, 11):
            raise serializers.ValidationError("Telefone inválido.")
        return digits

    def validate_cep(self, value):
        digits = re.sub(r"\D", "", value)
        if len(digits) != 8:
            raise serializers.ValidationError("CEP inválido.")
        return digits

    def validate_state(self, value):
        value = value.strip().upper()
        if len(value) != 2 or not value.isalpha():
            raise serializers.ValidationError("Use a sigla do estado, como BA.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["product_name", "unit_price", "quantity", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "customer_name", "email", "payment_method", "status",
            "subtotal", "discount", "shipping", "total", "coupon_code",
            "created_at", "items",
        ]