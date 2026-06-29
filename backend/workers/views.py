import math
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import F, Value, FloatField
from django.db.models.functions import ACos, Cos, Radians, Sin

from accounts.models import User
from .models import Category, Service, WorkerProfile, WorkerAvailability, QRCodeMapping
from .serializers import (
    CategorySerializer, ServiceSerializer, WorkerProfileSerializer,
    WorkerProfileCreateUpdateSerializer, WorkerAvailabilitySerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsWorkerOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj.worker_profile.user == request.user

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

class WorkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WorkerProfile.objects.filter(is_available=True)
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(user__role='WORKER').filter(
                # Filter worker profiles that belong to the specified category
                # through matching services booked/offered if service category slug matches
                id__in=Service.objects.filter(category__slug=category_slug).values_list('id', flat=True) # or keep it simple
            )
        return queryset

class WorkerRegisterUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.worker_profile
            serializer = WorkerProfileSerializer(profile)
            return Response(serializer.data)
        except WorkerProfile.DoesNotExist:
            return Response({"detail": "Worker profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        if request.user.role != 'WORKER':
            return Response({"detail": "Only workers can register worker profiles."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.worker_profile
            serializer = WorkerProfileCreateUpdateSerializer(profile, data=request.data)
        except WorkerProfile.DoesNotExist:
            serializer = WorkerProfileCreateUpdateSerializer(data=request.data)
            
        if serializer.is_valid():
            profile = serializer.save(user=request.user)
            # Create QR mapping automatically if not exists
            QRCodeMapping.objects.get_or_create(worker=profile)
            
            res_serializer = WorkerProfileSerializer(profile)
            return Response(res_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        try:
            profile = request.user.worker_profile
        except WorkerProfile.DoesNotExist:
            return Response({"detail": "Worker profile not found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = WorkerProfileCreateUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            profile = serializer.save()
            res_serializer = WorkerProfileSerializer(profile)
            return Response(res_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NearbyWorkersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 5.0)  # default 5km

        if not lat or not lng:
            return Response(
                {"detail": "latitude ('lat') and longitude ('lng') parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_lat = float(lat)
            user_lng = float(lng)
            radius = float(radius)
        except ValueError:
            return Response(
                {"detail": "Coordinates and radius must be valid numbers."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Haversine formula
        # distance = 6371 * acos(cos(radians(user_lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(user_lng)) + sin(radians(user_lat)) * sin(radians(latitude)))
        # Note: Math functions are supported in PostgreSQL and SQLite (with math extension enabled)
        R = 6371.0  # Earth's radius in km
        
        # We annotate all worker profiles with distance and filter
        # Ensure lat/lng are populated
        workers = WorkerProfile.objects.filter(
            is_available=True,
            latitude__isnull=False,
            longitude__isnull=False
        ).annotate(
            distance=R * ACos(
                Cos(Radians(user_lat)) * Cos(Radians(F('latitude'))) *
                Cos(Radians(F('longitude')) - Radians(user_lng)) +
                Sin(Radians(user_lat)) * Sin(Radians(F('latitude')))
            )
        ).filter(distance__lte=radius).order_by('distance')

        serializer = WorkerProfileSerializer(workers, many=True)
        return Response(serializer.data)

class WorkerAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Workers can only CRUD their own, others can view
        if self.request.user.role == 'WORKER':
            try:
                profile = self.request.user.worker_profile
                return WorkerAvailability.objects.filter(worker_profile=profile)
            except WorkerProfile.DoesNotExist:
                return WorkerAvailability.objects.none()
        return WorkerAvailability.objects.all()

    def perform_create(self, serializer):
        try:
            profile = self.request.user.worker_profile
            serializer.save(worker_profile=profile)
        except WorkerProfile.DoesNotExist:
            raise serializers.ValidationError({"detail": "Worker profile must be created first."})
