# Generated by Django 3.2.8 on 2021-10-17 10:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0003_alter_grouproom_password"),
    ]

    operations = [
        migrations.AlterField(
            model_name="grouproom",
            name="password",
            field=models.CharField(
                default="pbkdf2_sha256$260000$RZIjBg6z12bYuXcwph0W2x$Mgh+iduwQa8Sr0o32Qt5jGBqHc7gL9fH9Z91UlhhVO0=",
                max_length=128,
            ),
        ),
    ]
