from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema, OpenApiTypes, inline_serializer
from django.db.models import BooleanField, Count, Exists, OuterRef, Value
from .models import Post
from .serializers import PostSerializer
from .permissions import IsOwnerOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing posts.
    """

    queryset = Post.objects.all().select_related("user", "user__profile")
    serializer_class = PostSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = (
            super().get_queryset().annotate(likes_count=Count("likes", distinct=True))
        )
        if self.request.user.is_authenticated:
            like_exists = Post.likes.through.objects.filter(
                post_id=OuterRef("pk"), user_id=self.request.user.id
            )
            queryset = queryset.annotate(is_liked=Exists(like_exists))
        else:
            queryset = queryset.annotate(
                is_liked=Value(False, output_field=BooleanField())
            )
        username = self.request.query_params.get("username")
        if username:
            queryset = queryset.filter(user__username=username)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name="PostLikeResponse",
                fields={
                    "is_liked": serializers.BooleanField(),
                    "likes_count": serializers.IntegerField(),
                },
            )
        },
        description="Toggle like/unlike on a specific post.",
    )
    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def like(self, request, pk=None):
        post = self.get_object()
        like_qs = post.likes.through.objects.filter(
            post_id=post.id, user_id=request.user.id
        )
        if like_qs.exists():
            like_qs.delete()
            liked = False
        else:
            post.likes.add(request.user)
            liked = True

        return Response(
            {"is_liked": liked, "likes_count": post.likes.count()},
            status=status.HTTP_200_OK,
        )
