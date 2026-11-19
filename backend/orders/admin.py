from django.contrib import admin

from .models import Coupon, Order, OrderItem


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["code", "kind", "value", "min_subtotal", "used_count", "max_uses", "is_active"]
    list_filter = ["kind", "is_active"]
    readonly_fields = ["used_count"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    readonly_fields = ["product", "product_name", "unit_price", "quantity"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer_name", "total", "payment_method", "status", "created_at"]
    list_filter = ["status", "payment_method"]
    search_fields = ["customer_name", "email"]
    inlines = [OrderItemInline]