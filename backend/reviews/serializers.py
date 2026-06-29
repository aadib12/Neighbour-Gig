from rest_framework import serializers
from .models import Review
from bookings.models import Booking

class ReviewSerializer(serializers.ModelSerializer):
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    customer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'booking', 'customer_name', 'customer_email', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_customer_name(self, obj):
        return f"{obj.customer.user.first_name} {obj.customer.user.last_name}"

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('booking', 'rating', 'comment')

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        booking = attrs['booking']
        
        # Check if booking is completed
        if booking.status != 'COMPLETED':
            raise serializers.ValidationError("Reviews can only be written for completed bookings.")
            
        # Check if a review already exists
        if hasattr(booking, 'review'):
            raise serializers.ValidationError("A review already exists for this booking.")
            
        return attrs
