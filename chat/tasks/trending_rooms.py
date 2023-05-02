from math import sqrt

from django.db.models import Count
from django.db.models.functions import TruncDay
from django.utils import timezone

from chat.models import GroupRoom, Message


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
    days_window = 10
    start_time = timezone.localtime() - timezone.timedelta(days=days_window)
    initial_message_counts = {
        (timezone.localdate() - timezone.timedelta(days=days_num)): 0
        for days_num in range(days_window + 1)
    }
    group_stats = {}
    annotated_model = (
        Message.objects.filter(sent_at__gt=start_time)
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


def update_trending_rooms():
    """Find and update trending groups"""
    group_stats = get_group_stats()
    zscores = {}
    for room_id, message_stats in group_stats.items():
        observed_message_count = message_stats.pop(timezone.localdate(), None)
        message_count_history = list(message_stats.values())
        zscores[room_id] = get_zscore(observed_message_count, message_count_history)

    sorted_zscores = dict(sorted(zscores.items(), key=lambda item: item[1]))
    for room, score in sorted_zscores.items():
        GroupRoom.objects.filter(id=room).update(zscore=score)
