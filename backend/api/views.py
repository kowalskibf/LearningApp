# import view sets from the REST framework
import random
from django.db import transaction
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from django.contrib.staticfiles import finders
from rest_framework.views import APIView
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from django.db.models import F, Value, Case, When
from django.db import models
# import the Flashcard model from the models file
#from .models import Flashcard, Set_flashcards, Account
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import csv
import time
# change password
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated 
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from django.contrib.auth.hashers import check_password

from .serializers import *

from django.utils import timezone

import json

def calculate_level(n:int):
    return int(100 * 1.2**(n-1))

def handle_xp(user:User, subject:Subject, xp_amount:int):
    account = Account.objects.get(user=user)
    sta = SubjectsToAccounts.objects.get(account=account, subject=subject)
    if sta.xp + xp_amount >= calculate_level(sta.level + 1):
        sta.xp = sta.xp + xp_amount - calculate_level(sta.level + 1)
        sta.level += 1
    else:
        sta.xp += xp_amount
    sta.save()


class RegisterView(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    authentication_classes=[SessionAuthentication]

    def post(self, request, *args, **kwargs):
        body = json.loads(request.body)
        try:
            if(User.objects.filter(username=body["username"]).count() > 0):
                return Response(status=status.HTTP_409_CONFLICT)
            try:
                validate_email(body["email"])
            except ValidationError as e:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            newUser = User(username=body["username"], email=body["email"])
            newUser.set_password(body["password"])
            newUser.save()
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        

class UserView(APIView):
    def get(self, request, pk):
        user = User.objects.get(pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

class SubjectView(APIView):
    def post(self, request):
        body = json.loads(request.body)
        Subject(name=body["name"]).save()
        return Response(status=status.HTTP_201_CREATED)

    def get(self, request, pk):
        subject = Subject.objects.get(pk=pk)
        serializer = SubjectSerializer(subject)
        return Response(serializer.data)
    
    def put(self, request, pk):
        user = request.user
        acc = Account.objects.get(user=user)
        if acc.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        body = json.loads(request.body)
        subject = Subject.objects.get(pk=pk)
        subject.name = body["name"]
        subject.save()
        return Response(status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        user = request.user
        acc = Account.objects.get(user=user)
        if acc.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        Subject.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_200_OK)
    
class AllSubjectsView(APIView):
    def get(self, request):
        subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CourseView(APIView):
    authentication_classes=[TokenAuthentication]
    def post(self, request):
        try:
            user = request.user
            author = Account.objects.get(user=user)
            subject = Subject.objects.get(pk=request.data.get("subject_id"))
            image = request.data.get("image")
            newCourse = Course(author=author,
                   subject=subject,
                   title=request.data.get("title"),
                   modificationDate=timezone.now(),
                   description=request.data.get("description"),
                   image=image,
                   accepted=False)
            if author.isAdmin == True:
                newCourse.accepted = True
            newCourse.save()
            newCourseId = newCourse.pk
            response = {"courseId": newCourseId}
            return Response(response, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    def put(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        try:
            course = Course.objects.get(pk=pk)
            if course.author != author and author.isAdmin == False:
                return Response(status=status.HTTP_403_FORBIDDEN)
            course.subject = Subject.objects.get(pk=request.data.get("subject_id"))
            course.title = request.data.get("title")
            course.description = request.data.get("description")
            course.modificationDate = timezone.now()
            course.image = request.data.get("image")
            course.save()
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        course = Course.objects.get(pk=pk)
        if course.author != author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        course.delete()
        return Response(status=status.HTTP_200_OK)
    
class AcceptCourseView(APIView):
    authentication_classes=[TokenAuthentication]
    def put(self, request, pk):
        user = request.user
        account = Account.objects.get(user=user)
        if not account.isAdmin:
            return Response(status=status.HTTP_403_FORBIDDEN)
        c = Course.objects.get(pk=pk)
        c.accepted = True
        c.save()
        return Response(status=status.HTTP_200_OK)

class AllCoursesView(APIView):
    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AllNotAcceptedCoursesView(APIView):
    def get(self, request):
        courses = Course.objects.filter(accepted=False)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AllAcceptedCoursesView(APIView):
    def get(self, request):
        courses = Course.objects.filter(accepted=True)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class MyCoursesView(APIView):
    def get(self, request):
        user = request.user
        author = Account.objects.get(user=user)
        courses = Course.objects.filter(author=author)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AccountView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = request.user
            account = Account.objects.get(user=user)
            serializer = AccountSerializer(account)
            return Response(serializer.data)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        account.avatar = request.data.get("avatar")
        account.save()
        return Response(status=status.HTTP_200_OK)
    
class AllAccountsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        accounts = Account.objects.all()
        serializer = AccountSerializer(accounts, many=True)
        counter = 0
        for account in accounts:
            subjectsToAccounts = SubjectsToAccounts.objects.filter(account=account)
            serializer.data[counter]['subjects'] = SubjectsToAccountsSerializer(subjectsToAccounts, many=True).data
            counter += 1
        return Response(serializer.data)
    
class AllFriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        friendRequests = FriendRequest.objects.all()
        serializer = FriendRequestSerializer(friendRequests, many=True)
        return Response(serializer.data)
    
class MyFriendsListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        friend_requests_sent = FriendRequest.objects.filter(sender=account, accepted=True)
        friend_requests_received = FriendRequest.objects.filter(receiver=account, accepted=True)
        friends = set()
        for r in friend_requests_sent:
            friends.add(r.receiver)
        for r in friend_requests_received:
            friends.add(r.sender)
        serializer = AccountSerializer(friends, many=True)
        counter = 0
        for account in friends:
            subjectsToAccounts = SubjectsToAccounts.objects.filter(account=account)
            serializer.data[counter]['subjects'] = SubjectsToAccountsSerializer(subjectsToAccounts, many=True).data
            counter += 1
        return Response(serializer.data)
    
class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            user = request.user
            body = json.loads(request.body)
            account = Account.objects.get(user=user)
            friend_user = User.objects.get(pk=body["friend_id"])
            friend = Account.objects.get(user=friend_user)
            if FriendRequest.objects.filter(sender=account, receiver=friend).count() == 0 and FriendRequest.objects.filter(sender=friend, receiver=account).count() == 0:
                FriendRequest(sender=account, receiver=friend, sentDate=timezone.now(), accepted=False).save()
                Notification(receiver=friend, message=f"{user.username} sent you a friend request!", date=timezone.now(), read=False, url="/friends").save()
                return Response(status=status.HTTP_200_OK)
            return Response(status=status.HTTP_409_CONFLICT)
        except Exception as e:
            print(e)

class ReceivedFriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        friend_requests_received = FriendRequest.objects.filter(receiver=account, accepted=False)
        friends = set()
        for r in friend_requests_received:
            friends.add(r.sender)
        serializer = AccountSerializer(friends, many=True)
        counter = 0
        for account in friends:
            subjectsToAccounts = SubjectsToAccounts.objects.filter(account=account)
            serializer.data[counter]['subjects'] = SubjectsToAccountsSerializer(subjectsToAccounts, many=True).data
            counter += 1
        return Response(serializer.data)

class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        friend_user = User.objects.get(pk=body["friend_id"])
        friend_account = Account.objects.get(user=friend_user)
        friend_request = FriendRequest.objects.get(receiver=account, sender=friend_account, accepted=False)
        friend_request.accepted = True
        friend_request.save()
        Notification(receiver=friend_account, message=f'{account.user.username} accepted your friend request!', date=timezone.now(), read=False, url="/friends").save()
        return Response(status=status.HTTP_200_OK)
    
class DeclineFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        friend_user = User.objects.get(pk=body["friend_id"])
        friend_account = Account.objects.get(user=friend_user)
        friend_request = FriendRequest.objects.get(receiver=account, sender=friend_account, accepted=False)
        friend_request.delete()
        return Response(status=status.HTTP_200_OK)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        friend_user = User.objects.get(pk=body["friend_id"])
        friend_account = Account.objects.get(user=friend_user)
        for fr in FriendRequest.objects.filter(receiver=account, sender=friend_account, accepted=True):
            fr.delete()
        for fr in FriendRequest.objects.filter(receiver=friend_account, sender=account, accepted=True):
            fr.delete()
        return Response(status=status.HTTP_200_OK)
    
class SentFriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        friend_requests_sent = FriendRequest.objects.filter(sender=account, accepted=False)
        friends = set()
        for r in friend_requests_sent:
            friends.add(r.receiver)
        serializer = AccountSerializer(friends, many=True)
        return Response(serializer.data)
    
class CancelFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        friend_user = User.objects.get(pk=body["friend_id"])
        friend_account = Account.objects.get(user=friend_user)
        for r in FriendRequest.objects.filter(sender=account, receiver=friend_account, accepted=False):
           r.delete()
        return Response(status=status.HTTP_200_OK)

class MySubjectsToAccountsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        subjectsToAccounts = SubjectsToAccounts.objects.filter(account=account)
        serializer = SubjectsToAccountsSerializer(subjectsToAccounts, many=True)
        for subj in serializer.data:
            subj |= {'nextLevelThreshold': calculate_level(subj['level'] + 1)}
        return Response(serializer.data)
    
class CourseSlidesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        user = request.user
        course = Course.objects.get(pk=pk)
        slides = Slide.objects.filter(course=course)
        serializer = SlideSerializer(slides, many=True)
        return Response(serializer.data)
    
class SlideView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        user = request.user
        acc = Account.objects.get(user=user)
        course = Course.objects.get(pk=pk)
        if course.author != acc and acc.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        course.slidesCount += 1
        handle_xp(user, course.subject, 4)
        course.save()
        slideNumber = course.slidesCount
        Slide(course=course, slideNumber=slideNumber, title="", content="").save()
        response = {"slideNumber": slideNumber}
        return Response(response, status=status.HTTP_201_CREATED)

    def get(self, request, coursepk, slidenum):
        user = request.user
        course = Course.objects.get(pk=coursepk)
        handle_xp(user, course.subject, 2)
        slide = Slide.objects.get(course=course, slideNumber=slidenum)
        serializer = SlideSerializer(slide)
        return Response(serializer.data)
    
    def put(self, request, coursepk, slidenum):
        user = request.user
        acc = Account.objects.get(user=user)
        body = json.loads(request.body)
        course = Course.objects.get(pk=coursepk)
        if course.author != acc and acc.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        slide = Slide.objects.get(course=course, slideNumber=slidenum)
        slide.title = body["title"]
        slide.content = body["content"]
        slide.save()
        return Response(status=status.HTTP_200_OK)

class SlideImageView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, coursepk, slidenum):
        user = request.user
        acc = Account.objects.get(user=user)
        course = Course.objects.get(pk=coursepk)
        if course.author != acc and acc.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        slide = Slide.objects.get(course=course, slideNumber=slidenum)
        slide.image = request.data.get("image")     
        slide.save()
        return Response(status=status.HTTP_200_OK)   
    
class ChatMessageView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, coursepk, slidenum):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        course = Course.objects.get(pk=coursepk)
        handle_xp(user, course.subject, 2)
        slide = Slide.objects.get(course=course, slideNumber=slidenum)
        ChatMessage(slide=slide, author=account, date=timezone.now(), content=body["content"]).save()
        return Response(status=status.HTTP_200_OK)
    
    def get(self, request, coursepk, slidenum):
        course = Course.objects.get(pk=coursepk)
        slide = Slide.objects.get(course=course, slideNumber=slidenum)
        chatMessages = ChatMessage.objects.filter(slide=slide)
        serializer = ChatMessageSerializer(chatMessages, many=True)
        return Response(serializer.data)

class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user
        body = json.loads(request.body)
        oldPassword = body["old_password"]
        newPassword = body["new_password"]
        if user.check_password(oldPassword):
            user.set_password(newPassword)
            user.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
class AllThreadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = Thread.objects.all().order_by('-lastCommentDate')
        serializer = ThreadSerializer(threads, many=True)
        return Response(serializer.data)

class ThreadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        body = json.loads(request.body)
        subject = Subject.objects.get(pk=body["subject_id"])
        handle_xp(user, subject, 5)
        author = Account.objects.get(user=user)
        author_subject_info = SubjectsToAccounts.objects.get(subject=subject, account=author)
        thread = Thread(subject=subject,
               author=author,
               author_subject_info=author_subject_info,
               creationDate=timezone.now(),
               title=body["title"],
               content=body["content"],
               lastCommentDate=None,
               commentsCount=0,
               likesCount=0,
               dislikesCount=0)
        thread.save()
        response = {"threadId": thread.pk}
        return Response(response, status=status.HTTP_201_CREATED)
    
    def get(self, request, pk):
        user = request.user
        thread = Thread.objects.get(pk=pk)
        serializer = ThreadSerializer(thread)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        th = Thread.objects.get(pk=pk)
        if author != th.author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        th.delete()
        return Response(status=status.HTTP_200_OK)
    
class ThreadAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, threadpk):
        user = request.user
        body = json.loads(request.body)
        thread = Thread.objects.get(pk=threadpk)
        subject = thread.subject
        handle_xp(user, subject, 5)
        author = Account.objects.get(user=user)
        author_subject_info = SubjectsToAccounts.objects.get(subject=subject, account=author)
        ThreadAnswer(thread=thread,
                     author=author,
                     author_subject_info=author_subject_info,
                     date=timezone.now(),
                     content=body["content"],
                     likesCount=0,
                     dislikesCount=0).save()
        thread.commentsCount += 1
        thread.save()
        if user.username != thread.author.user.username:
            Notification(receiver=thread.author, message=f'{user.username} commented on your "{thread.title}" thread!', date=timezone.now(), read=False, url=f'/thread/{thread.pk}').save()
        return Response(status=status.HTTP_200_OK)
    
    def get(self, request, threadpk):
        thread = Thread.objects.get(pk=threadpk)
        threadAnswers = ThreadAnswer.objects.filter(thread=thread)
        serializer = ThreadAnswerSerializer(threadAnswers, many=True)
        return Response(serializer.data)

class ThreadAnswerLikesView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, threadpk, threadanswerpk):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        thread = Thread.objects.get(pk=threadpk)
        threadAnswer = ThreadAnswer.objects.get(pk=threadanswerpk)
        state = body["state"]
        zmienna = 0
        if state != 1 and state != 0 and state != -1:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        try:
            atta = AccountsToThreadAnswers.objects.get(account=account, threadAnswer=threadAnswer)
            attaState = atta.state
            if attaState == -1:
                threadAnswer.dislikesCount -= 1
                zmienna = -1
            if attaState == 1:
                threadAnswer.likesCount -= 1
                zmienna = 1
            atta.delete()
        except:
            print("nie ma")
        if state == -1:
            if zmienna == -1:
                state = 0
            else:
                threadAnswer.dislikesCount += 1
        if state == 1:
            if zmienna == 1:
                state = 0
            else:
                threadAnswer.likesCount += 1
        threadAnswer.save()
        AccountsToThreadAnswers(account=account, threadAnswer=threadAnswer, state=state).save()
        return Response(status=status.HTTP_200_OK)

