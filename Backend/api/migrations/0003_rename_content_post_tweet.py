# Generated by Django 5.1.2 on 2024-11-02 18:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_post_comment'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='content',
            new_name='tweet',
        ),
    ]
