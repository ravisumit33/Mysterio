# Generated by Django 3.2.13 on 2023-05-24 19:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0004_chatsession_tab_session_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="player",
            name="host",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="players",
                related_query_name="player",
                to="chat.chatsession",
            ),
        ),
    ]