class ThreadLikesView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, threadpk):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        thread = Thread.objects.get(pk=threadpk)
        state = body["state"]
        zmienna = 0
        if state != 1 and state != 0 and state != -1:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        try:
            att = AccountsToThreads.objects.get(account=account, thread=thread)
            attState = att.state
            if attState == -1:
                thread.dislikesCount -= 1
                zmienna = -1
            if attState == 1:
                thread.likesCount -= 1
                zmienna = 1
            att.delete()
        except:
            print("nie ma")
        if state == -1:
            if zmienna == -1:
                state = 0
            else:
                thread.dislikesCount += 1
        if state == 1:
            if zmienna == 1:
                state = 0
            else:
                thread.likesCount += 1
        thread.save()
        AccountsToThreads(account=account, thread=thread, state=state).save()
        return Response(status=status.HTTP_200_OK)

class LikedAnswersView(APIView):
    def get(self, request, threadpk):
        user = request.user
        account = Account.objects.get(user=user)
        thread = Thread.objects.get(pk=threadpk)
        threadAnswers = ThreadAnswer.objects.filter(thread=thread)
        likes = set()
        for ta in threadAnswers:
            if AccountsToThreadAnswers.objects.filter(account=account, threadAnswer=ta).count() > 0:
                likes.add(AccountsToThreadAnswers.objects.get(account=account, threadAnswer=ta))
        serializer = AccountstoThreadAnswersSerializer(likes, many=True)
        return Response(serializer.data)

