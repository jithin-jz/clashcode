from rest_framework import serializers
from .models import Post
from users.serializers import UserSummarySerializer


class PostSerializer(serializers.ModelSerializer):
    """Serializer for individual posts with user details and social stats."""
    user = UserSummarySerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "image",
            "caption",
            "likes_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at", "likes_count", "is_liked"]


class PostLikeResponseSerializer(serializers.Serializer):
    """Serializer for the response after toggling a like on a post."""
    is_liked = serializers.BooleanField(help_text="True if the post is now liked by the user.")
    likes_count = serializers.IntegerField(help_text="The updated total number of likes on the post.")
