"""Role-based access control for the tree API (SA-1, DB-4).

Read (GET/HEAD/OPTIONS): Tree Owner or Collaborator. Views already hide
inaccessible trees with accessible_to(), so outsiders get 404.
Write (POST/PUT/PATCH/DELETE): Tree Owner only. Collaborators get 403 and
must use suggestions instead (FR-12).
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsTreeOwnerOrReadOnly(BasePermission):
    message = "Only the Tree Owner can change this tree. Collaborators can submit suggestions instead."

    def has_permission(self, request, view):
        # Tree-scoped views (/api/trees/<tree_id>/...) expose get_tree().
        if request.method in SAFE_METHODS or not hasattr(view, "get_tree"):
            return True
        return view.get_tree().owner_id == request.user.pk

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        tree = obj if hasattr(obj, "owner_id") else obj.tree
        return tree.owner_id == request.user.pk

class IsTreeOwner(BasePermission):
    """Every method is Owner-only (invitation links, collaborator list)."""
    message = "Only the Tree Owner can manage this."

    def has_permission(self, request, view):
        return view.get_tree().owner_id == request.user.pk
    