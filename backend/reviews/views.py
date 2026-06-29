from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer
from notifications.models import Notification

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        booking = serializer.validated_data['booking']
        
        # Verify the user is the customer of the booking
        if booking.customer.user != user:
            raise PermissionDenied("You can only review bookings you have created.")
            
        review = serializer.save(
            customer=booking.customer,
            worker=booking.worker
        )
        
        # Notify the worker
        Notification.objects.create(
            user=booking.worker.user,
            title="New Review Received",
            message=f"You received a {review.rating}-star review from {user.first_name}.",
            notification_type='REVIEW'
        )
