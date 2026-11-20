# Trama — E-commerce full stack

Loja virtual completa com **Django REST Framework** no back-end e **Angular + Tailwind CSS** no front-end. Projeto de portfólio, com foco em regras de negócio no servidor, boa experiência de uso e deploy em produção.

| | |
|---|---|
| **Site** | https://ecommerce-blond-phi.vercel.app |
| **API (Swagger)** | https://backend-gm9o.onrender.com/api/docs/ |
| **Repositório** | https://github.com/Nall99/ecommerce |

> **Aviso:** o back-end roda em um plano gratuito, que pode colocar o serviço em repouso quando fica sem uso. O primeiro acesso depois de um tempo pode levar cerca de um minuto para responder.

<!-- Adicione aqui capturas de tela: home, listagem, detalhe, carrinho e checkout -->
<!-- ![Home](docs/home.png) -->

## Funcionalidades

**Catálogo**
- Listagem com busca, filtro por categoria, ordenação (preço, nome, mais recentes) e paginação
- Filtros guardados na URL: links compartilháveis e botão voltar funcionando
- Página de produto com estoque, quantidade e aviso de poucas unidades
- Estados de carregamento (skeleton), de erro e de lista vazia

**Carrinho e cupons**
- Carrinho persistido no navegador, com limite de quantidade pelo estoque
- Alerta (SweetAlert2) ao adicionar: continuar comprando ou ir ao carrinho
- Cupons de desconto (percentual ou valor fixo), validados pelo servidor
- Frete e total calculados pela API, com aviso de quanto falta para frete grátis

**Checkout e pedidos**
- Formulário reativo com validação e preenchimento automático do endereço pelo CEP (ViaCEP)
- Pagamento simulado (Pix, cartão ou boleto), sem coleta de dados de cartão
- Criação do pedido em transação, baixa de estoque e contagem de uso do cupom
- Página de confirmação do pedido

**Administração**
- Painel do Django para categorias, produtos, cupons e pedidos

## Stack

| Camada | Tecnologias |
|---|---|
| Back-end | Python 3.12, Django, Django REST Framework, django-filter, drf-spectacular, django-cors-headers, WhiteNoise, Gunicorn |
| Banco de dados | PostgreSQL (Supabase) |
| Front-end | Angular (standalone components, signals, lazy loading), Tailwind CSS v4, SweetAlert2 |
| Deploy | Render (API), Vercel (front-end) |

## Decisões técnicas

- **O servidor é a fonte da verdade.** O Angular envia apenas `[{product_id, quantity}]` e o código do cupom. Preços, desconto, frete, total e estoque são recalculados no back-end, porque valores guardados no navegador não são confiáveis.
- **Sem venda duplicada de estoque.** A criação do pedido roda em transação com `select_for_update`, travando produtos e cupom até o fim.
- **Histórico de pedido imutável.** Cada item guarda o nome e o preço da hora da compra, então mudanças futuras no catálogo não alteram pedidos antigos.
- **Regras de preço isoladas** em `orders/pricing.py`, usadas tanto pela cotação (`/cart/quote/`) quanto pela criação do pedido, garantindo que o valor mostrado seja o valor cobrado.
- **Cotação reativa no front-end.** Um serviço com signals e RxJS (`debounceTime` + `switchMap`) refaz a cotação sempre que o carrinho ou o cupom mudam.
- **Configuração por variáveis de ambiente**, com o mesmo código rodando local e em produção.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/categories/` | Lista de categorias |
| GET | `/api/products/` | Produtos (`search`, `category`, `min_price`, `max_price`, `in_stock`, `ordering`, `page`) |
| GET | `/api/products/{slug}/` | Detalhe do produto |
| POST | `/api/cart/quote/` | Calcula subtotal, cupom, frete e total |
| POST | `/api/orders/` | Cria o pedido |
| GET | `/api/docs/` | Documentação interativa (Swagger) |

**Regras de exemplo:** frete de R$ 19,90, grátis quando o subtotal, já com o desconto, chega a R$ 299,00. Cupons de teste: `BEMVINDO10` (10%) e `MENOS20` (R$ 20 em compras a partir de R$ 150).

## Estrutura

```
ecommerce/
├── backend/
│   ├── config/          # settings, urls, wsgi
│   ├── catalog/         # categorias e produtos
│   ├── orders/          # cupons, pedidos, preços e serviços
│   ├── build.sh         # build do Render
│   └── requirements.txt
└── frontend/
    ├── public/          # arquivos estáticos
    ├── vercel.json      # rewrite das rotas da SPA
    └── src/
        ├── environments/
        └── app/
            ├── core/        # models, services, guards, utils
            ├── shared/      # header, card de produto, totais
            └── features/    # home, catalog, cart, checkout
```

## Como rodar localmente

**Pré-requisitos:** Python 3.12+, Node.js e Angular CLI (`npm install -g @angular/cli`).

### Back-end

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # edite os valores
python manage.py migrate
python manage.py seed              # produtos de exemplo
python manage.py seed_coupons      # cupons de exemplo
python manage.py createsuperuser
python manage.py runserver
```

Variáveis do `backend/.env`:

| Variável | Exemplo | Descrição |
|---|---|---|
| `SECRET_KEY` | `troque-isto` | Chave secreta do Django |
| `DEBUG` | `True` | Use `False` em produção |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hosts permitidos |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Origens do front-end, sem barra final |
| `DATABASE_URL` | `sqlite:///db.sqlite3` | Banco (SQLite local ou string do PostgreSQL) |
| `IMAGE_BASE_URL` | `http://localhost:4200/products` | Base das imagens usadas pelo `seed` |

A API fica em `http://localhost:8000/api/` e o Swagger em `http://localhost:8000/api/docs/`.

### Front-end

```bash
cd frontend
npm install
ng serve
```

Acesse `http://localhost:4200`. A URL da API fica em `src/environments/` (`environment.development.ts` para desenvolvimento e `environment.ts` para produção).

### Testes

```bash
cd backend
python manage.py test
```

Os testes cobrem cálculo de frete, cupons (válido, inválido e com frete grátis), baixa de estoque e rejeição de pedido sem estoque.

## Deploy

**Back-end no Render** (Web Service, Root Directory `backend`)

- Build Command: `bash build.sh`
- Start Command: `gunicorn config.wsgi:application`
- Variáveis: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL` (string do *Session pooler* do Supabase), `CORS_ALLOWED_ORIGINS` (URL do front-end) e, se quiser criar o admin no build, `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL` e `DJANGO_SUPERUSER_PASSWORD`

**Front-end na Vercel** (Root Directory `frontend`)

- Preset Angular; Output Directory `dist/frontend/browser` caso não seja detectado
- `vercel.json` com rewrite para `index.html`, necessário para as rotas da SPA funcionarem ao recarregar a página
- `apiUrl` de produção em `src/environments/environment.ts`, apontando para a API com o prefixo `/api`

## Limitações conhecidas

- O pagamento é simulado: nenhuma cobrança real é feita e nenhum e-mail é enviado
- O checkout é público (sem login); os pedidos ainda não pertencem a um usuário
- As imagens dos produtos são links externos

## Próximos passos

- [ ] Autenticação com JWT (cadastro, login e área "Meus pedidos")
- [ ] Menu responsivo e busca no celular
- [ ] Limite de requisições (*throttling*) no endpoint de pedidos
- [ ] Integração com gateway de pagamento em modo de teste
- [ ] Testes automatizados no front-end

## Autor

Feito por **Nall99** — https://github.com/Nall99
