from rest_framework import serializers
from customers.serializers import CustomerProfileSerializer
from workers.serializers import WorkerProfileSerializer, ServiceSerializer
from workers.models import WorkerProfile, Service
from customers.models import CustomerProfile
from .models import Booking, BookingStatusHistory
import datetime

class BookingStatusHistorySerializer(serializers.ModelSerializer):
    updated_by_email = serializers.CharField(source='updated_by.email', read_only=True)
    
    class Meta:
        model = BookingStatusHistory
        fields = ('id', 'status', 'updated_by_email', 'changed_at')

class BookingSerializer(serializers.ModelSerializer):
    customer = CustomerProfileSerializer(read_only=True)
    worker = WorkerProfileSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'customer', 'worker', 'service', 'booking_date', 
            'start_time', 'hours', 'total_price', 'status', 
            'address', 'latitude', 'longitude', 'created_at', 'status_history'
        )

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            'worker', 'service', 'booking_date', 'start_time', 
            'hours', 'address', 'latitude', 'longitude'
        )

    def validate_booking_date(self, value):
        if value < datetime.date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value

    def create(self, validated_data):
        # Calculated field setup
        worker = validated_data['worker']
        hours = validated_data.get('hours', 1)
        validated_data['total_price'] = worker.hourly_rate * hours
        validated_data['status'] = 'PENDING'
        
        booking = super().create(validated_data)
        
        # Log initial status change
        BookingStatusHistory.objects.create(
            booking=booking,
            status='PENDING',
            updated_by=booking.customer.user
        )
        return booking
