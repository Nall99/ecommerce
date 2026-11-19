from django.core.management.base import BaseCommand

from orders.models import Coupon

COUPONS = [
    {"code": "BEMVINDO10", "kind": "percent", "value": "10", "min_subtotal": "0"},
    {"code": "MENOS20", "kind": "fixed", "value": "20", "min_subtotal": "150"},
]


class Command(BaseCommand):
    help = "Cria cupons de exemplo (não altera cupons que já existem)"

    def handle(self, *args, **options):
        for data in COUPONS:
            code = data.pop("code")
            Coupon.objects.get_or_create(code=code, defaults=data)
        self.stdout.write(self.style.SUCCESS("Cupons criados: BEMVINDO10 e MENOS20."))