"""Recoverable invitation tokens (revision of SA-2; see docs/invite-qr.md).

Validation still uses only the SHA-256 token hash. So the Tree Owner can copy
an active link again, the raw token is also kept encrypted with AES-256-GCM
under INVITATION_TOKEN_KEY, a key separate from DJANGO_SECRET_KEY. The
associated data binds each ciphertext to its tree and token hash, so a
ciphertext moved to another row or tree fails to decrypt.

Without a key, nothing recoverable is stored and links behave as before
(shown once at creation). Nothing here logs or raises with token material.
"""

import base64
import binascii
import hmac
import os

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings
from django.core import checks
from django.core.exceptions import ImproperlyConfigured

VERSION = b"\x01"
NONCE_BYTES = 12


def _decode_key(value):
    try:
        key = base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
    except (binascii.Error, ValueError):
        key = b""
    if len(key) != 32:
        raise ImproperlyConfigured(
            "INVITATION_TOKEN_KEY must be 32 random bytes, URL-safe base64 encoded."
        )
    return key


def _key():
    value = getattr(settings, "INVITATION_TOKEN_KEY", "")
    return _decode_key(value) if value else None


def is_enabled():
    return _key() is not None


def _aad(tree_id, token_hash):
    return f"roots-invitation-v1|{tree_id}|{token_hash}".encode()


def encrypt_token(raw_token, tree_id, token_hash):
    """Return VERSION + nonce + ciphertext, or None when no key is configured."""
    key = _key()
    if key is None:
        return None
    nonce = os.urandom(NONCE_BYTES)
    sealed = AESGCM(key).encrypt(nonce, raw_token.encode(), _aad(tree_id, token_hash))
    return VERSION + nonce + sealed


def decrypt_token(blob, tree_id, token_hash, hash_token):
    """Return the raw token, or None if it can't be recovered and verified."""
    key = _key()
    if key is None or not blob:
        return None
    blob = bytes(blob)  # PostgreSQL returns memoryview
    if blob[:1] != VERSION or len(blob) <= 1 + NONCE_BYTES:
        return None
    nonce, sealed = blob[1:1 + NONCE_BYTES], blob[1 + NONCE_BYTES:]
    try:
        raw = AESGCM(key).decrypt(nonce, sealed, _aad(tree_id, token_hash)).decode()
    except (InvalidTag, UnicodeDecodeError):
        return None  # wrong/rotated key or tampered row
    return raw if hmac.compare_digest(hash_token(raw), token_hash) else None


@checks.register(checks.Tags.security)
def check_invitation_key(app_configs, **kwargs):
    value = getattr(settings, "INVITATION_TOKEN_KEY", "")
    if not value:
        return []
    try:
        _decode_key(value)
    except ImproperlyConfigured as exc:
        return [checks.Error(str(exc), id="trees.E001")]
    if hmac.compare_digest(value.encode(), settings.SECRET_KEY.encode()):
        return [checks.Error("INVITATION_TOKEN_KEY must differ from DJANGO_SECRET_KEY.",
                             id="trees.E002")]
    return []
