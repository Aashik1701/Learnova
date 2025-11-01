import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome back',
      dashboard: 'Dashboard',
      lessons: 'Lessons',
      practice: 'Practice',
      peers: 'Peers',
      passports: 'Learning Passports',
      recommendedLessons: 'Recommended Lessons',
      progressTracker: 'Progress Tracker',
      recentActivity: 'Recent Activity',
      loading: 'Loading...',
      error: 'An error occurred',
      generateLesson: 'Generate New Lesson',
      startPractice: 'Start Practice',
      logout: 'Logout',
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido de nuevo',
      dashboard: 'Panel',
      lessons: 'Lecciones',
      practice: 'Práctica',
      peers: 'Compañeros',
      passports: 'Pasaportes de Aprendizaje',
      recommendedLessons: 'Lecciones Recomendadas',
      progressTracker: 'Seguimiento de Progreso',
      recentActivity: 'Actividad Reciente',
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      generateLesson: 'Generar Nueva Lección',
      startPractice: 'Comenzar Práctica',
      logout: 'Cerrar Sesión',
    }
  },
  hi: {
    translation: {
      welcome: 'वापसी पर स्वागत है',
      dashboard: 'डैशबोर्ड',
      lessons: 'पाठ',
      practice: 'अभ्यास',
      peers: 'सहपाठी',
      passports: 'सीखने के पासपोर्ट',
      recommendedLessons: 'अनुशंसित पाठ',
      progressTracker: 'प्रगति ट्रैकर',
      recentActivity: 'हाल की गतिविधि',
      loading: 'लोड हो रहा है...',
      error: 'एक त्रुटि हुई',
      generateLesson: 'नया पाठ बनाएं',
      startPractice: 'अभ्यास शुरू करें',
      logout: 'लॉग आउट',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
