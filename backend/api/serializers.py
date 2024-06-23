from rest_framework import serializers

from .models import *
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class AccountSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = Account
        fields = ('id', 'user', 'creationDate', 'avatar', 'totalSecondsActivity', 'rankingShown', 'isAdmin')
    def get_user(self, obj):
        return UserSerializer(obj.user).data

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()
    class Meta:
        model = FriendRequest
        fields = ('id', 'sender', 'receiver', 'sentDate', 'accepted')
    def get_sender(self, obj):
        return AccountSerializer(obj.sender).data
    def get_receiver(self, obj):
        return AccountSerializer(obj.receiver).data
    
class NotificationSerializer(serializers.ModelSerializer):
    receiver = serializers.SerializerMethodField()
    class Meta:
        model = Notification
        fields = ('id', 'receiver', 'message', 'date', 'read', 'url')
    def get_receiver(self, obj):
        return AccountSerializer(obj.receiver).data
    
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'name')

class SubjectsToAccountsSerializer(serializers.ModelSerializer):
    account = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    class Meta:
        model = SubjectsToAccounts
        fields = ('id', 'account', 'subject', 'xp', 'level')
    def get_account(self, obj):
        return AccountSerializer(obj.account).data
    def get_subject(self, obj):
        return SubjectSerializer(obj.subject).data

class FlashcardSetSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    author_subject_info = serializers.SerializerMethodField()
    class Meta:
        model = FlashcardSet
        fields = ('id', 'author', 'author_subject_info', 'title', 'description', 'subject', 'modificationDate', 'flashcardsCount')
    def get_author(self, obj):
        return AccountSerializer(obj.author).data
    def get_subject(self, obj):
        return SubjectSerializer(obj.subject).data
    def get_author_subject_info(self, obj):
        sta = SubjectsToAccounts.objects.get(subject=obj.subject, account=obj.author)
        return SubjectsToAccountsSerializer(sta).data

class FlashcardSerializer(serializers.ModelSerializer):
    flashcardSet = serializers.SerializerMethodField()
    class Meta:
        model = Flashcard
        fields = ('id', 'flashcardSet', 'question', 'answer')
    def get_flashcardSet(self, obj):
        return FlashcardSetSerializer(obj.flashcardSet).data

class CourseSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    author_subject_info = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = ('id', 'author', 'author_subject_info', 'subject', 'slidesCount', 'title', 'modificationDate', 'description', 'image', 'accepted')
    def get_author(self, obj):
        return AccountSerializer(obj.author).data
    def get_subject(self, obj):
        return SubjectSerializer(obj.subject).data
    def get_author_subject_info(self, obj):
        sta = SubjectsToAccounts.objects.get(subject=obj.subject, account=obj.author)
        return SubjectsToAccountsSerializer(sta).data

class SlideSerializer(serializers.ModelSerializer):
    course = serializers.SerializerMethodField()
    class Meta:
        model = Slide
        fields = ('id', 'slideNumber', 'course', 'title', 'image', 'content')
    def get_course(self, obj):
        return CourseSerializer(obj.course).data

class ChatMessageSerializer(serializers.ModelSerializer):
    slide = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    class Meta:
        model = ChatMessage
        fields = ('id', 'slide', 'author', 'date', 'content')
    def get_slide(self, obj):
        return SlideSerializer(obj.slide).data
    def get_author(self, obj):
        return AccountSerializer(obj.author).data

class ThreadSerializer(serializers.ModelSerializer):
    subject = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    author_subject_info = serializers.SerializerMethodField()
    class Meta:
        model = Thread
        fields = ('id', 'subject', 'author', 'author_subject_info', 'creationDate', 'title', 'content', 'lastCommentDate', 'commentsCount', 'likesCount', 'dislikesCount')
    def get_subject(self, obj):
        return SubjectSerializer(obj.subject).data
    def get_author(self, obj):
        return AccountSerializer(obj.author).data
    def get_author_subject_info(self, obj):
        return SubjectsToAccountsSerializer(obj.author_subject_info).data

class ThreadAnswerSerializer(serializers.ModelSerializer):
    thread = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    author_subject_info = serializers.SerializerMethodField()
    class Meta:
        model = ThreadAnswer
        fields = ('id', 'thread', 'author', 'author_subject_info', 'date', 'content', 'likesCount', 'dislikesCount')
    def get_thread(self, obj):
        return ThreadSerializer(obj.thread).data
    def get_author(self, obj):
        return AccountSerializer(obj.author).data
    def get_author_subject_info(self, obj):
        return SubjectsToAccountsSerializer(obj.author_subject_info).data

class AccountsToThreadsSerializer(serializers.ModelSerializer):
    account = serializers.SerializerMethodField()
    thread = serializers.SerializerMethodField()
    class Meta:
        model = AccountsToThreads
        fields = ('id', 'account', 'thread', 'state')
    def get_account(self, obj):
        return AccountSerializer(obj.account).data
    def get_thread(self, obj):
        return ThreadSerializer(obj.thread).data

class AccountstoThreadAnswersSerializer(serializers.ModelSerializer):
    account = serializers.SerializerMethodField()
    threadAnswer = serializers.SerializerMethodField()
    class Meta:
        model = AccountsToThreadAnswers
        fields = ('id', 'account', 'threadAnswer', 'state')
    def get_account(self, obj):
        return AccountSerializer(obj.account).data
    def get_threadAnswer(self, obj):
        return ThreadAnswerSerializer(obj.threadAnswer).data
    
class AccountsToCoursesSerializer(serializers.ModelSerializer):
    account = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    class Meta:
        model = AccountsToCourses
        fields = ('id', 'account', 'course', 'progress', 'completed', 'lastTimeViewed')
    def get_account(self, obj):
        return AccountSerializer(obj.account).data
    def get_course(self, obj):
        return CourseSerializer(obj.course).data
    
class UserActivitySerializer(serializers.ModelSerializer):
    account = serializers.SerializerMethodField()
    class Meta:
        model = UserActivity
        fields = ('id', 'account', 'activityDate', 'secondsActive')
    def get_account(self, obj):
        return AccountSerializer(obj.account).data