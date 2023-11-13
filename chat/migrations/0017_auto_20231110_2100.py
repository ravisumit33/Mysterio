# Generated by Django 3.2.23 on 2023-11-10 15:30

import chat.models.message
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0002_remove_content_type_name'),
        ('chat', '0016_auto_20231106_1755'),
    ]

    operations = [
        migrations.CreateModel(
            name='Channel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('chat_session', models.OneToOneField(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='chat.chatsession')),
            ],
        ),
        migrations.CreateModel(
            name='GroupRoomData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('avatar_url', models.URLField(blank=True)),
                ('zscore', models.FloatField(null=True)),
                ('password', models.CharField(blank=True, max_length=20)),
                ('description', models.CharField(blank=True, max_length=256)),
                ('admins', models.ManyToManyField(related_name='accessible_group_rooms', related_query_name='accessible_group_room', to=settings.AUTH_USER_MODEL)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_rooms', related_query_name='group_room', to=settings.AUTH_USER_MODEL)),
                ('likers', models.ManyToManyField(related_name='favorite_rooms', related_query_name='favorite_room', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='MatchRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_matched', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('channel', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='chat.channel')),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('message_type', models.IntegerField()),
                ('object_id', models.PositiveIntegerField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
            ],
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_type', models.CharField(choices=[('gr', 'Group'), ('in', 'Individual')], max_length=2)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='TextData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=65535)),
            ],
            bases=(chat.models.message.MessageMixin, models.Model),
        ),
        migrations.RemoveField(
            model_name='groupchannel',
            name='chat_session',
        ),
        migrations.RemoveField(
            model_name='groupchannel',
            name='room',
        ),
        migrations.RemoveField(
            model_name='grouproom',
            name='admins',
        ),
        migrations.RemoveField(
            model_name='grouproom',
            name='creator',
        ),
        migrations.RemoveField(
            model_name='grouproom',
            name='likers',
        ),
        migrations.RemoveField(
            model_name='grouproom',
            name='player',
        ),
        migrations.AlterUniqueTogether(
            name='grouproommessage',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='grouproommessage',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='grouproommessage',
            name='room',
        ),
        migrations.RemoveField(
            model_name='grouproommessage',
            name='sender_channel',
        ),
        migrations.DeleteModel(
            name='GroupRoomTextData',
        ),
        migrations.RemoveField(
            model_name='individualchannel',
            name='chat_session',
        ),
        migrations.RemoveField(
            model_name='individualchannel',
            name='room',
        ),
        migrations.RemoveField(
            model_name='individualroom',
            name='player',
        ),
        migrations.AlterUniqueTogether(
            name='individualroommessage',
            unique_together=None,
        ),
        migrations.RemoveField(
            model_name='individualroommessage',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='individualroommessage',
            name='room',
        ),
        migrations.RemoveField(
            model_name='individualroommessage',
            name='sender_channel',
        ),
        migrations.DeleteModel(
            name='IndividualRoomTextData',
        ),
        migrations.DeleteModel(
            name='GroupChannel',
        ),
        migrations.DeleteModel(
            name='GroupRoom',
        ),
        migrations.DeleteModel(
            name='GroupRoomMessage',
        ),
        migrations.DeleteModel(
            name='IndividualChannel',
        ),
        migrations.DeleteModel(
            name='IndividualRoom',
        ),
        migrations.DeleteModel(
            name='IndividualRoomMessage',
        ),
        migrations.AddField(
            model_name='message',
            name='room',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', related_query_name='message', to='chat.room'),
        ),
        migrations.AddField(
            model_name='message',
            name='sender_channel',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='messages', related_query_name='message', to='chat.channel'),
        ),
        migrations.AddField(
            model_name='grouproomdata',
            name='room',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='chat.room'),
        ),
        migrations.AddField(
            model_name='channel',
            name='room',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='channels', related_query_name='channel', to='chat.room'),
        ),
        migrations.AddField(
            model_name='player',
            name='room',
            field=models.OneToOneField(default=1, on_delete=django.db.models.deletion.CASCADE, to='chat.room'),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='message',
            unique_together={('content_type', 'object_id')},
        ),
    ]
