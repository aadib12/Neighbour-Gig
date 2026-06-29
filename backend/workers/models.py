import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.conf import settings

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, null=True)  # Name of icon class (e.g. lucide-home)

    def __str__(self):
        return self.name

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='services')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class WorkerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='worker_profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='workers/profiles/', blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)  # List of string skill tags
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    latitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)

    def __str__(self):
        return f"Worker: {self.user.first_name} {self.user.last_name} ({self.user.email})"

class WorkerAvailability(models.Model):
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker_profile = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.worker_profile.user.email} - {self.get_day_of_week_display()} ({self.start_time} - {self.end_time})"

class QRCodeMapping(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.OneToOneField(WorkerProfile, on_delete=models.CASCADE, related_name='qr_code')
    qr_code_image = models.ImageField(upload_to='workers/qrcodes/', blank=True, null=True)
    short_url = models.CharField(max_length=255, unique=True, blank=True, null=True)

    def __str__(self):
        return f"QR Code for {self.worker.user.email}"

    def save(self, *args, **kwargs):
        if not self.short_url:
            self.short_url = f"/worker/{self.worker.id}"
            
        if not self.qr_code_image:
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            # Link worker profile URL directly.
            # In a real setup, we would prepend the frontend domain name.
            # E.g. https://neighbourgig.vercel.app/worker/{id}
            qr.add_data(self.short_url)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save QR image to models.ImageField in memory
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            filename = f"worker_qr_{self.worker.id}.png"
            
            # Set the image to models.ImageField
            self.qr_code_image.save(filename, File(buffer), save=False)
            
        super().save(*args, **kwargs)
