import logging
from math import sqrt
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDay
from chat.models import Message, GroupRoom


logger = logging.getLogger(__name__)


def get_zscore(obs, pop):
    """Calculate zscore for given observed data & history"""
    # Size of population.
    number = float(len(pop))
    # Average population value.
    avg = sum(pop) / number
    # Standard deviation of population.
    std = sqrt(sum(((c - avg) ** 2) for c in pop) / number)
    # Zscore Calculation.
    if std == 0:
        return obs - avg
    return (obs - avg) / std


def get_group_stats():
    """Get group message stats per day"""
    message_models = Message.__subclasses__()
    time_window = 10
    start_time = timezone.now() - timezone.timedelta(days=time_window)
    initial_message_counts = {
        (timezone.now() - timezone.timedelta(days=days_num)).date(): 0
        for days_num in range(time_window)
    }
    group_stats = {}
    for message_model in message_models:
        annotated_model = (
            message_model.objects.filter(sent_at__gt=start_time)
            .annotate(date=TruncDay("sent_at"))
            .values("date", "group_room_id")
            .annotate(count=Count("id"))
        )
        for entry in annotated_model:
            room_id = entry["group_room_id"]
            date = entry["date"].date()
            count = entry["count"]
            if room_id not in group_stats:
                group_stats[room_id] = dict(initial_message_counts)
            group_stats[room_id][date] += count

    return group_stats


def update_trending_groups():
    """Find and update trending groups"""
    logger.info("Trending groups update started")
    group_stats = get_group_stats()
    zscores = {}
    for room_id, message_stats in group_stats.items():
        observed_message_count = message_stats.pop(timezone.now().date(), None)
        message_count_history = list(message_stats.values())
        zscores[room_id] = get_zscore(observed_message_count, message_count_history)

    sorted_zscores = dict(sorted(zscores.items(), key=lambda item: item[1]))
    for room, score in sorted_zscores.items():
        GroupRoom.objects.filter(id=room).update(zscore=score)
