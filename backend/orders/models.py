from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from catalog.models import Product


class Coupon(models.Model):
    class Kind(models.TextChoices):
        PERCENT = "percent", "Porcentagem"
        FIXED = "fixed", "Valor fixo (R$)"

    code = models.CharField(max_length=40, unique=True)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.PERCENT)
    value = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    min_subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text="Vazio = ilimitado")
    used_count = models.PositiveIntegerField(default=0, editable=False)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    @property
    def description(self):
        if self.kind == self.Kind.PERCENT:
            return f"{self.value.normalize():f}% de desconto"
        return f"R$ {self.value:.2f}".replace(".", ",") + " de desconto"

    def __str__(self):
        return self.code


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Aguardando pagamento"
        PAID = "paid", "Pago"
        CANCELLED = "cancelled", "Cancelado"

    class Payment(models.TextChoices):
        PIX = "pix", "Pix"
        CARD = "card", "Cartão de crédito"
        BOLETO = "boleto", "Boleto"

    customer_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    cep = models.CharField(max_length=8)
    street = models.CharField(max_length=160)
    number = models.CharField(max_length=20)
    complement = models.CharField(max_length=80, blank=True)
    neighborhood = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)

    payment_method = models.CharField(max_length=10, choices=Payment.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    coupon_code = models.CharField(max_length=40, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def order_number(self):
        return f"{self.pk:06d}"

    def __str__(self):
        return f"Pedido #{self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="+")
    product_name = models.CharField(max_length=160)  # cópia do nome na hora da compra
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    @property
    def line_total(self):
        return self.unit_price * self.quantity