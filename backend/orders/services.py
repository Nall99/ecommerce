from django.db import transaction
from django.db.models import F

from catalog.models import Product

from .models import Coupon, Order, OrderItem
from .pricing import calculate


@transaction.atomic
def create_order(data) -> Order:
    # lock=True trava as linhas de produto e cupom até o fim da transação,
    # evitando vender o mesmo estoque para duas pessoas ao mesmo tempo.
    totals = calculate(data["items"], data.get("coupon_code"), lock=True)
    coupon = totals["coupon"]

    order = Order.objects.create(
        customer_name=data["customer_name"],
        email=data["email"],
        phone=data["phone"],
        cep=data["cep"],
        street=data["street"],
        number=data["number"],
        complement=data.get("complement", ""),
        neighborhood=data["neighborhood"],
        city=data["city"],
        state=data["state"],
        payment_method=data["payment_method"],
        subtotal=totals["subtotal"],
        discount=totals["discount"],
        shipping=totals["shipping"],
        total=totals["total"],
        coupon_code=coupon.code if coupon else "",
    )

    OrderItem.objects.bulk_create(
        OrderItem(
            order=order,
            product=product,
            product_name=product.name,
            unit_price=product.price,
            quantity=qty,
        )
        for product, qty in totals["lines"]
    )

    for product, qty in totals["lines"]:
        Product.objects.filter(pk=product.pk).update(stock=F("stock") - qty)

    if coupon:
        Coupon.objects.filter(pk=coupon.pk).update(used_count=F("used_count") + 1)

    return order