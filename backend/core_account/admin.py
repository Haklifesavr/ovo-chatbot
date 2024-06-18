from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Company
from .forms import UserCreationForm, UserChangeForm

admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ["first_name", "last_name", "email", "username", "company", "is_admin", "is_active", "link"]
    list_filter = ()

    list_editable = ["first_name", "last_name", "username"]
    list_display_links = ["link"]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'company', 'username')}),
        ('Permissions', {'fields': ('is_admin',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'password1', 'password2', 'company')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()

    def link(self, user):
        return "Open"


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'es_index', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ('name', 'es_index')
    fields = ('name', 'es_index')
    list_editable = ["name", "es_index"]