class LikedThreadsView(APIView):
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        threads = Thread.objects.all()
        likes = set()
        for t in threads:
            if AccountsToThreads.objects.filter(account=account, thread=t).count() > 0:
                likes.add(AccountsToThreads.objects.get(account=account, thread=t))
        serializer = AccountsToThreadsSerializer(likes, many=True)
        return Response(serializer.data)
    
class LikedThreadView(APIView):
    def get(self, request, threadpk):
        user = request.user
        account = Account.objects.get(user=user)
        thread = Thread.objects.get(pk=threadpk)
        r = 0
        if AccountsToThreads.objects.filter(account=account, thread=thread).count() > 0:
            att = AccountsToThreads.objects.get(account=account, thread=thread)
            if att.state == 1:
                r = 1
            elif att.state == -1:
                r = -1
        resp = {"liked": r}
        return Response(resp, status=status.HTTP_200_OK)


class AllFlashcardSetsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(FlashcardSetSerializer(FlashcardSet.objects.all(), many=True).data)

class MyFlashcardSetsView(APIView):
    def get(self, request):
        user = request.user
        author = Account.objects.get(user=user)
        flashcardSets = FlashcardSet.objects.filter(author=author)
        serializer = FlashcardSetSerializer(flashcardSets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FlashcardSetView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        body = json.loads(request.body)
        user = request.user
        author = Account.objects.get(user=user)
        subject = Subject.objects.get(pk=body["subject_id"])
        newFlashcardSet = FlashcardSet(author=author,
                                       title=body["title"],
                                       description=body["description"],
                                       subject=subject,
                                       modificationDate=timezone.now(),
                                       flashcardsCount=0)
        newFlashcardSet.save()
        newFlashcardSetId = newFlashcardSet.pk
        response = {"flashcardSetId": newFlashcardSetId}
        return Response(response, status=status.HTTP_201_CREATED)
    
    def get(self, request, pk):
        return Response(FlashcardSetSerializer(FlashcardSet.objects.get(pk=pk)).data)

    def put(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        body = json.loads(request.body)
        flashcardSet = FlashcardSet.objects.get(pk=pk)
        if author != flashcardSet.author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        subject = Subject.objects.get(pk=body["subjectId"])
        flashcardSet.title = body["title"]
        flashcardSet.description = body["description"]
        flashcardSet.subject = subject
        flashcardSet.modificationDate = timezone.now()
        flashcardSet.save()
        return Response(status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        fs = FlashcardSet.objects.get(pk=pk)
        if author != fs.author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        fs.delete()
        return Response(status=status.HTTP_200_OK)

class FlashcardSetFlashcardsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, setpk):
        return Response(FlashcardSerializer(Flashcard.objects.filter(flashcardSet=FlashcardSet.objects.get(pk=setpk)), many=True).data)
    
class FlashcardView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        body = json.loads(request.body)
        user = request.user
        author = Account.objects.get(user=user)
        flashcardSet = FlashcardSet.objects.get(author=author, pk=body["set_id"])
        if author != flashcardSet.author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        flashcardSet.flashcardsCount += 1
        flashcardSet.save()
        handle_xp(user, flashcardSet.subject, 2)
        flashcard = Flashcard(flashcardSet=flashcardSet, question="", answer="")
        flashcard.save()
        response = {"flashcardId": flashcard.pk}
        return Response(response, status=status.HTTP_201_CREATED)
    
    def get(self, request, pk):
        return Response(FlashcardSerializer(Flashcard.objects.get(pk=pk)).data)
    
    def put(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        body = json.loads(request.body)
        flashcard = Flashcard.objects.get(pk=pk)
        if author != flashcard.flashcardSet.author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        flashcard.question = body["question"]
        flashcard.answer = body["answer"]
        flashcard.save()
        return Response(status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        user = request.user
        author = Account.objects.get(user=user)
        flashcard = Flashcard.objects.get(pk=pk)
        flashcardSet = flashcard.flashcardSet
        if author != flashcardSet.author and author.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        flashcardSet.flashcardsCount -= 1
        flashcardSet.save()
        flashcard.delete()
        return Response(status=status.HTTP_200_OK)

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        notifications = Notification.objects.filter(receiver=account).order_by('-date')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        data = request.body.decode('utf-8')
        data = json.loads(data)
        for pk in data["pks"]:
            notification = Notification.objects.get(pk=pk)
            if account != notification.receiver and account.isAdmin == False:
                return Response(status=status.HTTP_403_FORBIDDEN)
            notification.read = True
            notification.save()
        return Response(status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        user = request.user
        account = Account.objects.get(user=user)
        notification = Notification.objects.get(pk=pk)
        if account != notification.receiver and account.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        notification.delete()
        return Response(status=status.HTTP_200_OK)
    
class AccountsToCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, coursepk):
        user = request.user
        account = Account.objects.get(user=user)
        course = Course.objects.get(pk=coursepk)
        if AccountsToCourses.objects.filter(account=account, course=course).count() > 0:
            accountsToCourses = AccountsToCourses.objects.get(account=account, course=course)
            serializer = AccountsToCoursesSerializer(accountsToCourses)
            return Response(serializer.data)
        return Response([])
    
    def post(self, request, coursepk):
        user = request.user
        account = Account.objects.get(user=user)
        course = Course.objects.get(pk=coursepk)

        with transaction.atomic():
            accounts_to_courses, created = AccountsToCourses.objects.get_or_create(
                account=account,
                course=course,
                defaults={
                    'progress': 0,
                    'completed': False,
                    'lastTimeViewed': timezone.now()
                }
            )
            if not created:
                accounts_to_courses.progress = 0
                accounts_to_courses.lastTimeViewed = timezone.now()
                accounts_to_courses.save()

        return Response(status=status.HTTP_200_OK)
    
    def put(self, request, coursepk):
        user = request.user
        account = Account.objects.get(user=user)
        course = Course.objects.get(pk=coursepk)

        with transaction.atomic():
            accounts_to_courses, created = AccountsToCourses.objects.get_or_create(
                account=account,
                course=course
            )
            try:
                body = json.loads(request.body)
                accounts_to_courses.progress = body.get("progress", accounts_to_courses.progress)
                accounts_to_courses.completed = body.get("completed", accounts_to_courses.completed)
            except json.JSONDecodeError:
                pass
            
            accounts_to_courses.lastTimeViewed = timezone.now()
            accounts_to_courses.save()

        return Response(status=status.HTTP_200_OK)

class AllAccountsToCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        accountsToCourses = AccountsToCourses.objects.filter(account=account)
        serializer = AccountsToCoursesSerializer(accountsToCourses, many=True)
        return Response(serializer.data)

class SpecificSlideAccountsToCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, coursepk, slidenum):
        user = request.user
        account = Account.objects.get(user=user)
        course = Course.objects.get(pk=coursepk)
        accountsToCourses = AccountsToCourses.objects.get(account=account, course=course)
        if accountsToCourses.account != account and account.isAdmin == False:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if slidenum > accountsToCourses.progress:
            accountsToCourses.progress = slidenum
        if slidenum == course.slidesCount:
            accountsToCourses.completed = True
        accountsToCourses.lastTimeViewed = timezone.now()
        accountsToCourses.save()
        return Response(status=status.HTTP_200_OK)
    
class MyFriendsToSubjectsListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        friend_requests_sent = FriendRequest.objects.filter(sender=account, accepted=True)
        friend_requests_received = FriendRequest.objects.filter(receiver=account, accepted=True)
        friends = set()
        for r in friend_requests_sent:
            friends.add(r.receiver)
        for r in friend_requests_received:
            friends.add(r.sender)
        friends.add(account)
        my_friends_to_subjects = []
        for f in friends:
            subjects_to_accounts = SubjectsToAccounts.objects.filter(account=f)
            my_friends_to_subjects.extend(subjects_to_accounts)
        all_subjects = Subject.objects.all()
        lista = []
        for s in all_subjects:
            serializer = SubjectSerializer(s)
            d = serializer.data
            d["stats"]=[]
            for fts in my_friends_to_subjects:
                if fts.subject == s:
                    sta_ser = SubjectsToAccountsSerializer(fts)
                    sta_d = sta_ser.data
                    d["stats"].append(sta_d)
            lista.append(d)
        return Response(lista)
    
class AllUserActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        user_activity = UserActivity.objects.filter(account=account)
        serializer = UserActivitySerializer(user_activity, many=True)
        return Response(serializer.data)
    
class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        body = json.loads(request.body)
        account = Account.objects.get(user=user)
        with transaction.atomic():
            ua, created = UserActivity.objects.select_for_update().get_or_create(account=account, activityDate=timezone.now().date(), defaults={'secondsActive': 0})
            ua.secondsActive += body["seconds"]
            ua.save()
        return Response(status=status.HTTP_200_OK)
    
class ImportFlashcardsFromCSVView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        user = request.user
        account = Account.objects.get(user=user)
        fs = FlashcardSet.objects.get(pk=pk, author=account)
        
        file = request.FILES['file']
        file_path = default_storage.save(file.name, ContentFile(file.read()))

        try:
            with default_storage.open(file_path, 'r') as f:
                reader = csv.reader(f, delimiter=';')
                for row in reader:
                    if len(row) == 2:
                        q, a = row
                        Flashcard.objects.create(flashcardSet=fs, question=q, answer=a)
                        fs.flashcardsCount += 1
                        handle_xp(user, fs.subject, 2)
            
            fs.save()
            return Response(status=status.HTTP_200_OK)
        
        finally:
            if default_storage.exists(file_path):
                default_storage.delete(file_path)

class ExportFlashcardsToCSVView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        user = request.user
        account = Account.objects.get(user=user)
        fs = FlashcardSet.objects.get(pk=pk)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="flashcards_{fs.id}.csv"'

        writer = csv.writer(response, delimiter=';')
        #writer.writerow(['Question', 'Answer'])

        flashcards = Flashcard.objects.filter(flashcardSet=fs)
        for flashcard in flashcards:
            writer.writerow([flashcard.question, flashcard.answer])

        return response

class ToggleRankingShownView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        account.rankingShown = not account.rankingShown
        account.save()
        return Response(status=status.HTTP_200_OK)
    
class GenerateCertificateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        user = request.user
        account = Account.objects.get(user=user)
        course = Course.objects.get(pk=pk)
        if AccountsToCourses.objects.filter(course=course, account=account, completed=True).count() == 0:
            return Response(status=status.HTTP_403_FORBIDDEN)
        course = Course.objects.get(id=pk)
        obrazek = finders.find('kurs.png')
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{course.title}_{user.username}.pdf"'
        buffer = BytesIO()
        width, height = letter
        p = canvas.Canvas(buffer, pagesize=letter)
        p.drawImage(obrazek, 0, 0, width=612, height=792)

        p.setFont("Helvetica", 12)
        p.drawString(450, 733, f"{timezone.now().strftime('%Y-%m-%d')}")

        p.setFont("Helvetica", 18)
        user_text_width = p.stringWidth(user.username, "Helvetica", 18)
        user_x_position = (width - user_text_width) / 2
        p.drawString(user_x_position-8, 617, user.username)

        course_text_width = p.stringWidth(course.title, "Helvetica", 18)
        course_x_position = (width - course_text_width) / 2
        p.drawString(course_x_position-8, 555, f"{course.title}")

        p.setFont("Helvetica-Oblique", 8)
        subject_text_width = p.stringWidth(course.subject.name, "Helvetica", 10)
        course_x_position = (width - subject_text_width) / 2
        p.drawString(course_x_position, 504, f"{course.subject.name}")

        p.showPage()
        p.save()
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        return response