import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

type Locale = 'en' | 'bn';

const translations: Record<Locale, Record<string, string>> = {
    en: {
        // Common
        'app.name': 'Karnaphuli Alpha Academy',
        'app.tagline': 'Coaching Center Management',
        
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.students': 'Students',
        'nav.batches': 'Batches',
        'nav.teachers': 'Teachers',
        'nav.attendance': 'Attendance',
        'nav.fees': 'Fees',
        'nav.coaching_classes': 'Classes',
        'nav.settings': 'Settings',
        
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.total_students': 'Total Students',
        'dashboard.active_batches': 'Active Batches',
        'dashboard.total_collected': 'Total Collected',
        'dashboard.recent_payments': 'Recent Payments',
        'dashboard.recent_students': 'Recent Students',
        
        // Students
        'students.title': 'Students',
        'students.create': 'Add Student',
        'students.edit': 'Edit Student',
        'students.name': 'Name',
        'students.phone': 'Phone',
        'students.class': 'Class',
        'students.section': 'Section',
        'students.joined_at': 'Joined At',
        'students.left_at': 'Left At',
        'students.date_of_birth': 'Date of Birth',
        'students.gender': 'Gender',
        'students.status': 'Status',
        'students.address': 'Address',
        'students.guardian_name': 'Guardian Name',
        'students.guardian_phone': 'Guardian Phone',
        'students.male': 'Male',
        'students.female': 'Female',
        'students.other': 'Other',
        'students.active': 'Active',
        'students.inactive': 'Inactive',
        
        // Batches
        'batches.title': 'Batches',
        'batches.create': 'Add Batch',
        'batches.name': 'Name',
        'batches.subject': 'Subject',
        'batches.schedule': 'Schedule',
        'batches.capacity': 'Capacity',
        'batches.enrolled': 'Enrolled',
        
        // Teachers
        'teachers.title': 'Teachers',
        'teachers.create': 'Add Teacher',
        'teachers.name': 'Name',
        'teachers.email': 'Email',
        'teachers.phone': 'Phone',
        
        // Attendance
        'attendance.title': 'Attendance',
        'attendance.mark': 'Mark Attendance',
        'attendance.batch': 'Batch',
        'attendance.date': 'Date',
        'attendance.student': 'Student',
        'attendance.status': 'Status',
        'attendance.present': 'Present',
        'attendance.absent': 'Absent',
        'attendance.late': 'Late',
        'attendance.notes': 'Notes',
        'attendance.mark_all_present': 'Mark All Present',
        'attendance.mark_all_absent': 'Mark All Absent',
        'attendance.clear_all': 'Clear All',
        'attendance.save': 'Save Attendance',
        
        // Fees
        'fees.title': 'Fee Management',
        'fees.create': 'Add Fee Record',
        'fees.student': 'Student',
        'fees.batch': 'Batch',
        'fees.month': 'Month',
        'fees.year': 'Year',
        'fees.amount_paid': 'Amount Paid',
        'fees.total_paid': 'Total Paid',
        'fees.export': 'Export to Excel',
        'fees.payment_history': 'Payment History',
        
        // Classes
        'classes.title': 'Coaching Classes',
        'classes.create': 'Add Class',
        'classes.name': 'Name',
        'classes.default_fee': 'Default Fee',
        
        // Actions
        'actions.save': 'Save',
        'actions.cancel': 'Cancel',
        'actions.edit': 'Edit',
        'actions.delete': 'Delete',
        'actions.view': 'View',
        'actions.view_all': 'View all',
        'actions.search': 'Search',
        'actions.back': 'Back',
        
        // Months
        'month.january': 'January',
        'month.february': 'February',
        'month.march': 'March',
        'month.april': 'April',
        'month.may': 'May',
        'month.june': 'June',
        'month.july': 'July',
        'month.august': 'August',
        'month.september': 'September',
        'month.october': 'October',
        'month.november': 'November',
        'month.december': 'December',
    },
    bn: {
        // Common
        'app.name': 'কর্ণফুলী আলফা একাডেমি',
        'app.tagline': 'কোচিং সেন্টার ম্যানেজমেন্ট',
        
        // Navigation
        'nav.dashboard': 'ড্যাশবোর্ড',
        'nav.students': 'ছাত্রছাত্রী',
        'nav.batches': 'ব্যাচ',
        'nav.teachers': 'শিক্ষক',
        'nav.attendance': 'উপস্থিতি',
        'nav.fees': 'বেতন',
        'nav.coaching_classes': 'ক্লাস',
        'nav.settings': 'সেটিংস',
        
        // Dashboard
        'dashboard.title': 'ড্যাশবোর্ড',
        'dashboard.total_students': 'মোট ছাত্রছাত্রী',
        'dashboard.active_batches': 'সক্রিয় ব্যাচ',
        'dashboard.total_collected': 'মোট সংগৃহীত',
        'dashboard.recent_payments': 'সাম্প্রতিক বেতন',
        'dashboard.recent_students': 'সাম্প্রতিক ছাত্রছাত্রী',
        
        // Students
        'students.title': 'ছাত্রছাত্রী',
        'students.create': 'ছাত্র যোগ করুন',
        'students.edit': 'ছাত্র সম্পাদনা',
        'students.name': 'নাম',
        'students.phone': 'ফোন',
        'students.class': 'ক্লাস',
        'students.section': 'শাখা',
        'students.joined_at': 'যোগদানের তারিখ',
        'students.left_at': 'ছাড়ার তারিখ',
        'students.date_of_birth': 'জন্ম তারিখ',
        'students.gender': 'লিঙ্গ',
        'students.status': 'অবস্থা',
        'students.address': 'ঠিকানা',
        'students.guardian_name': 'অভিভাবকের নাম',
        'students.guardian_phone': 'অভিভাবকের ফোন',
        'students.male': 'পুরুষ',
        'students.female': 'মহিলা',
        'students.other': 'অন্যান্য',
        'students.active': 'সক্রিয়',
        'students.inactive': 'নিষ্ক্রিয়',
        
        // Batches
        'batches.title': 'ব্যাচ',
        'batches.create': 'ব্যাচ যোগ করুন',
        'batches.name': 'নাম',
        'batches.subject': 'বিষয়',
        'batches.schedule': 'সময়সূচী',
        'batches.capacity': 'ক্ষমতা',
        'batches.enrolled': 'ভর্তি',
        
        // Teachers
        'teachers.title': 'শিক্ষক',
        'teachers.create': 'শিক্ষক যোগ করুন',
        'teachers.name': 'নাম',
        'teachers.email': 'ইমেইল',
        'teachers.phone': 'ফোন',
        
        // Attendance
        'attendance.title': 'উপস্থিতি',
        'attendance.mark': 'উপস্থিতি নির্ধারণ',
        'attendance.batch': 'ব্যাচ',
        'attendance.date': 'তারিখ',
        'attendance.student': 'ছাত্র',
        'attendance.status': 'অবস্থা',
        'attendance.present': 'উপস্থিত',
        'attendance.absent': 'অনুপস্থিত',
        'attendance.late': 'বিলম্বিত',
        'attendance.notes': 'মন্তব্য',
        'attendance.mark_all_present': 'সকল উপস্থিত',
        'attendance.mark_all_absent': 'সকল অনুপস্থিত',
        'attendance.clear_all': 'সব মুছুন',
        'attendance.save': 'উপস্থিতি সংরক্ষণ',
        
        // Fees
        'fees.title': 'বেতন ব্যবস্থাপনা',
        'fees.create': 'বেতন রেকর্ড যোগ করুন',
        'fees.student': 'ছাত্র',
        'fees.batch': 'ব্যাচ',
        'fees.month': 'মাস',
        'fees.year': 'বছর',
        'fees.amount_paid': 'পরিশোধিত পরিমাণ',
        'fees.total_paid': 'মোট পরিশোধিত',
        'fees.export': 'এক্সেলে রপ্তানি',
        'fees.payment_history': 'বেতনের ইতিহাস',
        
        // Classes
        'classes.title': 'কোচিং ক্লাস',
        'classes.create': 'ক্লাস যোগ করুন',
        'classes.name': 'নাম',
        'classes.default_fee': 'ডিফল্ট বেতন',
        
        // Actions
        'actions.save': 'সংরক্ষণ',
        'actions.cancel': 'বাতিল',
        'actions.edit': 'সম্পাদনা',
        'actions.delete': 'মুছুন',
        'actions.view': 'দেখুন',
        'actions.view_all': 'সব দেখুন',
        'actions.search': 'অনুসন্ধান',
        'actions.back': 'পিছনে',
        
        // Months
        'month.january': 'জানুয়ারি',
        'month.february': 'ফেব্রুয়ারি',
        'month.march': 'মার্চ',
        'month.april': 'এপ্রিল',
        'month.may': 'মে',
        'month.june': 'জুন',
        'month.july': 'জুলাই',
        'month.august': 'আগস্ট',
        'month.september': 'সেপ্টেম্বর',
        'month.october': 'অক্টোবর',
        'month.november': 'নভেম্বর',
        'month.december': 'ডিসেম্বর',
    },
};

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('locale') as Locale) || 'en';
        }

        return 'en';
    });

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string): string => {
        return translations[locale][key] || translations.en[key] || key;
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }

    return context;
}
