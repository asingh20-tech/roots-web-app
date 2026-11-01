from django.contrib.auth.models import AbstractUser 
from django.db import models


class User(AbstractUser):
    """A login account (ER: users).

    Accounts are created through Google OAuth (django-allauth), which fills
    email / first_name / last_name. A User is NOT a FamilyMember: people in a
    tree don't need accounts.
    """

    email = models.EmailField(unique=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email or self.username
