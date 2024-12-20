from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Post, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "date_joined", "following"]


class CommentSerializer(serializers.ModelSerializer):
    commenter = serializers.SerializerMethodField()  # Field for the username

    class Meta:
        model = Comment
        fields = ["id", "main_post", "comment", "commenter", "commented"]

    def get_commenter(self, obj):
        return obj.commenter.username if obj.commenter else None


class PostSerializer(serializers.ModelSerializer):
    poster = serializers.SerializerMethodField()
    likers = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "tweet",
            "poster",
            "likers",
            "is_liked",
            "date_posted",
            "edited",
            "comments",
            "likes_count",
            "comments_count",
        ]

    def get_poster(self, obj):
        return obj.poster.username

    def get_likers(self, obj):
        return [user.username for user in obj.likers.all()]

    def get_likes_count(self, obj):
        return obj.likers.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user in obj.likers.all()
        return False


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "confirmation"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmation"]:
            raise serializers.ValidationError("Passwords do not Match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirmation")
        user = User.objects.create_user(
            username=validated_data["username"], password=validated_data["password"]
        )
        return user


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
