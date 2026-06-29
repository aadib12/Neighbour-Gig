from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, UserBookingsView

router = DefaultRouter()
router.register('', BookingViewSet, basename='booking')

urlpatterns = [
    path('user/', UserBookingsView.as_view(), name='user_bookings'),
    path('', include(router.urls)),
]
