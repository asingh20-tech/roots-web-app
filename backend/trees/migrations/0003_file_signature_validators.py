import django.core.validators
import trees.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trees', '0002_same_tree_composite_fks'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='file',
            field=models.FileField(db_column='file_path', max_length=255, upload_to=trees.models.private_upload_path, validators=[django.core.validators.FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png']), trees.models.validate_upload_size, trees.models.validate_file_signature]),
        ),
        migrations.AlterField(
            model_name='familymember',
            name='photo',
            field=models.ImageField(blank=True, max_length=255, null=True, upload_to=trees.models.private_upload_path, validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png']), trees.models.validate_upload_size, trees.models.validate_file_signature]),
        ),
        migrations.AlterField(
            model_name='suggestrequest',
            name='proposed_file',
            field=models.FileField(blank=True, max_length=255, null=True, upload_to=trees.models.private_upload_path, validators=[django.core.validators.FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png']), trees.models.validate_upload_size, trees.models.validate_file_signature]),
        ),
    ]