from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ServiceViewSet, WorkerProfileViewSet, 
    WorkerRegisterUpdateView, NearbyWorkersView, WorkerAvailabilityViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('services', ServiceViewSet, basename='service')
router.register('availabilities', WorkerAvailabilityViewSet, basename='availability')
router.register('profiles', WorkerProfileViewSet, basename='profile')

urlpatterns = [
    path('nearby', NearbyWorkersView.as_view(), name='workers_nearby'),
    path('register', WorkerRegisterUpdateView.as_view(), name='workers_register'),
    path('', include(router.urls)),
]
