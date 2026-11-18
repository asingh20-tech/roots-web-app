from django.apps import AppConfig


class TreesConfig(AppConfig):
    name = "trees"

    def ready(self):
        from . import invite_crypto, signals  # noqa: F401 (registers the key check)