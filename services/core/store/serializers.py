from rest_framework import serializers
from .models import StoreItem, Purchase
from drf_spectacular.utils import extend_schema_field


class StoreItemSerializer(serializers.ModelSerializer):
    is_owned = serializers.SerializerMethodField()

    class Meta:
        model = StoreItem
        fields = [
            "id",
            "name",
            "description",
            "cost",
            "icon_name",
            "category",
            "image",
            "item_data",
            "is_active",
            "featured",
            "is_owned",
        ]

    @extend_schema_field(bool)
    def get_is_owned(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Purchase.objects.filter(user=request.user, item=obj).exists()
        return False
