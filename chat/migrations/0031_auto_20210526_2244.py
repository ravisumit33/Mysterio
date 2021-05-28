# Generated by Django 3.2.3 on 2021-05-26 17:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0030_auto_20210526_2012"),
    ]

    operations = [
        migrations.AlterField(
            model_name="groupchannel",
            name="id",
            field=models.AutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
        migrations.AlterField(
            model_name="grouproom",
            name="id",
            field=models.AutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
        migrations.AlterField(
            model_name="grouproom",
            name="password",
            field=models.CharField(default="", max_length=128),
        ),
        migrations.AlterField(
            model_name="individualchannel",
            name="id",
            field=models.AutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
        migrations.AlterField(
            model_name="individualroom",
            name="id",
            field=models.AutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
        migrations.AlterField(
            model_name="textmessage",
            name="id",
            field=models.AutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
    ]