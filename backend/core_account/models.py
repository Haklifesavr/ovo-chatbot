from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


# Create your models here.
class MyUserManager(BaseUserManager):
    def create_user(self, first_name, email, password):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not first_name:
            raise ValueError("first name is required")
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("Password is required")

        user = self.model(first_name=first_name, email=self.normalize_email(email))
        user.set_password(password)
        return user

    def create_superuser(self, first_name, email, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(first_name, email, password)
        user.is_admin = True
        user.save()
        return user


class Company(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    es_index = models.CharField(max_length=100)
    # include file paths list here since we will train our data beforehand and not on runtime when uploading from front

    def __str__(self):
        return self.name


class User(AbstractBaseUser):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(unique=True, max_length=100)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, default=None)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    username = models.CharField(max_length=250, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "password"]

    objects = MyUserManager()

    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return True

    def has_module_perms(self, app_label):  # noqa
        """Does the user have permissions to view the app `app_label`?"""
        return True

    @property
    def is_staff(self):
        """Is the user a member of staff?"""
        return self.is_admin
