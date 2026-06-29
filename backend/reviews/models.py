import uuid
from django.db import models
from django.db.models import Avg
from django.conf import settings
from bookings.models import Booking
from customers.models import CustomerProfile
from workers.models import WorkerProfile

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='reviews')
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField()  # Range 1 - 5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for booking {self.booking.id} - Rating: {self.rating}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update WorkerProfile rating
        avg_rating = Review.objects.filter(worker=self.worker).aggregate(Avg('rating'))['rating__avg'] or 0.0
        self.worker.rating = avg_rating
        self.worker.save()
