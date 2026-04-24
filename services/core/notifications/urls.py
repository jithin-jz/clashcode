from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, FCMTokenViewSet

router = DefaultRouter()
router.register(r"fcm-tokens", FCMTokenViewSet, basename="fcm-token")
router.register(r"", NotificationViewSet, basename="notification")


urlpatterns = router.urls
