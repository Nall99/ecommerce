from decimal import ROUND_HALF_UP, Decimal

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from catalog.models import Product

from .models import Coupon

CENT = Decimal("0.01")
SHIPPING_FLAT = Decimal("19.90")
FREE_SHIPPING_FROM = Decimal("299.00")


def money(value) -> Decimal:
    return Decimal(value).quantize(CENT, rounding=ROUND_HALF_UP)


def brl(value) -> str:
    return f"R$ {money(value):.2f}".replace(".", ",")


def load_lines(items, lock=False):
    """Junta itens repetidos e valida produto ativo e estoque."""
    merged: dict[int, int] = {}
    for item in items:
        merged[item["product_id"]] = merged.get(item["product_id"], 0) + item["quantity"]

    qs = Product.objects.filter(id__in=merged.keys(), is_active=True).order_by("id")
    if lock:
        qs = qs.select_for_update()
    products = {p.id: p for p in qs}

    lines, errors = [], []
    for product_id, qty in merged.items():
        product = products.get(product_id)
        if product is None:
            errors.append("Um dos produtos do carrinho não está mais disponível.")
        elif product.stock == 0:
            errors.append(f"“{product.name}” está esgotado.")
        elif qty > product.stock:
            errors.append(f"“{product.name}”: restam apenas {product.stock} em estoque.")
        else:
            lines.append((product, qty))

    if errors:
        raise ValidationError({"items": errors})
    return lines


def get_coupon(code, subtotal, lock=False):
    code = (code or "").strip().upper()
    if not code:
        return None

    qs = Coupon.objects.select_for_update() if lock else Coupon.objects.all()
    coupon = qs.filter(code=code).first()

    def fail(message):
        raise ValidationError({"coupon_code": [message]})

    if coupon is None or not coupon.is_active:
        fail("Cupom inválido.")
    if coupon.valid_until and coupon.valid_until < timezone.now():
        fail("Este cupom expirou.")
    if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
        fail("Este cupom atingiu o limite de usos.")
    if subtotal < coupon.min_subtotal:
        fail(f"Este cupom vale para compras a partir de {brl(coupon.min_subtotal)}.")
    return coupon


def discount_for(coupon, subtotal) -> Decimal:
    if coupon is None:
        return Decimal("0.00")
    if coupon.kind == Coupon.Kind.PERCENT:
        amount = money(subtotal * coupon.value / Decimal(100))
    else:
        amount = coupon.value
    return money(min(amount, subtotal))  # o desconto nunca passa do subtotal


def calculate(items, coupon_code=None, *, lock=False):
    lines = load_lines(items, lock=lock)
    subtotal = money(sum((p.price * qty for p, qty in lines), Decimal("0")))

    coupon = get_coupon(coupon_code, subtotal, lock=lock)
    discount = discount_for(coupon, subtotal)

    after_discount = subtotal - discount
    shipping = Decimal("0.00") if after_discount >= FREE_SHIPPING_FROM else SHIPPING_FLAT

    return {
        "lines": lines,
        "coupon": coupon,
        "subtotal": subtotal,
        "discount": discount,
        "shipping": shipping,
        "total": money(after_discount + shipping),
    }


def quote_payload(t) -> dict:
    return {
        "items": [
            {
                "product_id": p.id,
                "name": p.name,
                "unit_price": p.price,
                "quantity": qty,
                "line_total": money(p.price * qty),
            }
            for p, qty in t["lines"]
        ],
        "subtotal": t["subtotal"],
        "discount": t["discount"],
        "shipping": t["shipping"],
        "total": t["total"],
        "coupon": (
            {"code": t["coupon"].code, "description": t["coupon"].description}
            if t["coupon"]
            else None
        ),
        "free_shipping_from": FREE_SHIPPING_FROM,
    }