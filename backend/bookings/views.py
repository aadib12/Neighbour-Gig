from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404

from notifications.models import Notification
from customers.models import CustomerProfile
from workers.models import WorkerProfile
from .models import Booking, BookingStatusHistory
from .serializers import BookingSerializer, BookingCreateSerializer

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Booking.objects.all().order_by('-created_at')
        elif user.role == 'WORKER':
            try:
                profile = user.worker_profile
                return Booking.objects.filter(worker=profile).order_by('-created_at')
            except WorkerProfile.DoesNotExist:
                return Booking.objects.none()
        elif user.role == 'CUSTOMER':
            try:
                profile = user.customer_profile
                return Booking.objects.filter(customer=profile).order_by('-created_at')
            except CustomerProfile.DoesNotExist:
                return Booking.objects.none()
        return Booking.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        full_serializer = BookingSerializer(serializer.instance)
        headers = self.get_success_headers(serializer.data)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'CUSTOMER':
            raise PermissionDenied("Only customers can create bookings.")
        
        try:
            customer_profile = user.customer_profile
        except CustomerProfile.DoesNotExist:
            customer_profile = CustomerProfile.objects.create(user=user)
            
        booking = serializer.save(customer=customer_profile)
        
        # Notify the worker
        Notification.objects.create(
            user=booking.worker.user,
            title="New Booking Request",
            message=f"You have received a booking request from {user.first_name} for {booking.booking_date}.",
            notification_type='BOOKING'
        )

    @decorators.action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
        
        if not new_status or new_status not in valid_statuses:
            raise ValidationError({"status": f"Must be one of {valid_statuses}."})
            
        user = request.user
        old_status = booking.status

        # Permission check based on roles
        if user.role == 'WORKER':
            if booking.worker.user != user:
                raise PermissionDenied("You do not have permission to manage this booking.")
            if new_status not in ['ACCEPTED', 'REJECTED', 'COMPLETED']:
                raise ValidationError({"status": "Workers can only accept, reject, or complete a booking."})
        elif user.role == 'CUSTOMER':
            if booking.customer.user != user:
                raise PermissionDenied("You do not have permission to manage this booking.")
            if new_status != 'CANCELLED':
                raise ValidationError({"status": "Customers can only cancel a booking."})
        elif user.role != 'ADMIN':
            raise PermissionDenied("You do not have permission to modify booking statuses.")

        # Update status and save
        booking.status = new_status
        booking.save()

        # Log change
        BookingStatusHistory.objects.create(
            booking=booking,
            status=new_status,
            updated_by=user
        )

        # Notify other party
        recipient = booking.customer.user if user.role == 'WORKER' else booking.worker.user
        Notification.objects.create(
            user=recipient,
            title="Booking Status Updated",
            message=f"Booking status changed from {old_status} to {new_status} by {user.first_name}.",
            notification_type='BOOKING'
        )

        # Return refreshed details
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class UserBookingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'WORKER':
            try:
                bookings = Booking.objects.filter(worker=user.worker_profile).order_by('-created_at')
            except WorkerProfile.DoesNotExist:
                bookings = Booking.objects.none()
        else:
            try:
                bookings = Booking.objects.filter(customer=user.customer_profile).order_by('-created_at')
            except CustomerProfile.DoesNotExist:
                bookings = Booking.objects.none()
                
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
