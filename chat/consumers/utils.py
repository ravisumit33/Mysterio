def create_instance(serializer_cls, data, *args, **kwargs):
    serializer = serializer_cls(data=data, *args, **kwargs)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.instance


def update_instance(serializer_cls, instance, data, partial=True, *args, **kwargs):
    serializer = serializer_cls(instance, data=data, partial=partial, *args, **kwargs)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.instance
