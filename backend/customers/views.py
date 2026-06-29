from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomerProfile
from .serializers import CustomerProfileSerializer, CustomerProfileCreateUpdateSerializer

class CustomerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.customer_profile
            serializer = CustomerProfileSerializer(profile)
            return Response(serializer.data)
        except CustomerProfile.DoesNotExist:
            # Create a blank profile on-demand if the user is a CUSTOMER
            if request.user.role == 'CUSTOMER':
                profile = CustomerProfile.objects.create(user=request.user)
                serializer = CustomerProfileSerializer(profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({"detail": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        if request.user.role != 'CUSTOMER':
            return Response({"detail": "Only customers can have a customer profile."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            profile = request.user.customer_profile
            serializer = CustomerProfileCreateUpdateSerializer(profile, data=request.data)
        except CustomerProfile.DoesNotExist:
            serializer = CustomerProfileCreateUpdateSerializer(data=request.data)
            
        if serializer.is_valid():
            profile = serializer.save(user=request.user)
            res_serializer = CustomerProfileSerializer(profile)
            return Response(res_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        try:
            profile = request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            return Response({"detail": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = CustomerProfileCreateUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            profile = serializer.save()
            res_serializer = CustomerProfileSerializer(profile)
            return Response(res_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
