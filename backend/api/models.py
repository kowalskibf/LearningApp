from django.db import models

from django.contrib.auth.models import User

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    creationDate = models.DateTimeField()
    avatar = models.FileField(upload_to='course_images/', blank=True, null=True)
    totalSecondsActivity = models.IntegerField(default=0)
    rankingShown = models.BooleanField(default=True)
    isAdmin = models.BooleanField(default=False)

@receiver(post_save, sender=User, dispatch_uid="create_account")
def create_account(sender, instance, **kwargs):
    print(sender)
    print(instance)
    if not Account.objects.filter(user=instance):
        Account(user=instance, creationDate=timezone.now()).save()

class FriendRequest(models.Model):
    sender = models.ForeignKey(Account, related_name='friend_request_sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Account, related_name='friend_request_receiver',on_delete=models.CASCADE)
    sentDate = models.DateTimeField()
    accepted = models.BooleanField(default=False)

class Notification(models.Model):
    receiver = models.ForeignKey(Account, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    date = models.DateTimeField()
    read = models.BooleanField(default=False)
    url = models.CharField(max_length=255, default="")

class Subject(models.Model):
    name = models.CharField(max_length=255)

class SubjectsToAccounts(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    xp = models.IntegerField()
    level = models.IntegerField()

@receiver(post_save, sender=Account, dispatch_uid="create_subject_stats_on_new_account")
def create_subject_stats_on_new_account(sender, instance, **kwargs):
    if not SubjectsToAccounts.objects.filter(account=instance):
        for subject in SubjectsToAccounts.objects.all():
            SubjectsToAccounts(account=instance, subject=subject, xp=0, level=0).save()

@receiver(post_save, sender=Subject, dispatch_uid="create_subject_stats_on_new_subject")
def create_subject_stats_on_new_subject(sender, instance, **kwargs):
    if not SubjectsToAccounts.objects.filter(subject=instance):
        for account in Account.objects.all():
            SubjectsToAccounts(account=account, subject=instance, xp=0, level=0).save()

class FlashcardSet(models.Model):
    author = models.ForeignKey(Account, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    modificationDate = models.DateTimeField()
    flashcardsCount = models.IntegerField(default=0)

class Flashcard(models.Model):
    flashcardSet = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE)
    question = models.CharField(max_length=255)
    answer = models.CharField(max_length=255)

class Course(models.Model):
    author = models.ForeignKey(Account, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    slidesCount = models.IntegerField(default=0)
    title = models.CharField(max_length=255)
    modificationDate = models.DateTimeField()
    description = models.CharField(max_length=1023)
    image = models.FileField(upload_to='course_images/', blank=True, null=True)
    accepted = models.BooleanField(default=False)

class Slide(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    slideNumber = models.IntegerField(default=0)
    title = models.CharField(max_length=255)
    image = models.FileField(upload_to='slide_files/', blank=True, null=True)
    content = models.CharField(max_length=1023)

@receiver(post_save, sender=Slide, dispatch_uid="edit_course_modification_date_on_slide_save")
def edit_course_modification_date_on_slide_save(sender, instance, **kwargs):
    course = instance.course
    course.modificationDate = timezone.now()
    course.save()

class ChatMessage(models.Model):
    slide = models.ForeignKey(Slide, on_delete=models.CASCADE)
    author = models.ForeignKey(Account, on_delete=models.CASCADE)
    date = models.DateTimeField()
    content = models.CharField(max_length=255)

class Thread(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    author = models.ForeignKey(Account, on_delete=models.CASCADE)
    author_subject_info = models.ForeignKey(SubjectsToAccounts, on_delete=models.CASCADE, default=None, null=True, blank=True)
    creationDate = models.DateTimeField()
    title = models.CharField(max_length=255)
    content = models.CharField(max_length=1023, default='')
    lastCommentDate = models.DateTimeField(blank=True, null=True)
    commentsCount = models.IntegerField()
    likesCount = models.IntegerField()
    dislikesCount = models.IntegerField()

class ThreadAnswer(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, default=1)
    author = models.ForeignKey(Account, on_delete=models.CASCADE)
    author_subject_info = models.ForeignKey(SubjectsToAccounts, on_delete=models.CASCADE, default=None, null=True, blank=True)
    date = models.DateTimeField()
    content = models.CharField(max_length=1023)
    likesCount = models.IntegerField()
    dislikesCount = models.IntegerField()

@receiver(post_save, sender=ThreadAnswer, dispatch_uid="update_last_comment_date_after_thread_new_comment")
def update_last_comment_date_after_thread_new_comment(sender, instance, **kwargs):
    thread = instance.thread
    thread.lastCommentDate = timezone.now()
    thread.save()

class AccountsToThreads(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE)
    state = models.IntegerField()

class AccountsToThreadAnswers(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    threadAnswer = models.ForeignKey(ThreadAnswer, on_delete=models.CASCADE)
    state = models.IntegerField()

class AccountsToCourses(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    lastTimeViewed = models.DateTimeField(default=timezone.now)

class UserActivity(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    activityDate = models.DateField(default=timezone.now)
    secondsActive = models.IntegerField()