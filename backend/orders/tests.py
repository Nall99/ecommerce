from decimal import Decimal

from rest_framework.test import APITestCase

from catalog.models import Category, Product

from .models import Coupon, Order

CUSTOMER = dict(
    customer_name="Maria Silva", email="maria@example.com", phone="(73) 99999-9999",
    cep="45650-000", street="Rua A", number="10", neighborhood="Centro",
    city="Ibirataia", state="ba", payment_method="pix",
)


class CheckoutTests(APITestCase):
    def setUp(self):
        cat = Category.objects.create(name="Camisetas")
        self.shirt = Product.objects.create(category=cat, name="Camiseta", price="100.00", stock=5)
        self.shoes = Product.objects.create(category=cat, name="Tênis", price="250.00", stock=1)
        self.coupon = Coupon.objects.create(code="TESTE10", kind="percent", value="10")

    def quote(self, items, coupon=None):
        return self.client.post(
            "/api/cart/quote/", {"items": items, "coupon_code": coupon}, format="json"
        )

    def test_flat_shipping_below_threshold(self):
        res = self.quote([{"product_id": self.shirt.id, "quantity": 2}])
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["shipping"], Decimal("19.90"))
        self.assertEqual(res.data["total"], Decimal("219.90"))

    def test_percent_coupon_and_free_shipping(self):
        items = [
            {"product_id": self.shirt.id, "quantity": 2},
            {"product_id": self.shoes.id, "quantity": 1},
        ]
        res = self.quote(items, "teste10")  # minúsculas também funcionam
        self.assertEqual(res.data["discount"], Decimal("45.00"))
        self.assertEqual(res.data["shipping"], Decimal("0.00"))
        self.assertEqual(res.data["total"], Decimal("405.00"))

    def test_invalid_coupon(self):
        res = self.quote([{"product_id": self.shirt.id, "quantity": 1}], "NAOEXISTE")
        self.assertEqual(res.status_code, 400)
        self.assertIn("coupon_code", res.data)

    def test_order_decrements_stock_and_counts_coupon(self):
        payload = {
            **CUSTOMER,
            "items": [{"product_id": self.shirt.id, "quantity": 2}],
            "coupon_code": "TESTE10",
        }
        res = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(res.status_code, 201)
        self.shirt.refresh_from_db()
        self.coupon.refresh_from_db()
        self.assertEqual(self.shirt.stock, 3)
        self.assertEqual(self.coupon.used_count, 1)
        self.assertEqual(res.data["total"], "199.90")  # 200 - 20 + 19,90 de frete

    def test_order_rejected_without_stock(self):
        payload = {**CUSTOMER, "items": [{"product_id": self.shoes.id, "quantity": 2}]}
        res = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(res.status_code, 400)
        self.shoes.refresh_from_db()
        self.assertEqual(self.shoes.stock, 1)
        self.assertEqual(Order.objects.count(), 0)