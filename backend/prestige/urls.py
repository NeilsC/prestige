"""prestige URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from django.conf import settings

handler400 = "prestige.error_handlers.handler400"
handler500 = "prestige.error_handlers.handler500"

admin.site.site_header = "Prestige Admin"
admin.site.site_title = "Prestige Admin"
admin.site.index_title = "Prestige Admin"


def env_view(request):
	return JsonResponse({
		"recaptchaSiteKey": settings.RECAPTCHA_SITE_KEY,
	})


urlpatterns = [
	path("health", lambda r: JsonResponse({"ok": True})),
	path("proxy/", include("proxy.urls")),
	path("storage/", include("storage.urls")),
	path("gist/", include("gist.urls")),
	path("auth/", include("auth_api.urls")),
	path("admin/", admin.site.urls),
	path("env", env_view),
]
