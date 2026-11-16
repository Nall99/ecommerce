from django.core.management.base import BaseCommand
from catalog.models import Category, Product


# (nome, preço, estoque, descrição, seed da imagem)
DATA = {
    "Camisetas": [
        ("Camiseta Básica Algodão", "79.90", 40,
         "Camiseta de algodão macio, corte reto e gola reforçada. Combina com tudo.", 
         "https://m.media-amazon.com/images/I/41pyCcOCnRL._AC_SX569_.jpg"),
        ("Camiseta Oversized Preta", "99.90", 25,
         "Modelagem ampla e caimento solto, em malha encorpada que não desbota.", 
         "https://m.media-amazon.com/images/I/51qWkffuEtL._AC_SX569_.jpg"),
        ("Camiseta Listrada Manga Longa", "119.90", 12,
         "Manga longa em malha leve, com listras discretas para o dia a dia.", 
         "https://m.media-amazon.com/images/I/71urazBmQ+L._AC_SX569_.jpg"),
        ("Regata Esportiva Dry", "69.90", 10,
         "Tecido de secagem rápida, ideal para treinos e dias quentes.", 
         "https://m.media-amazon.com/images/I/51lX11W70CL._AC_SX569_.jpg"),
    ],
    "Calçados": [
        ("Tênis Urbano Branco", "249.90", 15,
         "Tênis casual branco com solado emborrachado e palmilha acolchoada.", 
         "https://m.media-amazon.com/images/I/41m1epz6p2L._AC_SY575_.jpg"),
        ("Tênis Corrida Leve", "329.90", 8,
         "Cabedal respirável e entressola com amortecimento para corridas curtas.", 
         "https://m.media-amazon.com/images/I/7121w2pCu3L._AC_SY575_.jpg"),
        ("Sandália Slide Conforto", "89.90", 30,
         "Slide com palmilha anatômica, prática para casa, praia ou piscina.", 
         "https://m.media-amazon.com/images/I/41t5QNyQt9L._AC_SY575_.jpg"),
        ("Bota Casual Marrom", "289.90", 3,
         "Bota em couro sintético com acabamento costurado e solado antiderrapante.", 
         "https://m.media-amazon.com/images/I/61EvPmfTiJL._AC_SX575_.jpg"),
    ],
    "Bolsas": [
        ("Mochila Diária 20L", "189.90", 22,
         "Mochila de 20 litros com compartimento acolchoado para notebook.", 
         "https://m.media-amazon.com/images/I/812Sl+IaecL._AC_SX569_.jpg"),
        ("Bolsa Transversal", "139.90", 18,
         "Bolsa compacta com alça ajustável e bolso interno com zíper.", 
         "https://m.media-amazon.com/images/I/515JrrhRO3L._AC_SX569_.jpg"),
        ("Pochete Utilitária", "79.90", 0,
         "Pochete com dois compartimentos, para levar o essencial com as mãos livres.", 
         "https://m.media-amazon.com/images/I/51nA+gOAjZL._AC_SX679_.jpg"),
        ("Sacola Tote de Lona", "99.90", 35,
         "Sacola de lona resistente, espaçosa e com fundo reforçado.", 
         "https://m.media-amazon.com/images/I/412qvunD5YL._AC_SX569_.jpg"),
    ],
    "Acessórios": [
        ("Boné Casual Preto", "59.90", 0,
         "Boné de aba curva com regulagem traseira e tecido que não amassa.", 
         "https://m.media-amazon.com/images/I/61ffDYjXRfL._AC_SX569_.jpg"),
        ("Cinto Couro Clássico", "109.90", 20,
         "Cinto de couro com fivela metálica discreta, para uso formal ou casual.", 
         "https://m.media-amazon.com/images/I/71d5tiZaDEL._AC_SX569_.jpg"),
        ("Óculos de Sol Retrô", "149.90", 14,
         "Armação leve em acetato e lentes com proteção UV400.", 
         "https://m.media-amazon.com/images/I/41rvWhbaR+L._AC_SX522_.jpg"),
        ("Smartwatch Samsung", "179.90", 60,
         "Smartwatch com tela AMOLED e bateria de longa duração.", 
         "https://m.media-amazon.com/images/I/61o3-pf41tL._AC_SX522_.jpg"),
    ],
}


class Command(BaseCommand):
    help = "Popula o catálogo com dados de exemplo"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Apaga todos os produtos antes de popular",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Product.objects.all().delete()
            self.stdout.write(f"{deleted} registro(s) removido(s).")

        created_count = updated_count = 0

        for cat_name, items in DATA.items():
            category, _ = Category.objects.get_or_create(name=cat_name)
            for name, price, stock, description, img in items:
                _, created = Product.objects.update_or_create(
                    name=name,
                    defaults={
                        "category": category,
                        "price": price,
                        "stock": stock,
                        "description": description,
                        "image_url": img,
                        "is_active": True,
                    },
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Catálogo populado: {created_count} criado(s), {updated_count} atualizado(s)."
            )
        )