from django.urls import path

from .views import OrderCreateView, QuoteView

urlpatterns = [
    path("cart/quote/", QuoteView.as_view(), name="cart-quote"),
    path("orders/", OrderCreateView.as_view(), name="order-create"),
]