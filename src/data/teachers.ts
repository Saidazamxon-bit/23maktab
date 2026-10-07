export type TeacherSubject = 'Matematika' | 'Ona tili' | 'Ingliz tili' | 'Tarix' | 'Informatika';

export interface TeacherProfile {
  id: string;
  name: string;
  subject: TeacherSubject;
  role: string;
  experience: string;
  bio: string;
  image: string;
}

export const teachers: TeacherProfile[] = [
  {
    id: '1',
    name: 'Dilnoza Karimova',
    subject: 'Matematika',
    role: 'Boshlang‘ich va o‘rta ta’lim bo‘yicha matematika o‘qituvchisi',
    experience: '8 yillik tajriba',
    bio: 'O‘quvchilarda mantiqiy fikrlash va analitik ko‘nikmalarni rivojlantirishga yo‘naltirilgan ta’lim uslubini qo‘llaydi.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '2',
    name: 'Muhammadjon Samadov',
    subject: 'Informatika',
    role: 'IT labaratoriyasi rahbari',
    experience: '10 yillik tajriba',
    bio: 'Texnologiya va zamonaviy dasturiy vositalar asosida o‘quvchilarni innovatsion fikrlashga undaydi.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '3',
    name: 'Nargiza Rakhimova',
    subject: 'Ona tili',
    role: 'Adabiyot fani o‘qituvchisi',
    experience: '7 yillik tajriba',
    bio: 'Maqola va nutq madaniyatini rivojlantirishga qaratilgan interaktiv darslar olib boradi.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '4',
    name: 'Javohir Toshmatov',
    subject: 'Ingliz tili',
    role: 'Xalqaro ta’lim dasturi koordinatori',
    experience: '9 yillik tajriba',
    bio: 'Chet tillarini ommabop qo‘llash va muloqot ko‘nikmalarini mustahkamlashga e’tibor beradi.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '5',
    name: 'Shaxnoza Ergasheva',
    subject: 'Tarix',
    role: 'Tarix fani o‘qituvchisi',
    experience: '6 yillik tajriba',
    bio: 'Keng qamrovli tarixiy materiallar orqali o‘quvchilarda zamonaviy dunyoqarashni shakllantiradi.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '6',
    name: 'Akbar Mavlonov',
    subject: 'Matematika',
    role: 'Olimpiada tayyorgarligi bo‘yicha ustoz',
    experience: '11 yillik tajriba',
    bio: 'Yoshlar ichida ilmiy fikrlashni rivojlantirish, masalalarni yechish qobiliyatini oshirishga xizmat qiladi.',
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80',
  },
]
