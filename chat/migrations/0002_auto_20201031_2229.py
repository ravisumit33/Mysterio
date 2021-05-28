# Generated by Django 3.1.1 on 2020-10-31 16:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0001_initial"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="individualchannel",
            index=models.Index(
                condition=models.Q(is_matched=False),
                fields=["is_matched", "created_at"],
                name="individual_channel_index",
            ),
        ),
    ]