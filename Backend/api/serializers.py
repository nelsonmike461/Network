from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Post, Comment


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'main_post', 'comment', 'commenter', 'commented']


class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    likers = serializers.StringRelatedField(many=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'content', 'poster', 'likers', 'date_posted', 'edited', 'comments', 'likes_count', 'comments_count']

    def get_likes_count(self, obj):
        return obj.likers.count()

    def get_comments_count(self, obj):
        return obj.comments.count()



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','date_joined','following']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirmation = serializers.CharField(write_only=True)


    class Meta:
        model = User
        fields = ['username', 'password','confirmation']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmation']:
            raise serializers.ValidationError('Passwords do not Match.')
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmation')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
