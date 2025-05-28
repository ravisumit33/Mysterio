from rest_framework import serializers


class PolymorphicFieldSerializer(serializers.Serializer):
    """
    A serializer for nested polymorphic fields.
    Dynamically routes to the correct serializer based on a discriminator value.
    """

    discriminator_field = "type"
    serializer_map = {}

    def get_polymorphic_serializer(self, discriminator_value, *, instance=None, data=None):
        serializer_class = self.serializer_map.get(discriminator_value)
        if not serializer_class:
            return None
        kwargs = {"context": self.context}
        if instance is not None:
            kwargs["instance"] = instance
        if data is not None:
            kwargs["data"] = data
            kwargs["partial"] = getattr(self.root, "partial", False)
        return serializer_class(**kwargs)

    def get_value(self, dictionary):
        base_value = super().get_value(dictionary)
        discriminator_value = self._extract_discriminator()
        return {**base_value, self.discriminator_field: discriminator_value}

    def _extract_discriminator(self):
        if (context_val := self.context.get(self.discriminator_field)) is not None:
            return context_val
        if isinstance(initial_data := getattr(self, "initial_data", None), dict):
            if (init_val := initial_data.get(self.discriminator_field)) is not None:
                return init_val
        if self.instance and (
            instance_val := getattr(self.instance, self.discriminator_field, None)
        ):
            return instance_val
        raise serializers.ValidationError(
            f"Missing discriminator field '{self.discriminator_field}'"
        )

    def to_representation(self, instance):
        discriminator_value = getattr(instance, self.discriminator_field, None)
        serializer = self.get_polymorphic_serializer(discriminator_value, instance=instance)
        return serializer.data if serializer else {}

    def to_internal_value(self, data):
        discriminator_value = data.get(self.discriminator_field)
        serializer = self.get_polymorphic_serializer(discriminator_value, data=data)
        if serializer is not None:
            validated = serializer.run_validation(data)
            validated[self.discriminator_field] = discriminator_value
            return validated
        raise serializers.ValidationError(
            f"Unknown {self.discriminator_field}: {discriminator_value}"
        )

    def create(self, validated_data):
        discriminator_value = validated_data.pop(self.discriminator_field)
        serializer = self.get_polymorphic_serializer(discriminator_value, data=validated_data)
        return serializer.create(validated_data)

    def update(self, instance, validated_data):
        discriminator_value = validated_data.pop(self.discriminator_field)
        serializer = self.get_polymorphic_serializer(
            discriminator_value, instance=instance, data=validated_data
        )
        return serializer.update(instance, validated_data)
