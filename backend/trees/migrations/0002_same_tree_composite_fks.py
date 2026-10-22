"""Same-tree composite foreign keys from the ER diagram (DB-2).

Django can't declare composite FKs, so they are added with SQL:
  relationship (member1_id, tree_id)      -> family_member (id, tree_id)
  relationship (member2_id, tree_id)      -> family_member (id, tree_id)
  suggest_request (target_member_id, tree_id) -> family_member (id, tree_id)
  tree_collaborator (invitation_id, tree_id)  -> invitation (id, tree_id)

PostgreSQL only; skipped on other databases (e.g. SQLite in quick local runs).
If makemigrations names your first migration something other than
0001_initial, update `dependencies` below.
"""

from django.db import migrations

FKS = [
    ("relationship", "relationship_member1_same_tree", "member1_id", "family_member"),
    ("relationship", "relationship_member2_same_tree", "member2_id", "family_member"),
    ("suggest_request", "suggest_request_target_same_tree", "target_member_id", "family_member"),
    ("tree_collaborator", "tree_collaborator_invitation_same_tree", "invitation_id", "invitation"),
]


def add_fks(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    for table, name, column, ref in FKS:
        schema_editor.execute(
            f"ALTER TABLE {table} ADD CONSTRAINT {name} "
            f"FOREIGN KEY ({column}, tree_id) REFERENCES {ref} (id, tree_id) "
            f"DEFERRABLE INITIALLY IMMEDIATE"
        )


def drop_fks(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    for table, name, _, _ in FKS:
        schema_editor.execute(f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {name}")


class Migration(migrations.Migration):
    dependencies = [("trees", "0001_initial")]

    operations = [migrations.RunPython(add_fks, drop_fks)]
