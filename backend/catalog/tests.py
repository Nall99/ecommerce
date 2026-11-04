from django.test import TestCase

# Create your tests here.
from rest_framework.test import APITestCase
from .models import Category, Product


class ProductAPITests(APITestCase):
    def setUp(self):
        cat = Category.objects.create(name="Calçados")
        Product.objects.create(category=cat, name="Tênis A", price="100.00", stock=5)
        Product.objects.create(category=cat, name="Tênis B", price="300.00", stock=0)
        Product.objects.create(
            category=cat, name="Oculto", price="50.00", stock=1, is_active=False
        )

    def test_lists_only_active_products(self):
        res = self.client.get("/api/products/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["count"], 2)

    def test_filter_by_max_price(self):
        res = self.client.get("/api/products/?max_price=150")
        self.assertEqual(res.json()["count"], 1)

    def test_detail_by_slug(self):
        res = self.client.get("/api/products/tenis-a/")
        self.assertEqual(res.json()["name"], "Tênis A")