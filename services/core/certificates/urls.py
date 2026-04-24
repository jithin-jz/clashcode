from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CertificateViewSet

router = DefaultRouter()
router.register(r"certificates", CertificateViewSet, basename="certificate")

urlpatterns = [
    path("", include(router.urls)),
]
