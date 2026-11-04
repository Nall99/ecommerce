from django.core.management.base import BaseCommand
from catalog.models import Category, Product

DATA = {
    "Camisetas": [("Camiseta Básica Algodão", "79.90", 40)],
    "Calçados": [("Tênis Urbano Branco", "249.90", 15)],
    "Bolsas": [("Mochila Diária 20L", "189.90", 22)],
    "Acessórios": [("Boné Casual Preto", "59.90", 0)],
}


class Command(BaseCommand):
    help = "Popula o catálogo com dados de exemplo"

    def handle(self, *args, **options):
        for cat_name, items in DATA.items():
            category, _ = Category.objects.get_or_create(name=cat_name)
            for name, price, stock in items:
                Product.objects.get_or_create(
                    name=name,
                    defaults={
                        "category": category,
                        "price": price,
                        "stock": stock,
                        "description": f"{name}: descrição de exemplo.",
                        "image_url": "",
                    },
                )
        self.stdout.write(self.style.SUCCESS("Catálogo populado."))