from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .pricing import calculate, quote_payload
from .serializers import OrderCreateSerializer, OrderSerializer, QuoteInputSerializer
from .services import create_order


class QuoteView(generics.GenericAPIView):
    """Calcula subtotal, cupom, frete e total sem criar pedido."""

    serializer_class = QuoteInputSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        totals = calculate(data["items"], data.get("coupon_code"))
        return Response(quote_payload(totals))


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = create_order(serializer.validated_data)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)