from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Category, Service, WorkerProfile, WorkerAvailability, QRCodeMapping

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon')

class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        fields = ('id', 'name', 'category', 'category_name', 'description')

class WorkerAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = WorkerAvailability
        fields = ('id', 'day_of_week', 'day_name', 'start_time', 'end_time')

class QRCodeMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCodeMapping
        fields = ('id', 'qr_code_image', 'short_url')

class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    availabilities = WorkerAvailabilitySerializer(many=True, read_only=True)
    qr_code = QRCodeMappingSerializer(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = (
            'id', 'user', 'bio', 'profile_picture', 'skills', 
            'hourly_rate', 'latitude', 'longitude', 'is_available', 
            'address', 'rating', 'availabilities', 'qr_code'
        )
        read_only_fields = ('id', 'rating')

class WorkerProfileCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = (
            'bio', 'profile_picture', 'skills', 'hourly_rate', 
            'latitude', 'longitude', 'is_available', 'address'
        )

    def to_internal_value(self, data):
        # If skills is a string, convert it to a list
        if 'skills' in data and isinstance(data['skills'], str):
            import json
            try:
                # If it's JSON-formatted list, parse it
                parsed_skills = json.loads(data['skills'])
                if isinstance(parsed_skills, list):
                    # Data is immutable QueryDict, so copy it
                    if hasattr(data, 'copy'):
                        data = data.copy()
                    data['skills'] = parsed_skills
            except (json.JSONDecodeError, ValueError):
                # Fallback: parse as comma-separated string
                skills_list = [s.strip() for s in data['skills'].split(',') if s.strip()]
                if hasattr(data, 'copy'):
                    data = data.copy()
                data['skills'] = skills_list
        return super().to_internal_value(data)
