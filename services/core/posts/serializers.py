from rest_framework import serializers
from .models import Post
from users.serializers import UserSummarySerializer
from drf_spectacular.utils import extend_schema_field


class PostSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    image_url = serializers.ImageField(source="image", read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "image",
            "image_url",
            "caption",
            "created_at",
            "likes_count",
            "is_liked",
        ]
        read_only_fields = ["user", "created_at", "likes_count", "image_url"]
        extra_kwargs = {"image": {"write_only": True, "required": False}}

    @extend_schema_field(bool)
    def get_is_liked(self, obj):
        if hasattr(obj, "is_liked"):
            return bool(obj.is_liked)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    @extend_schema_field(int)
    def get_likes_count(self, obj):
        if hasattr(obj, "likes_count"):
            return int(obj.likes_count)
        return obj.likes.count()
