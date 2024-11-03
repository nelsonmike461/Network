from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required.")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, password, **extra_fields)


class User(AbstractUser):
    email = None

    date_joined = models.DateTimeField(auto_now_add=True)
    following = models.ManyToManyField(
        "self", blank=True, related_name="followers", symmetrical=False
    )

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.id}. {self.username}"


class Post(models.Model):
    tweet = models.CharField(max_length=255)
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    likers = models.ManyToManyField(User, blank=True, related_name="likes")
    date_posted = models.DateTimeField(auto_now_add=True)
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"Post#{self.id} - {self.poster.username}: {self.content}"

    class Meta:
        ordering = ["-date_posted"]


class Comment(models.Model):
    main_post = models.ForeignKey(
        Post,
        on_delete=models.SET_DEFAULT,
        default="Post deleted.",
        related_name="comments",
    )
    comment = models.CharField(max_length=255)
    commenter = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="commenter"
    )
    commented = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post#{self.main_post.id} - {self.commenter.username}: {self.comment}"

    class Meta:
        ordering = ["-commented"]
