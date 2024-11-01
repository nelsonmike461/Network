from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .serializers import UserRegisterSerializer, LoginSerializer, LogoutSerializer
from django.contrib.auth import get_user_model


User = get_user_model()

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class LogoutView(APIView):
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['refresh']
            RefreshToken(token).blacklist()
            return Response({'message':'Logout Successful.'}, status=status.HTTP_200_OK)
        return Response({'error':'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if User.objects.filter(username=request.data.get('username')).exists():
            return Response({'error': 'Username is Taken'}, status=status.HTTP_409_CONFLICT)

        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User Registered Successfully'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

