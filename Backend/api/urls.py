from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    HomePageView,
    TweetView,
    ToggleLikeView,
    CommentView,
    UserProfileView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("profile/<str:username>/", UserProfileView.as_view(), name="user_profile"),
    path("tweet/comment/<int:post_id>/", CommentView.as_view(), name="comment"),
    path(
        "tweet/like-unlike/<int:post_id>/", ToggleLikeView.as_view(), name="like-unlike"
    ),
    path("tweet/<int:post_id>/", TweetView.as_view(), name="tweet_update"),
    path("tweet/", TweetView.as_view(), name="tweet"),
    path("home/", HomePageView.as_view(), name="home"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
]
