from .models import User, Company
from django.http import JsonResponse
from django.shortcuts import redirect
from .serializers import UserSerializer, CompanySerializer
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:  # noqa
        return Response({'error': 'User not found'}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_company(request):
    try:
        company_name = request.POST.get('company_name')
        user_id = request.POST.get('user_id')
        company = Company.objects.get(name=company_name.title())
        serializer = CompanySerializer(company)
        user = get_user_model()
        user = user.objects.get(id=user_id)
        user.company = company
        user.save()
        return Response(serializer.data)
    except Company.DoesNotExist:
        try:
            company = Company.objects.create(name=company_name.title())  # Create the company
            company.es_index = company.name.replace(" ", "_").lower()
            company.save()
            serializer = CompanySerializer(company)
            user = get_user_model()
            user = user.objects.get(id=user_id)
            user.company = company
            user.save()
            return Response(serializer.data, status=201)  # Return with status code 201 (Created)
        except Exception as e:
            return Response({'error': str(e)}, status=500)  # Return error response with status code 500 (Internal Server Error)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }


@login_required
def social_login_redirect(request):
    try:
        user = get_user_model()
        user = user.objects.get(email=request.user.email)
        token = get_tokens_for_user(user)
        res = redirect(f"https://ovo-chatbot-frontend-dot-work-projects-389011.uc.r.appspot.com/login?token={token}", permanent=True)
        # res = redirect(f"http://localhost:3000/login?token={token}", permanent=True)
        print("checking res login redirect",res)
        return res
    except Exception as e:
        print("seeing error",e)
        return JsonResponse({'error': f"Not allowed {e}"}, status=400)