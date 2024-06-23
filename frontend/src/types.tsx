type User = {
    id: number;
    username: string;
    email: string;
}

type Account = {
    id: number;
    user: User;
    creationDate: Date;
    avatar: string;
    subjects: Array<SubjectsToAccounts>;
    totalSecondsActivity: number;
    rankingShown: boolean;
    isAdmin: boolean;
}

type FriendRequest = {
    id: number;
    sender: Account;
    receiver: Account;
    sentDate: Date;
    accepted: boolean;
}

type NotificationType = { // musi tak byc, inaczej kolizja z TSowym interface
    id: number;
    receiver: Account;
    message: string;
    date: string;
    read: boolean;
    url: string;
}

type Subject = {
    id: number;
    name: string;
}

type SubjectsToAccounts = {
    id: number;
    account: Account;
    subject: Subject;
    xp: number;
    level: number;
}

type SubjectsToAccountsWithNextLevelThreshold = {
    id: number;
    account: Account;
    subject: Subject;
    xp: number;
    level: number;
    nextLevelThreshold: number;
}

type FlashcardSet = {
    id: number;
    author: Account;
    author_subject_info: SubjectsToAccounts;
    title: string;
    description: string;
    subject: Subject;
    modificationDate: Date;
    flashcardsCount: number;
}

type Flashcard = {
    id: number;
    flashcardSet: FlashcardSet;
    question: string;
    answer: string;
}

type Course = {
    id: number;
    author: Account;
    author_subject_info: SubjectsToAccounts;
    subject: Subject;
    slidesCount: number;
    title: string;
    modificationDate: Date;
    description: string;
    image: string;
    accepted: boolean;
}

type Slide = {
    id: number;
    course: Course;
    slideNumber: number;
    title: string;
    image: string;
    content: string;
}

type ChatMessage = {
    id: number;
    slide: Slide;
    author: Account;
    date: Date;
    content: string;
}

type Thread = {
    id: number;
    subject: Subject;
    author: Account;
    author_subject_info: SubjectsToAccounts;
    creationDate: Date;
    title: string;
    content: string;
    lastCommentDate: Date;
    commentsCount: number;
    likesCount: number;
    dislikesCount: number;
}

type ThreadAnswer = {
    id: number;
    thread: Thread;
    author: Account;
    author_subject_info: SubjectsToAccounts;
    date: Date;
    content: string;
    likesCount: number;
    dislikesCount: number;
}

type AccountsToThreads = {
    id: number;
    account: Account;
    thread: Thread;
    state: number;
}

type AccountsToThreadAnswers = {
    id: number;
    account: Account;
    threadAnswer: ThreadAnswer;
    state: number;
}

type AccountsToCourses = {
    id: number;
    account: Account;
    course: Course;
    progress: number;
    completed: boolean;
    lastTimeViewed: Date;
}

type UserActivity = {
    id: number;
    account: Account;
    activityDate: Date;
    secondsActive: number;
}