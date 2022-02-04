from django.db.models.aggregates import Count, Max
from django.db.models.expressions import F
from django.db.models.functions.comparison import Greatest
from django.utils import timezone
from chat.models import GroupChannel, Message, GroupRoom


def delete_old_group_channels():
    """
    Delete messages and corresponding group channels older than 6 months
    And then delete group rooms with no channel
    """
    six_months_ago = timezone.now() - timezone.timedelta(days=6 * 30)

    message_models = Message.__subclasses__()  # pylint: disable=no-member
    annotation_kwargs = {}
    annotated_fields = []
    for message_model in message_models:
        model_name = f"{message_model.__name__}".lower()
        annotated_field = f"latest_{model_name}_time"
        annotated_fields.append(annotated_field)
        annotation_kwargs[annotated_field] = Max(f"{model_name}__sent_at")

    annotated_group_channels = GroupChannel.objects.annotate(**annotation_kwargs)
    latest_activity_field = (
        Greatest(*annotated_fields)
        if len(annotated_fields) > 1
        else F(annotated_fields[0])
    )
    annotated_group_channels.annotate(latest_activity=latest_activity_field).filter(
        latest_activity__lte=six_months_ago
    ).delete()

    GroupRoom.objects.annotate(channel_count=Count("group_channel")).filter(
        channel_count=0
    ).delete()
