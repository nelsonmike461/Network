from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from .serializers import (
    UserRegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    PostSerializer,
    CommentSerializer,
)
from .models import Post, Comment
from django.contrib.auth import get_user_model


User = get_user_model()


class HomePageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serialize = PostSerializer

        posts = Post.objects.annotate(
            likes_count=Count("likers"), comments_count=Count("comments")
        ).order_by("-date_posted")

        page_number = request.query_params.get("page", 1)
        paginator = Paginator(posts, 10)

        try:
            paginated_posts = paginator.page(page_number)
        except PageNotAnInteger:
            paginated_posts = paginator.page(1)
        except EmptyPage:
            paginated_posts = paginator.page(paginator.num_pages)

        tweets = serialize(paginated_posts, many=True, context={"request": request})

        most_liked_posts = sorted(posts, key=lambda x: x.likes_count, reverse=True)
        most_commented_posts = sorted(
            posts, key=lambda x: x.comments_count, reverse=True
        )

        most_liked_tweets = serialize(
            most_liked_posts[:10], many=True, context={"request": request}
        )
        most_commented_tweets = serialize(
            most_commented_posts[:10], many=True, context={"request": request}
        )

        response_data = {
            "recent_tweets": tweets.data,
            "total_tweets": paginator.count,
            "total_pages": paginator.num_pages,
            "current_page": paginated_posts.number,
            "most_liked_tweets": most_liked_tweets.data,
            "most_commented_tweets": most_commented_tweets.data,
        }

        return Response(response_data)


class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_users = request.user.following.all()

        posts = (
            Post.objects.filter(poster__in=following_users)
            .annotate(likes_count=Count("likers"), comments_count=Count("comments"))
            .order_by("-date_posted")
        )

        # Pagination
        page_number = request.query_params.get("page", 1)
        paginator = Paginator(posts, 10)

        try:
            paginated_posts = paginator.page(page_number)
        except PageNotAnInteger:
            paginated_posts = paginator.page(1)
        except EmptyPage:
            paginated_posts = paginator.page(paginator.num_pages)

        # Serialize the posts
        tweets = PostSerializer(
            paginated_posts, many=True, context={"request": request}
        )

        response_data = {
            "tweets": tweets.data,
            "total_tweets": paginator.count,
            "total_pages": paginator.num_pages,
            "current_page": paginated_posts.number,
        }

        return Response(response_data)


class TweetView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return super().get_permissions()

    # details
    def get(self, request, post_id):
        try:
            tweet = Post.objects.get(id=post_id)
            tweet_data = self.serializer_class(tweet, context={"request": request}).data
            return Response(tweet_data)
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )

    # Create A New Post #
    def post(self, request):
        post = self.serializer_class(data=request.data)
        if post.is_valid():
            tweet = post.save(poster=request.user)
            return Response(
                self.serializer_class(tweet).data, status=status.HTTP_201_CREATED
            )
        return Response(post.errors, status=status.HTTP_400_BAD_REQUEST)

    # Edit Post #
    def put(self, request, post_id):
        try:
            tweet = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if tweet.poster != request.user:
            return Response(
                {"error": "You cannot edit this post."},
                status=status.HTTP_403_FORBIDDEN,
            )

        tweet_update = self.serializer_class(tweet, data=request.data, partial=True)
        if tweet_update.is_valid():
            tweet_update.save(edited=True)
            return Response(tweet_update.data)
        return Response(tweet_update.errors, status=status.HTTP_400_BAD_REQUEST)


# Comment on a Post #
class CommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Create a new comment instance
        comment = Comment.objects.create(
            main_post=post, commenter=request.user, comment=request.data.get("comment")
        )

        # Serialize the created comment
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Like/Unlike #
class ToggleLikeView(APIView):
    def post(self, request, post_id):
        try:
            tweet = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )
        # Toggle Like Status
        if request.user in tweet.likers.all():
            tweet.likers.remove(request.user)
            liked = False
        else:
            tweet.likers.add(request.user)
            liked = True
        return Response({"success": True, "liked": liked})


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        is_following = request.user in user.followers.all()

        followers_count = user.followers.count()
        following_count = user.following.count()

        posts = Post.objects.filter(poster=user).order_by("-date_posted")
        tweets = PostSerializer(
            posts, many=True, context={"request": request}
        ).data  # Added context here

        comments = Comment.objects.filter(commenter=user).order_by("-commented")
        user_comments = CommentSerializer(comments, many=True).data

        liked_posts = Post.objects.filter(likers=user).order_by("-date_posted")
        liked_tweets = PostSerializer(
            liked_posts, many=True, context={"request": request}
        ).data  # Added context here

        is_self_profile = request.user == user

        response_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "date_joined": user.date_joined,
                "followers_count": followers_count,
                "following_count": following_count,
                "is_self_profile": is_self_profile,
                "is_following": is_following,
            },
            "tweets": tweets,
            "comments": user_comments,
            "liked_tweets": liked_tweets,
        }

        return Response(response_data)

    # Follow/Unfollow
    def post(self, request, username):
        toggle_follow = get_object_or_404(User, username=username)

        if request.user == toggle_follow:
            return Response(
                {"error": "You cannot Follow/Unfollow yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Toggle Follow/Unfollow
        if request.user in toggle_follow.followers.all():
            toggle_follow.followers.remove(request.user)
            return Response(
                {"success": True, "message": "You have unfollowed this user."},
                status=status.HTTP_200_OK,
            )
        else:
            toggle_follow.followers.add(request.user)
            return Response(
                {"success": True, "message": "You are now following this user."},
                status=status.HTTP_201_CREATED,
            )


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class LogoutView(APIView):
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)

        if serializer.is_valid():
            token = serializer.validated_data["refresh"]
            RefreshToken(token).blacklist()
            return Response(
                {"message": "Logout Successful."}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST
        )


class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if User.objects.filter(username=request.data.get("username")).exists():
            return Response(
                {"error": "Username is Taken"}, status=status.HTTP_409_CONFLICT
            )
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User Registered Successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
