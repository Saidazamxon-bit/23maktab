export type Language = 'uz' | 'ru' | 'en';

export interface TeacherItem {
  id: string;
  name: string;
  subjectKey: 'math' | 'cs' | 'english' | 'physics';
  subject: string;
  role: string;
  initials: string;
}

export interface NewsItem {
  id: string;
  category: string;
  title: string;
  date: string;
  image: string;
}

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  place: string;
}

export interface ValueItem {
  num: string;
  title: string;
  desc: string;
}

export interface EducationCard {
  id: string;
  title: string;
  desc: string;
  link?: string;
}

export interface ShowcaseCard {
  id: number;
  number: string;
  title: string;
  description: string;
  image: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface ScheduleDays {
  [key: string]: string;
}

export interface ScheduleSubjects {
  [key: string]: string;
}

export interface Translations {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    name: string;
    sub: string;
    tagline: string;
  };
  nav: {
    home: string;
    about: string;
    education: string;
    news: string;
    events: string;
    contact: string;
    login: string;
    searchLabel: string;
    searchPlaceholder: string;
    themeToggle: string;
    menuToggle: string;
    closeSearch: string;
    teachers: string;
    schedule: string;
    noSearchResults: string;
  };
  aboutPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    label: string;
    introTitle: string;
    intro1: string;
    intro2: string;
    statsLabel: string;
    statsTitle: string;
    statsText: string;
    valuesTitle: string;
    environmentLabel: string;
    environmentTitle: string;
    environmentItems: Array<{ title: string; description: string }>;
    goalLabel: string;
    goalTitle: string;
    metricsLabel: string;
    metricsTitle: string;
    metrics: string[];
  };
  teachersPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    placeholder: string;
    emptyState: string;
    allSubjects: string;
    loadError: string;
  };
  schedulePage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sampleBadge: string;
    chooseClassLabel: string;
    time: string;
    subject: string;
    teacher: string;
    room: string;
    noClasses: string;
    noLessons: string;
    loadError: string;
    retry: string;
    lessonNo: string;
    liveLive: string;
    liveNowL: string;
    liveNextL: string;
    liveEndsIn: string;
    liveStartsIn: string;
    liveBrk: string;
    liveBefore: string;
    liveDone: string;
    liveSunday: string;
    liveNoToday: string;
    liveAt: string;
    liveNoNext: string;
    freeDay: string;
    bells: string;
    loading: string;
    days: string[];
  };
  hero: {
    eyebrow: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    description: string;
    btnAbout: string;
    btnNews: string;
    studentsCount: string;
    studentsLabel: string;
    badgeExpYears: string;
    badgeExpLabel: string;
    badgeResultRate: string;
    badgeResultLabel: string;
    imageAlt: string;
  };
  stats: {
    studentsValue: string;
    studentsLabel: string;
    teachersValue: string;
    teachersLabel: string;
    classesValue: string;
    classesLabel: string;
    achievementsValue: string;
    achievementsLabel: string;
  };
  about: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    headingEnd: string;
    description: string;
    quote: string;
    photoAlt: string;
    values: ValueItem[];
  };
  education: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    headingEnd: string;
    description: string;
    cards: EducationCard[];
  };
  showcase?: {
    empty: string;
    label: string;
    headingStart: string;
    headingHighlight: string;
    description: string;
    cards: ShowcaseCard[];
  };
  teachers: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    description: string;
    viewAll: string;
    showMore: string;
    showLess: string;
    filterAll: string;
    filters: {
      math: string;
      cs: string;
      english: string;
      physics: string;
    };
    list: TeacherItem[];
  };
  news: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    viewAll: string;
    readMore: string;
    empty: string;
    list: NewsItem[];
  };
  events: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    openCalendar: string;
    list: EventItem[];
  };
  achievements: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    headingEnd: string;
    description: string;
    viewAll: string;
    number: string;
    numberLabel: string;
  };
  contact: {
    label: string;
    headingStart: string;
    headingHighlight: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    form: {
      namePlaceholder: string;
      phonePlaceholder: string;
      emailPlaceholder: string;
      messagePlaceholder: string;
      submitBtn: string;
      sending: string;
      successMessage: string;
      errorMessage: string;
    };
  };
  footer: {
    siteCol: string;
    educationCol: string;
    contactCol: string;
    socialCol: string;
    timetable: string;
    materials: string;
    olympiads: string;
    address: string;
    copyright: string;
  };
  admin: Record<string, string>;
  features?: FeatureItem[];
  scheduleDays?: ScheduleDays;
  scheduleSubjects?: ScheduleSubjects;
}
