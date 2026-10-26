from django.contrib import admin

from .models import (
    Document,
    FamilyMember,
    FamilyTree,
    Invitation,
    Relationship,
    SuggestRequest,
    TreeCollaborator,
)


@admin.register(FamilyTree)
class FamilyTreeAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name",)


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "tree", "birth_date", "death_date", "version")
    list_filter = ("tree",)
    search_fields = ("first_name", "last_name")


@admin.register(Relationship)
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ("member1", "relationship_type", "member2", "tree")
    list_filter = ("relationship_type", "tree")


@admin.register(SuggestRequest)
class SuggestRequestAdmin(admin.ModelAdmin):
    list_display = ("change_type", "tree", "submitted_by", "status", "created_at")
    list_filter = ("status", "change_type")


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ("tree", "created_by", "is_active", "created_at", "expires_at", "revoked_at")
    readonly_fields = ("token_hash",)


admin.site.register(TreeCollaborator)
admin.site.register(Document)
