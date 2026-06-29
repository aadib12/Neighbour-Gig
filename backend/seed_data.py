import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neighbourgig.settings')
django.setup()

from workers.models import Category, Service

categories_data = [
    {"name": "Maid Services", "slug": "maids", "icon": "lucide-user"},
    {"name": "Cooking & Catering", "slug": "cooks", "icon": "lucide-utensils"},
    {"name": "Electrical Works", "slug": "electricians", "icon": "lucide-bolt"},
    {"name": "Plumbing Services", "slug": "plumbers", "icon": "lucide-droplet"},
    {"name": "Home Tutoring", "slug": "tutors", "icon": "lucide-book-open"},
]

for cat_info in categories_data:
    category, created = Category.objects.get_or_create(
        slug=cat_info["slug"],
        defaults={"name": cat_info["name"], "icon": cat_info["icon"]}
    )
    if created:
        print(f"Created category: {category.name}")
    else:
        print(f"Category already exists: {category.name}")

# Add some services for each
services_data = [
    {"category_slug": "maids", "name": "House Cleaning", "description": "General home dusting, sweeping, and mopping."},
    {"category_slug": "maids", "name": "Deep Cleaning", "description": "Thorough sanitization and deep cleaning of rooms/kitchen."},
    {"category_slug": "cooks", "name": "Daily Meal Cooking", "description": "Cooking healthy home meals on a daily basis."},
    {"category_slug": "cooks", "name": "Party Catering", "description": "Preparing custom dishes and catering for small gatherings."},
    {"category_slug": "electricians", "name": "Appliance Repair", "description": "Fixing AC, washing machines, microwaves, etc."},
    {"category_slug": "electricians", "name": "Wiring & Installation", "description": "Setting up new lights, fans, or home wiring systems."},
    {"category_slug": "plumbers", "name": "Leakage Repair", "description": "Fixing leaking pipes, faucets, or bathroom toilets."},
    {"category_slug": "plumbers", "name": "Fitting & Installation", "description": "Installing new sinks, taps, geysers, etc."},
    {"category_slug": "tutors", "name": "Maths Tutoring", "description": "High school mathematics and calculus coaching."},
    {"category_slug": "tutors", "name": "Science Tutoring", "description": "Physics and chemistry classes for junior students."},
]

for svc_info in services_data:
    try:
        category = Category.objects.get(slug=svc_info["category_slug"])
        service, created = Service.objects.get_or_create(
            name=svc_info["name"],
            category=category,
            defaults={"description": svc_info["description"]}
        )
        if created:
            print(f"Created service: {service.name} in {category.name}")
    except Category.DoesNotExist:
        print(f"Category with slug {svc_info['category_slug']} not found.")
