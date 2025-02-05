from django.urls import path

from . import views

urlpatterns = [
	path("", views.gists_index_view, name="gists-index"),
	path("get-file/<str:gh_username>/<str:gist_name>/<str:file_name>", views.load_gist_file_view, name="load-gist-file"),
	path("get-file/<str:gh_username>/<str:gist_name>", views.load_gist_file_view, name="load-gist-default"),
	path("update/<str:gist_id>", views.update_gist_view, name="update-gist"),
]
