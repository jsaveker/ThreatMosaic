from django.urls import path
from . import views

urlpatterns = [
    path('api/threat_scenarios', views.get_threat_scenarios, name='get_threat_scenarios'),
    path('api/search', views.search, name='search'),
    path('api/threat_scenarios', views.create_threat_scenario, name='create_threat_scenario'),
    path('api/create_relationship', views.create_relationship, name='create_relationship'),
    path('api/related_nodes', views.get_related_nodes, name='get_related_nodes'),
]