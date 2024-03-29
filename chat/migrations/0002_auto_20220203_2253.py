# Generated by Django 3.2.11 on 2022-02-03 17:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("sessions", "0001_initial"),
        ("chat", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="groupchannel",
            old_name="session",
            new_name="chat_session",
        ),
        migrations.RenameField(
            model_name="individualchannel",
            old_name="session",
            new_name="chat_session",
        ),
        migrations.RemoveField(
            model_name="chatsession",
            name="session_id",
        ),
        migrations.RemoveField(
            model_name="chatsession",
            name="user",
        ),
        migrations.AddField(
            model_name="chatsession",
            name="session",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="sessions.session",
            ),
        ),
    ]
