# Generated by Django 3.1.1 on 2020-11-01 09:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0020_auto_20201101_1457"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="individualchannel",
            name="individual_channel_index",
        ),
        migrations.AddIndex(
            model_name="individualchannel",
            index=models.Index(
                condition=models.Q(is_matched=False),
                fields=["is_matched"],
                name="individual_channel_index",
            ),
        ),
    ]