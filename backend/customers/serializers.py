from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import CustomerProfile

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ('id', 'user', 'profile_picture', 'address', 'latitude', 'longitude')
        read_only_fields = ('id',)

class CustomerProfileCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ('profile_picture', 'address', 'latitude', 'longitude')
